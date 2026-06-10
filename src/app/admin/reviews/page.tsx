import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { AdminReviewsTable } from "./reviews-table";

export const metadata = {
  title: "Review Moderation",
};

interface AdminReviewsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

async function moderateReview(action: string, reviewId: string, reason: string) {
  "use server";

  const user = await requireAdmin();
  const supabase = createAdminClient();

  const statusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    throw new Error("Invalid action");
  }

  // Update review
  const { error } = await supabase
    .from("reviews")
    .update({
      status: newStatus,
    })
    .eq("id", reviewId);

  if (error) {
    throw new Error(`Failed to ${action} review: ${error.message}`);
  }

  // Add moderation note
  await supabase.from("moderation_notes").insert({
    resource_type: "review",
    resource_id: reviewId,
    author_user_id: user.id,
    body: `[${action.toUpperCase()}] ${reason}`,
  });

  // Log audit event
  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: `moderation_${action}`,
    resource_type: "review",
    resource_id: reviewId,
    metadata: { reason },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();

  // Get counts by status
  const { data: statusCounts } = await supabase
    .from("reviews")
    .select("status");

  const counts = {
    pending: statusCounts?.filter((r) => r.status === "pending").length ?? 0,
    approved: statusCounts?.filter((r) => r.status === "approved").length ?? 0,
    rejected: statusCounts?.filter((r) => r.status === "rejected").length ?? 0,
  };

  const statusFilter = params.status || "pending";

  // Fetch reviews
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id, customer_name, rating, body, status, created_at,
      organization_id, vehicle_id,
      organizations(id, name, slug),
      vehicles(id, title)
    `,
    )
    .eq("status", statusFilter)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  // Transform for DataTable
  const tableData = (reviews ?? []).map((review) => {
    const org = (review.organizations as unknown as { id: string; name: string; slug: string }) ?? {
      name: "Unknown",
      slug: "",
    };
    const vehicle = (review.vehicles as unknown as { id: string; title: string }) ?? {
      title: null,
    };

    return {
      id: review.id,
      customer_name: review.customer_name,
      rating: review.rating,
      body: review.body,
      status: review.status as string,
      vendor_name: org.name,
      vendor_slug: org.slug,
      vehicle_title: vehicle.title ?? "N/A",
      created_at: review.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Review Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Moderate customer reviews before they are shown publicly. All reviews are screened for authenticity.
        </p>
      </section>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "rejected", label: "Rejected", count: counts.rejected },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/reviews?status=${tab.key}`}
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

      {/* Reviews Table */}
      <AdminReviewsTable
        data={tableData}
        statusFilter={statusFilter}
        moderateReview={moderateReview}
      />
    </div>
  );
}
