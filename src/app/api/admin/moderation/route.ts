import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/security/auth";
import { moderationSchema } from "@/lib/validation/schemas";

type ResourceType = "vendor" | "branch" | "vehicle" | "review" | "fraud_flag";
type Action = "approve" | "reject" | "suspend" | "restore" | "verify";

const tableMap: Record<ResourceType, string> = {
  vendor: "organizations",
  branch: "branches",
  vehicle: "vehicles",
  review: "reviews",
  fraud_flag: "fraud_flags",
};

const statusMap: Record<Action, string> = {
  approve: "approved",
  reject: "rejected",
  suspend: "suspended",
  restore: "approved",
  verify: "approved",
};

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  const payload = moderationSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const { resourceType, resourceId, action, reason } = payload.data;
  const supabase = createAdminClient();

  // Get the table name for this resource type
  const tableName = tableMap[resourceType];
  if (!tableName) {
    return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
  }

  // Execute moderation action based on resource type
  switch (resourceType) {
    case "vendor":
    case "branch":
    case "vehicle":
    case "review": {
      const newStatus = statusMap[action];
      if (!newStatus) {
        return NextResponse.json({ error: "Invalid action for this resource type" }, { status: 400 });
      }

      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Add suspension timestamp if suspending
      if (action === "suspend") {
        updateData.suspended_at = new Date().toISOString();
      }

      // For restore action, clear suspended_at
      if (action === "restore") {
        updateData.suspended_at = null;
      }

      const { error } = await supabase.from(tableName).update(updateData).eq("id", resourceId);

      if (error) {
        return NextResponse.json(
          { error: `Failed to update ${resourceType}: ${error.message}` },
          { status: 500 },
        );
      }

      // For vehicles, trigger search index update
      if (resourceType === "vehicle") {
        await supabase.from("search_index_jobs").insert({
          vehicle_id: resourceId,
          operation: action === "approve" || action === "restore" ? "upsert" : "delete",
          status: "pending",
        });
      }

      // For vendors (organizations), if approving, also approve their branches
      if (resourceType === "vendor" && action === "approve") {
        await supabase
          .from("branches")
          .update({ status: "approved", updated_at: new Date().toISOString() })
          .eq("organization_id", resourceId)
          .eq("status", "pending");
      }
      break;
    }

    case "fraud_flag": {
      // Update fraud flag status
      const flagStatus = action === "approve" ? "closed" : action === "reject" ? "closed" : "open";
      const { error } = await supabase
        .from("fraud_flags")
        .update({ status: flagStatus, updated_at: new Date().toISOString() })
        .eq("id", resourceId);

      if (error) {
        return NextResponse.json(
          { error: `Failed to update fraud flag: ${error.message}` },
          { status: 500 },
        );
      }
      break;
    }
  }

  // Add moderation note
  await supabase.from("moderation_notes").insert({
    resource_type: resourceType,
    resource_id: resourceId,
    author_user_id: user.id,
    body: `[${action.toUpperCase()}] ${reason}`,
  });

  // Log audit event
  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: `moderation_${action}`,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: { reason, previous_action: action },
  });

  return NextResponse.json({ ok: true, resourceType, resourceId, action });
}
