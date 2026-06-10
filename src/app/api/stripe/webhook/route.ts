import { NextResponse, type NextRequest } from "next/server";
import { getStripe, getPlanFromStripePrice } from "@/lib/billing/stripe";
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
      const interval = session.metadata?.interval || "monthly";
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
          billing_interval: interval,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: "active",
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Approximate, will be updated by invoice events
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id" },
      );

      // Check for open fraud flags before approving
      const { count: fraudCount } = await supabase
        .from("fraud_flags")
        .select("id", { count: "exact", head: true })
        .eq("resource_id", organizationId)
        .eq("status", "open");

      if (fraudCount === 0) {
        // Update organization status to approved
        await supabase
          .from("organizations")
          .update({ status: "approved", suspended_at: null, updated_at: new Date().toISOString() })
          .eq("id", organizationId);
      }

      // Log audit event
      await supabase.from("audit_logs").insert({
        action: "subscription_activated",
        resource_type: "subscription",
        resource_id: organizationId,
        metadata: { plan, stripe_subscription_id: subscriptionId },
      });
      break;
    }

    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string;
      const customerId = invoice.customer as string;

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

          // Upsert invoice record
          await supabase.from("invoices").upsert(
            {
              organization_id: subscription.organization_id,
              stripe_invoice_id: invoice.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              amount_due: invoice.amount_due,
              amount_paid: invoice.amount_paid,
              currency: invoice.currency,
              status: invoice.status || "paid",
              hosted_invoice_url: invoice.hosted_invoice_url,
              invoice_pdf: invoice.invoice_pdf,
              period_start: new Date(invoice.period_start * 1000).toISOString(),
              period_end: new Date(invoice.period_end * 1000).toISOString(),
            },
            { onConflict: "stripe_invoice_id" },
          );
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

    case "customer.subscription.created":
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

      const subRecord = subscription as unknown as Record<string, unknown>;
      const currentPeriodEnd = subRecord.current_period_end as number | undefined;
      const currentPeriodStart = subRecord.current_period_start as number | undefined;
      const cancelAtPeriodEnd = subRecord.cancel_at_period_end as boolean | undefined;
      const canceledAt = subRecord.canceled_at as number | undefined;
      
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const planInfo = priceId ? getPlanFromStripePrice(priceId) : undefined;

      const { data: updatedSub } = await supabase
        .from("subscriptions")
        .update({
          status: mappedStatus,
          ...(planInfo ? { plan_code: planInfo.plan, billing_interval: planInfo.interval } : {}),
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : undefined,
          current_period_start: currentPeriodStart
            ? new Date(currentPeriodStart * 1000).toISOString()
            : undefined,
          cancel_at_period_end: cancelAtPeriodEnd,
          canceled_at: canceledAt ? new Date(canceledAt * 1000).toISOString() : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId)
        .select("organization_id")
        .maybeSingle();

      if (updatedSub) {
        if (mappedStatus === "canceled" || mappedStatus === "unpaid") {
          await supabase.from("organizations").update({ status: "suspended", suspended_at: new Date().toISOString() }).eq("id", updatedSub.organization_id);
        } else if (mappedStatus === "active" || mappedStatus === "trialing") {
          // Check if not suspended by admin manually via fraud flags.
          const { data: org } = await supabase.from("organizations").select("status").eq("id", updatedSub.organization_id).single();
          const { count: fraudCount } = await supabase
            .from("fraud_flags")
            .select("id", { count: "exact", head: true })
            .eq("resource_id", updatedSub.organization_id)
            .eq("status", "open");

          if (org?.status === "suspended" && fraudCount === 0) {
            await supabase.from("organizations").update({ status: "approved", suspended_at: null }).eq("id", updatedSub.organization_id);
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      const { data: deletedSub } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId)
        .select("organization_id")
        .maybeSingle();

      if (deletedSub) {
        await supabase.from("organizations").update({ status: "suspended", suspended_at: new Date().toISOString() }).eq("id", deletedSub.organization_id);
      }
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
