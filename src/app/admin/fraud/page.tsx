import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
      profiles:reviewed_by(full_name)
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
        ...flag,
        vendorName,
        vehicleTitle,
        vendorId,
        reviewer: (flag.profiles as unknown as { full_name: string })?.full_name ?? null,
      };
    }),
  );

  const openCount = enrichedFlags.filter((f) => f.status === "open").length;
  const reviewingCount = enrichedFlags.filter((f) => f.status === "reviewing").length;
  const closedCount = enrichedFlags.filter((f) => f.status === "closed").length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Fraud & Abuse</h1>
        <p className="mt-2 text-slate-600">
          Investigate suspicious leads, contact-click spikes, duplicate listings, and vendor reports.
        </p>
      </section>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-red-600">{openCount}</div>
          <div className="text-sm text-slate-600">Open Flags</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-amber-600">{reviewingCount}</div>
          <div className="text-sm text-slate-600">Under Review</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-green-600">{closedCount}</div>
          <div className="text-sm text-slate-600">Closed</div>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {enrichedFlags.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">No fraud flags found.</p>
          </div>
        ) : (
          enrichedFlags.map((flag) => (
            <div
              key={flag.id}
              className={`rounded-lg border ${flag.status === "open" ? "border-red-200" : "border-slate-200"} bg-white p-6 shadow-sm`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
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
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-800">
                      {flag.resource_type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        flag.status === "open"
                          ? "bg-red-100 text-red-800"
                          : flag.status === "reviewing"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {flag.status}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700">{flag.reason}</p>

                  {flag.vendorName && (
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium">Vendor:</span>{" "}
                      {flag.vendorId ? (
                        <Link href={`/admin/vendors?status=all&review=${flag.vendorId}`} className="text-blue-600 hover:underline">
                          {flag.vendorName}
                        </Link>
                      ) : (
                        flag.vendorName
                      )}
                    </p>
                  )}
                  {flag.vehicleTitle && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Vehicle:</span> {flag.vehicleTitle}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-500">
                    Created {new Date(flag.created_at).toLocaleDateString("en-AU")}
                    {flag.reviewed_at && (
                      <>
                        {" "}
                        · Reviewed {new Date(flag.reviewed_at).toLocaleDateString("en-AU")} by {flag.reviewer}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  {flag.status === "open" && (
                    <>
                      <form action={updateFraudFlagStatus.bind(null, "close", flag.id)}>
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Close Flag
                        </button>
                      </form>
                      <Link
                        href={`/admin/audit?type=${flag.resource_type}&id=${flag.resource_id}`}
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        View Audit Log
                      </Link>
                    </>
                  )}
                  {flag.status === "reviewing" && (
                    <>
                      <form action={updateFraudFlagStatus.bind(null, "close", flag.id)}>
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Close Flag
                        </button>
                      </form>
                      <form action={updateFraudFlagStatus.bind(null, "reopen", flag.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                        >
                          Reopen
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
