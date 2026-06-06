import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/security/auth";
import { getVendorContext } from "@/lib/data/vendor";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CheckCircle, Clock, AlertTriangle, Zap,
  ArrowRight, Building2, Star, Package, TrendingUp, Shield,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Billing",
};

const PLANS = [
  {
    code: "starter",
    name: "Starter",
    price: 49,
    vehicles: 5,
    color: "border-slate-200",
    badge: null,
    features: ["5 vehicle listings", "Lead notifications", "Vendor dashboard", "Basic analytics", "Email support"],
  },
  {
    code: "growth",
    name: "Growth",
    price: 99,
    vehicles: 25,
    color: "border-amber-400",
    badge: "Most Popular",
    features: ["25 vehicle listings", "Priority lead alerts", "Advanced analytics", "Multi-branch support", "Priority support"],
  },
  {
    code: "pro",
    name: "Pro",
    price: 199,
    vehicles: 100,
    color: "border-slate-200",
    badge: null,
    features: ["100 vehicle listings", "All Growth features", "Bulk upload tools", "API access", "Dedicated support"],
  },
] as const;

const STATUS_CONFIG = {
  active: { label: "Active", icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  trialing: { label: "Trial", icon: Clock, cls: "bg-blue-100 text-blue-700 border-blue-200" },
  past_due: { label: "Past Due", icon: AlertTriangle, cls: "bg-red-100 text-red-700 border-red-200" },
  canceled: { label: "Canceled", icon: AlertTriangle, cls: "bg-slate-100 text-slate-600 border-slate-200" },
  unpaid: { label: "Unpaid", icon: AlertTriangle, cls: "bg-red-100 text-red-700 border-red-200" },
  incomplete: { label: "Incomplete", icon: Clock, cls: "bg-amber-100 text-amber-700 border-amber-200" },
} as const;

export default async function VendorBillingPage() {
  const user = await requireUser();
  const context = await getVendorContext(user.id);

  if (context.setupError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Setup Required</h1>
        <p className="mt-2 text-red-700">{context.setupError}</p>
      </div>
    );
  }

  if (context.organizations.length === 0) {
    redirect("/vendor/onboarding");
  }

  const organization = context.organizations[0];
  const supabase = createAdminClient();

  // Fetch subscription + plan details
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_code, status, current_period_end, stripe_subscription_id, stripe_customer_id")
    .eq("organization_id", organization.id)
    .maybeSingle();

  const { data: plan } = subscription?.plan_code
    ? await supabase
        .from("plans")
        .select("code, name, vehicle_limit, stripe_price_id")
        .eq("code", subscription.plan_code)
        .single()
    : { data: null };

  const { count: vehicleCount } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organization.id);

  const usagePercent =
    plan?.vehicle_limit && vehicleCount != null
      ? Math.min(Math.round((vehicleCount / plan.vehicle_limit) * 100), 100)
      : 0;

  const statusKey = (subscription?.status ?? "incomplete") as keyof typeof STATUS_CONFIG;
  const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.incomplete;
  const StatusIcon = statusCfg.icon;

  const hasActiveSub = subscription && ["active", "trialing"].includes(subscription.status);
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-AU", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your plan and billing for <span className="font-medium text-slate-700">{organization.name}</span>
            </p>
          </div>
          {hasActiveSub && (
            <form action="/api/billing/portal" method="post">
              <input type="hidden" name="organizationId" value={organization.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Manage Billing Portal
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Plan Status */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900">
                  {plan?.name ?? "No Plan"}
                </h2>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusCfg.cls}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusCfg.label}
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-6 w-6 text-slate-600" />
            </div>
          </div>

          {subscription ? (
            <div className="space-y-5">
              {/* Vehicle Usage */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Vehicle listings used</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {vehicleCount ?? 0} / {plan?.vehicle_limit ?? "∞"}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      usagePercent > 85 ? "bg-red-500" : usagePercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: plan?.vehicle_limit ? `${usagePercent}%` : "0%" }}
                  />
                </div>
                {usagePercent > 85 && (
                  <p className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ You are near your plan limit. Consider upgrading to add more vehicles.
                  </p>
                )}
              </div>

              {/* Period end */}
              {periodEnd && (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-600">
                    {subscription.status === "trialing" ? "Trial ends" : "Next renewal"}{" "}
                    <span className="font-semibold text-slate-900">{periodEnd}</span>
                  </p>
                </div>
              )}

              {/* Features */}
              {plan && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Plan Includes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(PLANS.find(p => p.code === plan.code)?.features ?? []).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">No active subscription</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Choose a plan below to start listing your vehicles on the marketplace.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 mb-3">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{vehicleCount ?? 0}</p>
            <p className="text-sm text-slate-500 mt-0.5">Total vehicles listed</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 mb-3">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{organization.branches.length}</p>
            <p className="text-sm text-slate-500 mt-0.5">Branches</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 mb-3">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Secure billing</p>
            <p className="text-xs text-slate-400 mt-0.5">Powered by Stripe. We never store card data.</p>
          </div>
        </div>
      </div>

      {/* Plan Picker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {hasActiveSub ? "Upgrade Your Plan" : "Choose a Plan"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">All plans include a 14-day free trial</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Star className="h-3 w-3" />
            14-day free trial
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = subscription?.plan_code === p.code;
            const isPopular = p.badge === "Most Popular";

            return (
              <div
                key={p.code}
                className={`relative rounded-2xl border-2 p-6 transition-all ${
                  isCurrent
                    ? "border-slate-950 bg-slate-950 text-white"
                    : isPopular
                      ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                    {p.badge}
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-slate-950 border-2 border-emerald-400 px-3 py-0.5 text-xs font-bold text-emerald-400">
                    <CheckCircle className="h-3 w-3" /> Current plan
                  </span>
                )}

                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${isCurrent ? "text-white" : "text-slate-900"}`}>
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-3xl font-black ${isCurrent ? "text-white" : "text-slate-900"}`}>
                      ${p.price}
                    </span>
                    <span className={`text-sm ${isCurrent ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                  </div>
                  <p className={`text-sm mt-1 ${isCurrent ? "text-slate-300" : "text-slate-500"}`}>
                    Up to {p.vehicles} vehicles
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${isCurrent ? "text-slate-200" : "text-slate-600"}`}>
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs ${isCurrent ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"}`}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className={`rounded-xl py-2.5 text-center text-sm font-semibold bg-white/10 text-white`}>
                    Your current plan
                  </div>
                ) : (
                  <form action="/api/billing/checkout" method="post">
                    <input type="hidden" name="plan" value={p.code} />
                    <input type="hidden" name="organizationId" value={organization.id} />
                    <button
                      type="submit"
                      className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      {hasActiveSub ? "Switch to " + p.name : "Start " + p.name}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise callout */}
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">Business & Enterprise</p>
            <p className="text-sm text-slate-400 mt-0.5">300+ vehicles, API access, dedicated account manager, custom contracts.</p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Contact Sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Security note */}
        <p className="mt-4 text-center text-xs text-slate-400">
          🔒 Payments processed securely by Stripe · Cancel anytime · No setup fees
        </p>
      </div>
    </div>
  );
}
