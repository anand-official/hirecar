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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Admin Control Room",
};

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [metrics, pendingVendors, , fraudFlags, , analytics] = await Promise.all(
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
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Global Control Room
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Real-time monitoring of platform health, vendor moderation queues, and financial metrics.
          </p>
        </div>
        <Card variant="elevated" size="sm" className="min-w-[200px]">
          <CardContent className="text-right">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Est. Annual Run Rate</div>
            <div className="text-3xl font-bold text-primary flex items-center justify-end gap-2">
              ${metrics.revenueEstimate.toLocaleString()}
              <TrendingUp className="h-5 w-5 opacity-80" />
            </div>
          </CardContent>
        </Card>
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
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Vendor Approval Queue
              </CardTitle>
              <Link href="/admin/vendors" className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80">
                View All ({metrics.pendingVendors})
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingVendors.length === 0 ? (
              <EmptyState message="No vendors waiting for approval" />
            ) : (
              <div className="space-y-3">
                {pendingVendors.map((vendor) => (
                  <div key={vendor.id} className="group flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/30">
                    <div>
                      <div className="font-semibold text-foreground">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ABN: {vendor.abn} • {vendor.branchCount} locations
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/vendors?status=pending&review=${vendor.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400" title="Review vendor">
                        <CheckCircle2 className="h-5 w-5" />
                      </Link>
                      <Link href={`/admin/vendors?status=pending`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20" title="Go to vendor moderation">
                        <XCircle className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fraud Flags Queue */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Active Fraud Flags
              </CardTitle>
              <Link href="/admin/fraud" className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80">
                View All ({fraudFlags.length})
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {fraudFlags.length === 0 ? (
              <EmptyState message="System secure. No active fraud flags." icon={CheckCircle2} iconColor="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <div className="space-y-3">
                {fraudFlags.map((flag) => (
                  <div key={flag.id} className="flex items-start justify-between rounded-lg border border-destructive/30 bg-background p-4 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      flag.severity === "critical" ? "bg-destructive" :
                      flag.severity === "high" ? "bg-amber-500" : "bg-amber-400"
                    }`} />
                    <div className="pl-2">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        {flag.reason}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {flag.resourceType} • {flag.vendorName || flag.vehicleTitle}
                      </div>
                    </div>
                    <Link href={`/admin/fraud?id=${flag.id}`} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricCard({ icon: Icon, label, value, total, trend, color, href }: any) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
    red: "text-destructive bg-destructive/10 border-destructive/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
  };

  return (
    <Link href={href} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-md transition-all hover:border-primary/30 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[color]} transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{total} Total</span>
        <Badge variant={color === 'red' && value > 0 ? 'destructive' : 'success'} className="text-xs">
          {trend}
        </Badge>
      </div>
    </Link>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmptyState({ message, icon: Icon = ShieldAlert, iconColor = "text-muted-foreground" }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className={`h-12 w-12 mb-3 opacity-50 ${iconColor}`} />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
