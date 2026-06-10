import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { AdminVendorsTable } from "./vendors-table";

export const metadata = {
  title: "Vendor Moderation",
};

interface AdminVendorsPageProps {
  searchParams: Promise<{ status?: string }>;
}

async function moderateVendor(action: string, vendorId: string, reason: string) {
  "use server";

  const user = await requireAdmin();
  const supabase = createAdminClient();

  const statusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    suspend: "suspended",
    restore: "approved",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    throw new Error("Invalid action");
  }

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (action === "suspend") {
    updateData.suspended_at = new Date().toISOString();
  }

  if (action === "restore") {
    updateData.suspended_at = null;
  }

  // Update vendor
  const { error } = await supabase.from("organizations").update(updateData).eq("id", vendorId);

  if (error) {
    throw new Error(`Failed to ${action} vendor: ${error.message}`);
  }

  // Approve all branches if approving vendor
  if (action === "approve" || action === "restore") {
    await supabase
      .from("branches")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("organization_id", vendorId)
      .eq("status", "pending");
  }

  // Add moderation note
  await supabase.from("moderation_notes").insert({
    resource_type: "vendor",
    resource_id: vendorId,
    author_user_id: user.id,
    body: `[${action.toUpperCase()}] ${reason}`,
  });

  // Log audit event
  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: `moderation_${action}`,
    resource_type: "vendor",
    resource_id: vendorId,
    metadata: { reason },
  });

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
}

export default async function AdminVendorsPage({ searchParams }: AdminVendorsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();

  // Fetch vendors
  const statusFilter = params.status || "pending";
  const { data: vendors, error } = await supabase
    .from("organizations")
    .select(
      `
      id, name, slug, abn, billing_email, website, phone, address, status, created_at, suspended_at,
      branches(id, name, city, status),
      organization_members(user_id, profiles(full_name))
    `,
    )
    .eq("status", statusFilter)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vendors: ${error.message}`);
  }

  // Count by status
  const { data: allVendors } = await supabase
    .from("organizations")
    .select("status")
    .in("status", ["pending", "approved", "suspended", "rejected"]);

  const counts = {
    pending: allVendors?.filter((v) => v.status === "pending").length ?? 0,
    approved: allVendors?.filter((v) => v.status === "approved").length ?? 0,
    suspended: allVendors?.filter((v) => v.status === "suspended").length ?? 0,
    rejected: allVendors?.filter((v) => v.status === "rejected").length ?? 0,
  };

  // Transform vendors for the DataTable
  const tableData = (vendors ?? []).map((vendor) => {
    const branches = (vendor.branches as unknown as { id: string; name: string; city: string; status: string }[]) ?? [];
    const members = (vendor.organization_members as unknown as { user_id: string; profiles: { full_name: string } }[]) ?? [];
    const owner = members[0]?.profiles?.full_name ?? "Unknown";

    return {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      abn: vendor.abn,
      billing_email: vendor.billing_email ?? "",
      phone: vendor.phone ?? "",
      owner,
      branchCount: branches.length,
      status: vendor.status as string,
      created_at: vendor.created_at,
      suspended_at: vendor.suspended_at as string | null,
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Vendor Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Approve, reject, suspend, and manage vendor organizations. All actions are logged to the audit trail.
        </p>
      </section>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "suspended", label: "Suspended", count: counts.suspended },
          { key: "rejected", label: "Rejected", count: counts.rejected },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/vendors?status=${tab.key}`}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge
                variant={statusFilter === tab.key ? "default" : "outline"}
                className="ml-2"
              >
                {tab.count}
              </Badge>
            )}
          </Link>
        ))}
      </div>

      {/* Vendors Table */}
      <AdminVendorsTable
        data={tableData}
        statusFilter={statusFilter}
        moderateVendor={moderateVendor}
      />
    </div>
  );
}
