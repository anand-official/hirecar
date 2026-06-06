import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Listing Moderation",
};

interface AdminListingsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

async function moderateListing(
  action: string,
  listingId: string,
  reason: string,
  reindex: boolean,
) {
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

  // Update listing
  const { error } = await supabase.from("vehicles").update(updateData).eq("id", listingId);

  if (error) {
    throw new Error(`Failed to ${action} listing: ${error.message}`);
  }

  // Add to search index queue if approved
  if (action === "approve" || action === "restore") {
    await supabase.from("search_index_jobs").insert({
      vehicle_id: listingId,
      operation: "upsert",
      status: "pending",
    });
  } else if (action === "suspend" || action === "reject") {
    await supabase.from("search_index_jobs").insert({
      vehicle_id: listingId,
      operation: "delete",
      status: "pending",
    });
  }

  // Approve pending images
  if (action === "approve" || action === "restore") {
    await supabase
      .from("vehicle_images")
      .update({ approved: true })
      .eq("vehicle_id", listingId)
      .eq("approved", false);
  }

  // Add moderation note
  await supabase.from("moderation_notes").insert({
    resource_type: "vehicle",
    resource_id: listingId,
    author_user_id: user.id,
    body: `[${action.toUpperCase()}] ${reason}`,
  });

  // Log audit event
  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: `moderation_${action}`,
    resource_type: "vehicle",
    resource_id: listingId,
    metadata: { reason, reindex },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
}

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();

  // Fetch listings
  const statusFilter = params.status || "pending";
  const { data: listings, error } = await supabase
    .from("vehicles")
    .select(
      `
      id, slug, title, make, model, year, category, fuel, transmission, seats,
      price_per_day_aud, status, created_at, suspended_at,
      organizations(id, name, slug, status),
      branches(id, name, city, state, status)
    `,
    )
    .eq("status", statusFilter)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }

  // Count by status
  const { data: allListings } = await supabase
    .from("vehicles")
    .select("status")
    .in("status", ["pending", "approved", "suspended", "rejected"]);

  const counts = {
    pending: allListings?.filter((v) => v.status === "pending").length ?? 0,
    approved: allListings?.filter((v) => v.status === "approved").length ?? 0,
    suspended: allListings?.filter((v) => v.status === "suspended").length ?? 0,
    rejected: allListings?.filter((v) => v.status === "rejected").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Listing Moderation</h1>
        <p className="mt-2 text-slate-600">
          Approve, reject, suspend, and manage vehicle listings. Approved listings are added to the search index.
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
            href={`/admin/listings?status=${tab.key}`}
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

      {/* Listings List */}
      <div className="space-y-4">
        {listings?.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">No {statusFilter} listings found.</p>
          </div>
        ) : (
          listings?.map((listing) => {
            const org = (listing.organizations as unknown as { id: string; name: string; slug: string; status: string }) ?? {
              name: "Unknown",
              status: "unknown",
            };
            const branch = (listing.branches as unknown as { name: string; city: string; state: string; status: string }) ?? {
              name: "Unknown",
              city: "Unknown",
              state: "Unknown",
            };

            return (
              <div
                key={listing.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {listing.year} {listing.make} {listing.model}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          listing.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : listing.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : listing.status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{listing.title}</p>
                    <div className="mt-2 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">Category:</span> {listing.category} ·{" "}
                        <span className="font-medium">Fuel:</span> {listing.fuel} ·{" "}
                        <span className="font-medium">Transmission:</span> {listing.transmission}
                      </p>
                      <p>
                        <span className="font-medium">Seats:</span> {listing.seats} ·{" "}
                        <span className="font-medium">Price:</span> ${listing.price_per_day_aud}/day
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Vendor:</span>{" "}
                        <Link href={`/vendors/${org.slug}`} className="text-blue-600 hover:underline">
                          {org.name}
                        </Link>{" "}
                        <span
                          className={`ml-2 rounded px-1 py-0.5 text-xs ${
                            org.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {org.status}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500">
                        <span className="font-medium">Branch:</span> {branch.name} · {branch.city},{" "}
                        {branch.state}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Submitted {new Date(listing.created_at).toLocaleDateString("en-AU")}
                      {listing.suspended_at &&
                        ` · Suspended ${new Date(listing.suspended_at).toLocaleDateString("en-AU")}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {listing.status === "pending" && (
                      <>
                        <form action={moderateListing.bind(null, "approve", listing.id, "Approved from admin dashboard", true)}>
                          <button
                            type="submit"
                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={moderateListing.bind(null, "reject", listing.id, "Rejected from admin dashboard", false)}>
                          <button
                            type="submit"
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </form>
                      </>
                    )}
                    {listing.status === "approved" && (
                      <>
                        <form action={moderateListing.bind(null, "suspend", listing.id, "Suspended from admin dashboard", false)}>
                          <button
                            type="submit"
                            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                          >
                            Suspend
                          </button>
                        </form>
                        <Link
                          href={`/cars/${listing.slug}`}
                          target="_blank"
                          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                        >
                          View Public
                        </Link>
                      </>
                    )}
                    {(listing.status === "suspended" || listing.status === "rejected") && (
                      <form action={moderateListing.bind(null, "restore", listing.id, "Restored from admin dashboard", true)}>
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Restore
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/admin/audit?type=vehicle&id=${listing.id}`}
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
