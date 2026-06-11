import { createAdminClient } from "@/lib/supabase/admin";

export type FeaturedVehicle = {
  id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  city: string;
  organizationName: string;
  imageUrl?: string;
};

export async function getActiveFeaturedVehicles(city?: string | null): Promise<FeaturedVehicle[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("featured_placements")
    .select(`
      id, city, vehicle_id,
      vehicles!inner(
        id, slug, title, make, model, year, category, price_per_day_aud, status,
        branches!inner(city, status),
        organizations!inner(name, status)
      )
    `)
    .lte("starts_at", now)
    .gte("ends_at", now);

  if (city) {
    query = query.or(`city.is.null,city.ilike.${city}`);
  }

  const { data, error } = await query.limit(12);

  if (error || !data) {
    return [];
  }

  const results: FeaturedVehicle[] = [];

  for (const row of data) {
    type VehicleRow = {
      id: string;
      slug: string;
      title: string;
      make: string;
      model: string;
      year: number;
      category: string;
      price_per_day_aud: number;
      status: string;
      branches: { city: string; status: string };
      organizations: { name: string; status: string };
    };

    const v = row.vehicles as unknown as VehicleRow;
    if (v.status !== "approved" || v.organizations.status !== "approved") continue;
    if (v.branches.status !== "approved") continue;

    results.push({
      id: v.id,
      slug: v.slug,
      title: v.title,
      make: v.make,
      model: v.model,
      year: v.year,
      category: v.category,
      pricePerDay: v.price_per_day_aud,
      city: v.branches.city,
      organizationName: v.organizations.name,
    });
  }

  return results;
}
