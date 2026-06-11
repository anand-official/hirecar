"use server";

import { generateVehicleDescription } from "@/lib/ai/vehicle-seo";
import { ensureUserCanManageOrganization } from "@/lib/data/vendor";
import { requirePlanFeature } from "@/lib/plan-features";
import { requireUser } from "@/lib/security/auth";

export async function generateVehicleSeoContent(input: {
  organizationId: string;
  make: string;
  model: string;
  year: number;
  category: string;
  city?: string;
  seats?: number;
  fuel?: string;
  transmission?: string;
}) {
  const user = await requireUser();
  await ensureUserCanManageOrganization(user.id, input.organizationId);
  await requirePlanFeature(input.organizationId, "aiSeoContent");

  const description = await generateVehicleDescription(input);
  return { description };
}
