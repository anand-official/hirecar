import Link from "next/link";
import { 
  Users, 
  Car, 
  ShieldAlert, 
  Star, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import {
  getAdminDashboardMetrics,
  getPendingVendors,
  getPendingListings,
  getOpenFraudFlags,
  getPendingReviews,
  getHistoricalAnalytics,
} from "@/lib/data/admin";
import { requireAdmin } from "@/lib/security/auth";
import { AnalyticsChart } from "@/components/admin/analytics-chart";

export const metadata = {
  title: "Admin Control Room",
};

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [metrics, pendingVendors, _pendingListings, fraudFlags, _pendingReviews, analytics] = await Promise.all(
    [
      getAdminDashboardMetrics(),
      getPendingVendors(5),
      getPendingListings(5),
      getOpenFraudFlags(5),
      getPendingReviews(5),
      getHistoricalAnalytics(),
    ],
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-amber-500" />
            Global Control Room
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Real-time monitoring of platform health, vendor moderation queues, and financial metrics.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 backdrop-blur-sm text-right min-w-[200px]">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-500/80 mb-1">Est. Annual Run Rate</div>
          <div className="text-3xl font-bold text-emerald-400 flex items-center justify-end gap-2">
            ${metrics.revenueEstimate.toLocaleString()}
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
        </div>
      </section>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[400px]">
            <AnalyticsChart 
              title="Revenue Growth (YTD)" 
              data={analytics.revenueData} 
              valuePrefix="$" 
              color="emerald" 
            />
          </div>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[400px]">
            <AnalyticsChart 
              title="Lead Volume (Last 7 Days)" 
              data={analytics.leadsData} 
              color="amber" 
            />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard 
          icon={Users} 
          label="Pending Vendors" 
          value={metrics.pendingVendors} 
          total={metrics.totalVendors}
          trend="+12% this week"
          color="blue"
          href="/admin/vendors"
        />
        <MetricCard 
          icon={Car} 
          label="Pending Listings" 
          value={metrics.pendingListings} 
          total={metrics.totalListings}
          trend="+5% this week"
          color="emerald"
          href="/admin/listings"
        />
        <MetricCard 
          icon={ShieldAlert} 
          label="Open Fraud Flags" 
          value={metrics.openFraudFlags} 
          total={metrics.totalFraudFlags}
          trend={metrics.newFraudFlagsToday > 0 ? `${metrics.newFraudFlagsToday} new today` : "All clear"}
          color="red"
          href="/admin/fraud"
        />
        <MetricCard 
          icon={Star} 
          label="Pending Reviews" 
          value={metrics.pendingReviews} 
          total={metrics.totalReviews}
          trend="Requires moderation"
          color="amber"
          href="/admin/reviews"
        />
      </div>

      {/* Actionable Queues */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        
        {/* Pending Vendors Queue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Vendor Approval Queue
            </h2>
            <Link href="/admin/vendors" className="text-xs font-semibold uppercase tracking-wider text-amber-500 hover:text-amber-400">
              View All ({metrics.pendingVendors})
            </Link>
          </div>
          
          {pendingVendors.length === 0 ? (
            <EmptyState message="No vendors waiting for approval" />
          ) : (
            <div className="space-y-3">
              {pendingVendors.map((vendor) => (
                <div key={vendor.id} className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700">
                  <div>
                    <div className="font-semibold text-white">{vendor.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      ABN: {vendor.abn} • {vendor.branchCount} locations
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/vendors?status=pending&review=${vendor.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" title="Review vendor">
                      <CheckCircle2 className="h-5 w-5" />
                    </Link>
                    <Link href={`/admin/vendors?status=pending`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" title="Go to vendor moderation">
                      <XCircle className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fraud Flags Queue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Active Fraud Flags
            </h2>
            <Link href="/admin/fraud" className="text-xs font-semibold uppercase tracking-wider text-amber-500 hover:text-amber-400">
              View All ({fraudFlags.length})
            </Link>
          </div>
          
          {fraudFlags.length === 0 ? (
            <EmptyState message="System secure. No active fraud flags." icon={CheckCircle2} iconColor="text-emerald-500" />
          ) : (
            <div className="space-y-3">
              {fraudFlags.map((flag) => (
                <div key={flag.id} className="flex items-start justify-between rounded-xl border border-red-900/30 bg-slate-950 p-4 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    flag.severity === "critical" ? "bg-red-500" :
                    flag.severity === "high" ? "bg-orange-500" : "bg-yellow-500"
                  }`} />
                  <div className="pl-2">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      {flag.reason}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {flag.resourceType} • {flag.vendorName || flag.vehicleTitle}
                    </div>
                  </div>
                  <Link href={`/admin/fraud?id=${flag.id}`} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricCard({ icon: Icon, label, value, total, trend, color, href }: any) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <Link href={href} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-800/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[color]} transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
      <div className="text-sm font-medium text-slate-300">{label}</div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">{total} Total</span>
        <span className={color === 'red' && value > 0 ? 'text-red-400' : 'text-emerald-400'}>{trend}</span>
      </div>
    </Link>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmptyState({ message, icon: Icon = ShieldAlert, iconColor = "text-slate-600" }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className={`h-12 w-12 mb-3 opacity-50 ${iconColor}`} />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}
