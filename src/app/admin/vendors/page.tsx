import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Vendor Moderation",
};

interface AdminVendorsPageProps {
  searchParams: Promise<{ approve?: string; reject?: string; suspend?: string; restore?: string; status?: string }>;
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
  const user = await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();

  // Process moderation actions from query params
  if (params.approve) {
    await moderateVendor("approve", params.approve, "Approved from admin dashboard");
  }
  if (params.reject) {
    await moderateVendor("reject", params.reject, "Rejected from admin dashboard");
  }
  if (params.suspend) {
    await moderateVendor("suspend", params.suspend, "Suspended from admin dashboard");
  }
  if (params.restore) {
    await moderateVendor("restore", params.restore, "Restored from admin dashboard");
  }

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

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Vendor Moderation</h1>
        <p className="mt-2 text-slate-600">
          Approve, reject, suspend, and manage vendor organizations. All actions are logged to the audit trail.
        </p>
      </section>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "suspended", label: "Suspended", count: counts.suspended },
          { key: "rejected", label: "Rejected", count: counts.rejected },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/vendors?status=${tab.key}`}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              statusFilter === tab.key
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  statusFilter === tab.key ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Vendors List */}
      <div className="space-y-4">
        {vendors?.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">No {statusFilter} vendors found.</p>
          </div>
        ) : (
          vendors?.map((vendor) => {
            const branches = (vendor.branches as unknown as { id: string; name: string; city: string; status: string }[]) ?? [];
            const members = (vendor.organization_members as unknown as { user_id: string; profiles: { full_name: string } }[]) ?? [];
            const owner = members[0]?.profiles?.full_name ?? "Unknown";

            return (
              <div
                key={vendor.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{vendor.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          vendor.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : vendor.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : vendor.status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      ABN: {vendor.abn} · Owner: {owner}
                    </p>
                    <div className="mt-2 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">Email:</span> {vendor.billing_email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {vendor.phone}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span> {vendor.address}
                      </p>
                      {vendor.website && (
                        <p>
                          <span className="font-medium">Website:</span>{" "}
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {vendor.website}
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-slate-700">Branches ({branches.length}):</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {branches.map((b) => (
                          <span
                            key={b.id}
                            className={`rounded-md px-2 py-1 text-xs ${
                              b.status === "approved"
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {b.name} ({b.city}) - {b.status}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Submitted {new Date(vendor.created_at).toLocaleDateString("en-AU")}
                      {vendor.suspended_at && ` · Suspended ${new Date(vendor.suspended_at).toLocaleDateString("en-AU")}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {vendor.status === "pending" && (
                      <>
                        <Link
                          href={`/admin/vendors?status=${statusFilter}&approve=${vendor.id}`}
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Approve
                        </Link>
                        <Link
                          href={`/admin/vendors?status=${statusFilter}&reject=${vendor.id}`}
                          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Reject
                        </Link>
                      </>
                    )}
                    {vendor.status === "approved" && (
                      <Link
                        href={`/admin/vendors?status=${statusFilter}&suspend=${vendor.id}`}
                        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                      >
                        Suspend
                      </Link>
                    )}
                    {(vendor.status === "suspended" || vendor.status === "rejected") && (
                      <Link
                        href={`/admin/vendors?status=${statusFilter}&restore=${vendor.id}`}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Restore
                      </Link>
                    )}
                    <Link
                      href={`/admin/audit?type=vendor&id=${vendor.id}`}
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      View Audit Log
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
