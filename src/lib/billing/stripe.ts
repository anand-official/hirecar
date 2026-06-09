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

export function getStripePrice(plan: PlanCode, interval: "monthly" | "quarterly" = "monthly") {
  if (interval === "quarterly") {
    const priceEnvByPlan: Record<PlanCode, string> = {
      starter: "STRIPE_PRICE_STARTER_QUARTERLY",
      growth: "STRIPE_PRICE_GROWTH_QUARTERLY",
      pro: "STRIPE_PRICE_PRO_QUARTERLY",
    };
    return requireEnv(priceEnvByPlan[plan]);
  }

  const priceEnvByPlan: Record<PlanCode, string> = {
    starter: "STRIPE_PRICE_STARTER",
    growth: "STRIPE_PRICE_GROWTH",
    pro: "STRIPE_PRICE_PRO",
  };

  return requireEnv(priceEnvByPlan[plan]);
}

export function getPlanFromStripePrice(priceId: string): { plan: PlanCode; interval: "monthly" | "quarterly" } | null {
  // Monthly
  if (priceId === process.env.STRIPE_PRICE_STARTER) return { plan: "starter", interval: "monthly" };
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return { plan: "growth", interval: "monthly" };
  if (priceId === process.env.STRIPE_PRICE_PRO) return { plan: "pro", interval: "monthly" };
  
  // Quarterly
  if (priceId === process.env.STRIPE_PRICE_STARTER_QUARTERLY) return { plan: "starter", interval: "quarterly" };
  if (priceId === process.env.STRIPE_PRICE_GROWTH_QUARTERLY) return { plan: "growth", interval: "quarterly" };
  if (priceId === process.env.STRIPE_PRICE_PRO_QUARTERLY) return { plan: "pro", interval: "quarterly" };
  
  return null;
}

export async function createCheckoutSession(input: {
  plan: PlanCode;
  interval?: "monthly" | "quarterly";
  organizationId: string;
  userId: string;
  email?: string;
  customerId?: string;
  couponCode?: string;
}) {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: getStripePrice(input.plan, input.interval), quantity: 1 }],
    success_url: `${getAppUrl()}/vendor/billing?checkout=success`,
    cancel_url: `${getAppUrl()}/vendor/billing?checkout=cancelled`,
    client_reference_id: input.organizationId,
    allow_promotion_codes: true,
    metadata: {
      organization_id: input.organizationId,
      user_id: input.userId,
      plan: input.plan,
      interval: input.interval ?? "monthly",
    },
    subscription_data: {
      metadata: {
        organization_id: input.organizationId,
        plan: input.plan,
        interval: input.interval ?? "monthly",
      },
    },
  };

  if (input.customerId) {
    params.customer = input.customerId;
  } else if (input.email) {
    params.customer_email = input.email;
  }

  if (input.couponCode === 'project2026') {
    params.discounts = [{ coupon: 'itIoJnAT' }];
  }

  return getStripe().checkout.sessions.create(params);
}
