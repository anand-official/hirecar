import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { AdminFraudTable } from "./fraud-table";

export const metadata = {
  title: "Fraud & Abuse",
};

async function updateFraudFlagStatus(action: "close" | "reopen", flagId: string) {
  "use server";

  const user = await requireAdmin();
  const supabase = createAdminClient();
  const isClosing = action === "close";

  const { error } = await supabase
    .from("fraud_flags")
    .update({
      status: isClosing ? "closed" : "open",
      reviewed_by: isClosing ? user.id : null,
      reviewed_at: isClosing ? new Date().toISOString() : null,
    })
    .eq("id", flagId);

  if (error) {
    throw new Error(`Failed to ${action} flag: ${error.message}`);
  }

  // Add moderation note
  await supabase.from("moderation_notes").insert({
    resource_type: "fraud_flag",
    resource_id: flagId,
    author_user_id: user.id,
    body: isClosing
      ? "[CLOSED] Fraud flag investigated and closed"
      : "[REOPENED] Fraud flag reopened for further review",
  });

  // Log audit event
  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: isClosing ? "fraud_flag_closed" : "fraud_flag_reopened",
    resource_type: "fraud_flag",
    resource_id: flagId,
  });

  revalidatePath("/admin/fraud");
  revalidatePath("/admin");
}

export default async function AdminFraudPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  // Fetch fraud flags
  const { data: flags, error } = await supabase
    .from("fraud_flags")
    .select(
      `
      id, resource_type, resource_id, severity, reason, status, created_at,
      reviewed_by, reviewed_at,
      profiles(full_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch fraud flags: ${error.message}`);
  }

  // Get resource details for each flag
  const enrichedFlags = await Promise.all(
    (flags ?? []).map(async (flag) => {
      let vendorName: string | null = null;
      let vehicleTitle: string | null = null;
      let vendorId: string | null = null;

      if (flag.resource_type === "vendor" || flag.resource_type === "organization") {
        const { data } = await supabase.from("organizations").select("name").eq("id", flag.resource_id).single();
        vendorName = data?.name ?? null;
        vendorId = flag.resource_id;
      } else if (flag.resource_type === "vehicle" || flag.resource_type === "lead_attempt") {
        const { data } = await supabase
          .from("vehicles")
          .select("title, organization_id, organizations(name)")
          .eq("id", flag.resource_id)
          .single();
        vehicleTitle = (data as unknown as { title: string })?.title ?? null;
        vendorName = (data as unknown as { organizations: { name: string } })?.organizations?.name ?? null;
        vendorId = (data as unknown as { organization_id: string })?.organization_id ?? null;
      } else if (flag.resource_type === "lead") {
        const { data } = await supabase
          .from("leads")
          .select("customer_name, vendor_id, organizations(name)")
          .eq("id", flag.resource_id)
          .single();
        vendorName = (data as unknown as { organizations: { name: string } })?.organizations?.name ?? null;
        vendorId = (data as unknown as { vendor_id: string })?.vendor_id ?? null;
      }

      return {
        id: flag.id,
        resource_type: flag.resource_type,
        resource_id: flag.resource_id,
        severity: flag.severity as string,
        reason: flag.reason,
        status: flag.status as string,
        created_at: flag.created_at,
        reviewed_at: flag.reviewed_at as string | null,
        vendor_name: vendorName ?? "Unknown",
        vehicle_title: vehicleTitle ?? "",
        vendor_id: vendorId,
        reviewer: (flag.profiles as unknown as { full_name: string })?.full_name ?? null,
      };
    }),
  );

  const openCount = enrichedFlags.filter((f) => f.status === "open").length;
  const reviewingCount = enrichedFlags.filter((f) => f.status === "reviewing").length;
  const closedCount = enrichedFlags.filter((f) => f.status === "closed").length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Fraud & Abuse</h1>
        <p className="mt-2 text-muted-foreground">
          Investigate suspicious leads, contact-click spikes, duplicate listings, and vendor reports.
        </p>
      </section>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated" size="sm">
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{openCount}</div>
            <div className="text-sm text-muted-foreground">Open Flags</div>
          </CardContent>
        </Card>
        <Card variant="elevated" size="sm">
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{reviewingCount}</div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card variant="elevated" size="sm">
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{closedCount}</div>
            <div className="text-sm text-muted-foreground">Closed</div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Flags Table */}
      <AdminFraudTable
        data={enrichedFlags}
        updateFraudFlagStatus={updateFraudFlagStatus}
      />
    </div>
  );
}
