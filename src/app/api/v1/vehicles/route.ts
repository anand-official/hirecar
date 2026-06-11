import { NextResponse, type NextRequest } from "next/server";
import { organizationHasFeature } from "@/lib/plan-features";
import { authenticateApiKey } from "@/lib/security/api-key";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidatePseoForVehicle } from "@/lib/seo/vehicle-invalidation";

async function requireApiAccess(request: NextRequest) {
  const auth = await authenticateApiKey(request.headers.get("authorization"));
  if (!auth) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }) };
  }
  const allowed = await organizationHasFeature(auth.organizationId, "apiAccess");
  if (!allowed) {
    return { error: NextResponse.json({ error: "API access requires Pro plan" }, { status: 403 }) };
  }
  return { auth };
}

export async function GET(request: NextRequest) {
  const result = await requireApiAccess(request);
  if ("error" in result && result.error) return result.error;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, slug, title, make, model, year, category, price_per_day_aud, status, branch_id")
    .eq("organization_id", result.auth!.organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ vehicles: data });
}

export async function POST(request: NextRequest) {
  const result = await requireApiAccess(request);
  if ("error" in result && result.error) return result.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      organization_id: result.auth!.organizationId,
      branch_id: body.branchId,
      slug: String(body.slug ?? `vehicle-${Date.now()}`),
      title: body.title,
      make: body.make,
      model: body.model,
      year: body.year,
      seats: body.seats ?? 5,
      fuel: body.fuel ?? "Petrol",
      transmission: body.transmission ?? "Automatic",
      category: body.category ?? "Sedan",
      price_per_day_aud: body.pricePerDayAud,
      status: "pending",
    })
    .select("id, slug, title, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("search_index_jobs").insert({
    vehicle_id: data.id,
    operation: "upsert",
    status: "pending",
  });
  await invalidatePseoForVehicle(supabase, data.id);

  return NextResponse.json({ vehicle: data }, { status: 201 });
}
