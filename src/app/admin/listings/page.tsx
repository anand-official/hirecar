import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { AdminListingsTable } from "./listings-table";

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

  // Transform listings for DataTable
  const tableData = (listings ?? []).map((listing) => {
    const org = (listing.organizations as unknown as { id: string; name: string; slug: string; status: string }) ?? {
      name: "Unknown",
      slug: "",
      status: "unknown",
    };
    const branch = (listing.branches as unknown as { name: string; city: string; state: string; status: string }) ?? {
      name: "Unknown",
      city: "Unknown",
      state: "Unknown",
    };

    return {
      id: listing.id,
      slug: listing.slug,
      title: `${listing.year} ${listing.make} ${listing.model}`,
      category: listing.category,
      fuel: listing.fuel,
      transmission: listing.transmission,
      seats: listing.seats,
      price_per_day_aud: listing.price_per_day_aud,
      status: listing.status as string,
      vendor_name: org.name,
      vendor_slug: org.slug,
      vendor_status: org.status,
      branch_name: branch.name,
      branch_city: branch.city,
      branch_state: branch.state,
      created_at: listing.created_at,
      suspended_at: listing.suspended_at as string | null,
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Listing Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Approve, reject, suspend, and manage vehicle listings. Approved listings are added to the search index.
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
            href={`/admin/listings?status=${tab.key}`}
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

      {/* Listings Table */}
      <AdminListingsTable
        data={tableData}
        statusFilter={statusFilter}
        moderateListing={moderateListing}
      />
    </div>
  );
}
