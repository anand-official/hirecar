import type { PlanCode } from "@/lib/types";

/**
 * Central source of truth for what each subscription plan can do.
 *
 * Today `plan_code` only gates vehicle limits. The public pricing page,
 * however, sells "WhatsApp click button" and "Phone click tracking" as
 * paid (Growth/Pro) features. This module makes that intent enforceable
 * in one place so the marketing copy and the product actually agree.
 */

export type PlanFeature =
  | "directContact" // show vendor phone + WhatsApp buttons on listings
  | "contactAnalytics" // phone/WhatsApp click tracking + analytics dashboard
  | "featuredPlacement"
  | "aiSeoContent"
  | "prioritySupport";

const FEATURES_BY_PLAN: Record<PlanCode, PlanFeature[]> = {
  starter: [],
  growth: ["directContact", "contactAnalytics"],
  pro: [
    "directContact",
    "contactAnalytics",
    "featuredPlacement",
    "aiSeoContent",
    "prioritySupport",
  ],
};

/**
 * Returns true when the given plan (may be null for no/expired subscription)
 * is entitled to the requested feature.
 */
export function planHasFeature(
  planCode: string | null | undefined,
  feature: PlanFeature,
): boolean {
  if (!planCode) return false;
  const features = FEATURES_BY_PLAN[planCode as PlanCode];
  if (!features) return false;
  return features.includes(feature);
}
