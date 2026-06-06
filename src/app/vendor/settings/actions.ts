"use server";

// redirect removed
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/security/auth";
import { ensureUserCanManageOrganization } from "@/lib/data/vendor";
import { z } from "zod";

const profileSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(8).max(30).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().trim().min(6).max(240).optional().or(z.literal("")),
});

export async function updateOrganizationProfile(formData: FormData) {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    website: formData.get("website") || "",
    address: formData.get("address") || "",
  });

  if (!parsed.success) {
    throw new Error("Invalid form data. Please check your inputs.");
  }

  const { organizationId, name, phone, website, address } = parsed.data;

  await ensureUserCanManageOrganization(user.id, organizationId);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      phone: phone || null,
      website: website || null,
      address: address || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId);

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`);
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: user.id,
    action: "organization_profile_updated",
    resource_type: "organization",
    resource_id: organizationId,
    metadata: { fields: ["name", "phone", "website", "address"] },
  });

  revalidatePath("/vendor/settings");
}
