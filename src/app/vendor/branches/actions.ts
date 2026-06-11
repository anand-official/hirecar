"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorContext, ensureUserCanManageOrganization } from "@/lib/data/vendor";
import { getBranchLimit, getOrganizationPlanCode } from "@/lib/plan-features";
import { requireUser } from "@/lib/security/auth";
import { uniqueSlug } from "@/lib/slug";
import { branchSchema } from "@/lib/validation/schemas";
import { invalidatePseo } from "@/lib/seo/invalidate";

export async function createBranch(formData: FormData) {
  const user = await requireUser();
  const payload = branchSchema.parse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    city: formData.get("city"),
    state: formData.get("state"),
    address: formData.get("address"),
    phone: formData.get("phone") || "",
    whatsapp: formData.get("whatsapp") || "",
  });

  await ensureUserCanManageOrganization(user.id, payload.organizationId);

  const supabase = createAdminClient();
  const planCode = await getOrganizationPlanCode(payload.organizationId);
  const branchLimit = getBranchLimit(planCode);

  if (branchLimit !== null) {
    const { count } = await supabase
      .from("branches")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", payload.organizationId);

    if ((count ?? 0) >= branchLimit) {
      throw new Error(
        `Your ${planCode ?? "current"} plan allows up to ${branchLimit} branch(es). Please upgrade to add more.`,
      );
    }
  }

  const { error } = await supabase.from("branches").insert({
    organization_id: payload.organizationId,
    name: payload.name,
    slug: uniqueSlug(`${payload.name} ${payload.city}`),
    city: payload.city,
    state: payload.state,
    address: payload.address,
    phone: payload.phone || null,
    whatsapp: payload.whatsapp || null,
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: "branch_created",
    resource_type: "organization",
    resource_id: payload.organizationId,
    metadata: { name: payload.name, city: payload.city },
  });

  revalidatePath("/vendor/branches");
  await invalidatePseo({ city: payload.city });
}

export async function getCurrentVendorContext() {
  const user = await requireUser();
  return getVendorContext(user.id);
}
