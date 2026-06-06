import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { requireEnv } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id, processing_status")
    .eq("id", event.id)
    .maybeSingle();

  if (existing?.processing_status === "processed") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (existing?.processing_status === "processing") {
    return NextResponse.json(
      { error: "Webhook event is already being processed", eventId: event.id },
      { status: 409 },
    );
  }

  const receivedAt = new Date().toISOString();
  const processingPayload = {
    event_type: event.type,
    payload: event,
    processing_status: "processing",
    received_at: receivedAt,
    processed_at: null,
    last_error: null,
  };

  const claimResult = existing
    ? await supabase
        .from("stripe_webhook_events")
        .update(processingPayload)
        .eq("id", event.id)
        .eq("processing_status", "failed")
    : await supabase.from("stripe_webhook_events").insert({
        id: event.id,
        ...processingPayload,
      });

  if (claimResult.error) {
    console.error(`Failed to claim webhook event ${event.id}:`, claimResult.error.message);
    return NextResponse.json(
      { error: "Webhook processing could not be started", eventId: event.id },
      { status: 500 },
    );
  }

  // Process the event and update subscription state
  try {
    await processStripeEvent(event, supabase);

    const { error: subscriptionEventError } = await supabase.from("subscription_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
    });

    if (subscriptionEventError) {
      throw new Error(`Failed to record subscription event: ${subscriptionEventError.message}`);
    }

    const { error: processedError } = await supabase
      .from("stripe_webhook_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", event.id);

    if (processedError) {
      throw new Error(`Failed to mark webhook processed: ${processedError.message}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await supabase
      .from("stripe_webhook_events")
      .update({
        processing_status: "failed",
        last_error: errorMessage,
      })
      .eq("id", event.id);

    // Log the error to security_events for monitoring
    await supabase.from("security_events").insert({
      event_type: "webhook_processing_failed",
      metadata: {
        stripe_event_id: event.id,
        event_type: event.type,
        error: errorMessage,
      },
    });

    // Also log to console for immediate visibility
    console.error(`Webhook processing failed for ${event.id}:`, errorMessage);

    // Return 500 so Stripe will retry
    return NextResponse.json(
      { error: "Webhook processing failed", eventId: event.id },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function processStripeEvent(
  event: Stripe.Event,
  supabase: ReturnType<typeof createAdminClient>,
) {
  // Log that we're processing this event
  await supabase.from("audit_logs").insert({
    action: "webhook_processing_started",
    resource_type: "stripe_event",
    resource_id: event.id,
    metadata: {
      event_type: event.type,
      created_at: new Date().toISOString(),
    },
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.client_reference_id;
      const plan = session.metadata?.plan;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!organizationId || !plan || !subscriptionId) {
        console.error("Missing required data in checkout.session.completed", {
          organizationId,
          plan,
          subscriptionId,
        });
        return;
      }

      // Create or update subscription
      await supabase.from("subscriptions").upsert(
        {
          organization_id: organizationId,
          plan_code: plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: "active",
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Approximate, will be updated by invoice events
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id" },
      );

      // Update organization status to approved
      await supabase
        .from("organizations")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", organizationId);

      // Log audit event
      await supabase.from("audit_logs").insert({
        action: "subscription_activated",
        resource_type: "subscription",
        resource_id: organizationId,
        metadata: { plan, stripe_subscription_id: subscriptionId },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string;

      if (subscriptionId) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("organization_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (subscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: new Date(invoice.period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string;

      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      const statusMap: Record<string, string> = {
        active: "active",
        canceled: "canceled",
        incomplete: "incomplete",
        incomplete_expired: "canceled",
        past_due: "past_due",
        paused: "canceled",
        trialing: "trialing",
        unpaid: "unpaid",
      };

      const mappedStatus = statusMap[subscription.status] || "incomplete";

      const currentPeriodEnd = (subscription as unknown as Record<string, number>).current_period_end;

      await supabase
        .from("subscriptions")
        .update({
          status: mappedStatus,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);
      break;
    }

    case "checkout.session.expired": {
      // Log abandoned checkout for analytics
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.client_reference_id;

      if (organizationId) {
        await supabase.from("audit_logs").insert({
          action: "checkout_abandoned",
          resource_type: "subscription",
          resource_id: organizationId,
          metadata: {
            stripe_session_id: session.id,
            plan: session.metadata?.plan,
          },
        });
      }
      break;
    }

    default:
      // Log unhandled event types for monitoring
      console.info(`Unhandled Stripe event type: ${event.type}`);

      // Log to audit for visibility
      await supabase.from("audit_logs").insert({
        action: "webhook_unhandled_event_type",
        resource_type: "stripe_event",
        resource_id: event.id,
        metadata: {
          event_type: event.type,
        },
      });
  }
}
