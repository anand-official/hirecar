import Stripe from "stripe";
import { getAppUrl, requireEnv } from "@/lib/config";
import type { PlanCode } from "@/lib/types";

let stripeClient: Stripe | null = null;

export function getStripe() {
  stripeClient ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-04-22.dahlia",
  });

  return stripeClient;
}

export function getStripePrice(plan: PlanCode) {
  const priceEnvByPlan: Record<PlanCode, string> = {
    starter: "STRIPE_PRICE_STARTER",
    growth: "STRIPE_PRICE_GROWTH",
    pro: "STRIPE_PRICE_PRO",
  };

  return requireEnv(priceEnvByPlan[plan]);
}

export async function createCheckoutSession(input: {
  plan: PlanCode;
  organizationId: string;
  userId: string;
  email?: string;
}) {
  return getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    line_items: [{ price: getStripePrice(input.plan), quantity: 1 }],
    success_url: `${getAppUrl()}/vendor/billing?checkout=success`,
    cancel_url: `${getAppUrl()}/vendor/billing?checkout=cancelled`,
    client_reference_id: input.organizationId,
    metadata: {
      organization_id: input.organizationId,
      user_id: input.userId,
      plan: input.plan,
    },
    subscription_data: {
      metadata: {
        organization_id: input.organizationId,
        plan: input.plan,
      },
    },
  });
}
