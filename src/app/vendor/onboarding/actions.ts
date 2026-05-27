"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/security/auth";
import { uniqueSlug } from "@/lib/slug";
import { onboardingSchema } from "@/lib/validation/schemas";

export async function submitVendorOnboarding(formData: FormData) {
  const user = await requireUser();
  const payload = onboardingSchema.parse({
    businessName: formData.get("businessName"),
    abn: formData.get("abn"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    state: formData.get("state"),
    address: formData.get("address"),
    website: formData.get("website") || "",
    acceptedAgreement: formData.get("acceptedAgreement") === "on",
  });

  const supabase = createAdminClient();

  // Update profile (can be done independently - not part of the atomic transaction)
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: payload.contactName,
    email: user.email,
    phone: payload.phone,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }

  // Use atomic database function for all onboarding writes
  // This ensures organization, member, branch, legal acceptance, and audit log are all created together
  const { error: onboardingError } = await supabase.rpc(
    "create_vendor_onboarding",
    {
      p_user_id: user.id,
      p_full_name: payload.contactName,
      p_email: user.email ?? "",
      p_phone: payload.phone,
      p_business_name: payload.businessName,
      p_slug: uniqueSlug(payload.businessName),
      p_abn: payload.abn,
      p_website: payload.website ?? "",
      p_address: payload.address,
      p_city: payload.city,
      p_state: payload.state,
      p_branch_slug: uniqueSlug(`${payload.businessName} ${payload.city}`),
    },
  );

  if (onboardingError) {
    throw new Error(`Onboarding failed: ${onboardingError.message}`);
  }

  revalidatePath("/vendor/dashboard");
  revalidatePath("/vendor/branches");
  redirect("/vendor/branches");
}
