import Link from "next/link";
import { requireAdmin } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getPendingReviews } from "@/lib/data/admin";

export const metadata = {
  title: "Review Moderation",
};

interface AdminReviewsPageProps {
  searchParams: Promise<{
    approve?: string;
    reject?: string;
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

  // Process moderation actions
  if (params.approve) {
    await moderateReview("approve", params.approve, "Approved from admin dashboard");
  }
  if (params.reject) {
    await moderateReview("reject", params.reject, "Rejected from admin dashboard");
  }

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
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Review Moderation</h1>
        <p className="mt-2 text-slate-600">
          Moderate customer reviews before they are shown publicly. All reviews are screened for authenticity.
        </p>
      </section>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "rejected", label: "Rejected", count: counts.rejected },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/reviews?status=${tab.key}`}
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

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews?.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">No {statusFilter} reviews found.</p>
          </div>
        ) : (
          reviews?.map((review) => {
            const org = (review.organizations as unknown as { id: string; name: string; slug: string }) ?? {
              name: "Unknown",
              slug: "",
            };
            const vehicle = (review.vehicles as unknown as { id: string; title: string }) ?? {
              title: null,
            };

            return (
              <div
                key={review.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{review.customer_name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          review.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : review.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? "text-amber-400" : "text-slate-200"}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-slate-600">({review.rating}/5)</span>
                    </div>
                    <p className="mt-3 text-slate-700">{review.body}</p>
                    <div className="mt-3 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">Vendor:</span>{" "}
                        <Link href={`/vendors/${org.slug}`} className="text-blue-600 hover:underline">
                          {org.name}
                        </Link>
                      </p>
                      {vehicle.title && (
                        <p>
                          <span className="font-medium">Vehicle:</span> {vehicle.title}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Submitted {new Date(review.created_at).toLocaleDateString("en-AU")}
                    </p>
                  </div>

                  {review.status === "pending" && (
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/reviews?status=${statusFilter}&approve=${review.id}`}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Approve
                      </Link>
                      <Link
                        href={`/admin/reviews?status=${statusFilter}&reject=${review.id}`}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Reject
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
