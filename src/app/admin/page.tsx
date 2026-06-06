import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import {
  getAdminDashboardMetrics,
  getPendingVendors,
  getPendingListings,
  getOpenFraudFlags,
  getPendingReviews,
} from "@/lib/data/admin";
import { requireAdmin } from "@/lib/security/auth";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [metrics, pendingVendors, pendingListings, fraudFlags, pendingReviews] = await Promise.all(
    [
      getAdminDashboardMetrics(),
      getPendingVendors(5),
      getPendingListings(5),
      getOpenFraudFlags(5),
      getPendingReviews(5),
    ],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Platform Control Room</h1>
            <p className="mt-2 text-slate-600">
              Overview of platform health, moderation queues, and key metrics.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Est. Annual Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.revenueEstimate.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/admin/vendors">
          <MetricCard
            label="Pending Vendors"
            value={String(metrics.pendingVendors)}
            helper={`${metrics.totalVendors} total vendors, ${metrics.suspendedVendors} suspended`}
          />
        </Link>
        <Link href="/admin/listings">
          <MetricCard
            label="Pending Listings"
            value={String(metrics.pendingListings)}
            helper={`${metrics.totalListings} total, ${metrics.suspendedListings} suspended`}
          />
        </Link>
        <Link href="/admin/fraud">
          <MetricCard
            label="Open Fraud Flags"
            value={String(metrics.openFraudFlags)}
            helper={`${metrics.newFraudFlagsToday} new today, ${metrics.totalFraudFlags} total`}
          />
        </Link>
        <Link href="/admin/reviews">
          <MetricCard
            label="Pending Reviews"
            value={String(metrics.pendingReviews)}
            helper={`${metrics.totalReviews} total reviews`}
          />
        </Link>
      </div>

      {/* Activity Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Health */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Subscription Health</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Active Subscriptions</span>
              <span className="font-medium">{metrics.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Past Due</span>
              <span className="font-medium text-amber-600">{metrics.pastDueSubscriptions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Webhooks (24h)</span>
              <span className="font-medium">{metrics.webhooksLast24h}</span>
            </div>
            {metrics.failedWebhooks > 0 && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                ⚠️ {metrics.failedWebhooks} failed webhooks require attention
              </div>
            )}
          </div>
        </div>

        {/* Lead Activity */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Lead Activity</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Leads</span>
              <span className="font-medium">{metrics.totalLeads.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">New Today</span>
              <span className="font-medium text-blue-600">{metrics.leadsToday}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Avg. Leads per Vendor</span>
              <span className="font-medium">
                {metrics.totalVendors > 0
                  ? (metrics.totalLeads / metrics.totalVendors).toFixed(1)
                  : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Queue */}
      <div className="space-y-6">
        {/* Pending Vendors */}
        {pendingVendors.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vendors Awaiting Approval ({pendingVendors.length})</h2>
              <Link href="/admin/vendors" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3"
                >
                  <div>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-slate-500">
                      ABN: {vendor.abn} · {vendor.branchCount} branch
                      {vendor.branchCount !== 1 ? "es" : ""} ·{" "}
                      {new Date(vendor.createdAt).toLocaleDateString("en-AU")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/vendors?review=${vendor.id}`}
                      className="rounded-md bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Listings */}
        {pendingListings.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Listings Awaiting Approval ({pendingListings.length})</h2>
              <Link href="/admin/listings" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3"
                >
                  <div>
                    <div className="font-medium">
                      {listing.year} {listing.make} {listing.model}
                    </div>
                    <div className="text-sm text-slate-500">
                      {listing.vendorName} · {listing.category} · ${listing.pricePerDay}/day ·{" "}
                      {new Date(listing.createdAt).toLocaleDateString("en-AU")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/listings?review=${listing.id}`}
                      className="rounded-md bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reviews Awaiting Moderation ({pendingReviews.length})</h2>
              <Link href="/admin/reviews" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {review.customerName} · {review.vendorName}
                      </div>
                      <div className="flex text-amber-400">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/admin/reviews"
                        className="rounded-md bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{review.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fraud Flags */}
        {fraudFlags.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Open Fraud Flags ({fraudFlags.length})</h2>
              <Link href="/admin/fraud" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {fraudFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          flag.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : flag.severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : flag.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {flag.severity}
                      </span>
                      <span className="text-sm font-medium capitalize">{flag.resourceType}</span>
                    </div>
                    <div className="text-sm text-slate-600">{flag.reason}</div>
                    {flag.vendorName && (
                      <div className="text-sm text-slate-500">Vendor: {flag.vendorName}</div>
                    )}
                    {flag.vehicleTitle && (
                      <div className="text-sm text-slate-500">Vehicle: {flag.vehicleTitle}</div>
                    )}
                  </div>
                  <Link
                    href={`/admin/fraud?id=${flag.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    Investigate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingVendors.length === 0 &&
          pendingListings.length === 0 &&
          fraudFlags.length === 0 &&
          pendingReviews.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">All Caught Up!</h3>
              <p className="mt-2 text-slate-600">
                No pending vendors, listings, or fraud flags require your attention.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
