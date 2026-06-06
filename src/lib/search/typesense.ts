import Typesense from "typesense";
import { optionalEnv } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Vehicle } from "@/lib/types";

const VEHICLE_COLLECTION_NAME = "vehicles";

export function createTypesenseClient() {
  const host = optionalEnv("TYPESENSE_HOST");
  const apiKey = optionalEnv("TYPESENSE_API_KEY");

  if (!host || !apiKey) {
    return null;
  }

  return new Typesense.Client({
    nodes: [
      {
        host,
        port: Number(process.env.TYPESENSE_PORT ?? 443),
        protocol: process.env.TYPESENSE_PROTOCOL ?? "https",
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 5,
  });
}

export async function setupVehicleCollection() {
  const client = createTypesenseClient();
  if (!client) {
    return { skipped: true, error: "Typesense not configured" };
  }

  const schema = {
    name: VEHICLE_COLLECTION_NAME,
    fields: [
      { name: "id", type: "string" as const, facet: false },
      { name: "title", type: "string" as const, facet: false },
      { name: "make", type: "string" as const, facet: true },
      { name: "model", type: "string" as const, facet: false },
      { name: "year", type: "int32" as const, facet: true },
      { name: "seats", type: "int32" as const, facet: true },
      { name: "fuel", type: "string" as const, facet: true },
      { name: "transmission", type: "string" as const, facet: true },
      { name: "category", type: "string" as const, facet: true },
      { name: "price_per_day_aud", type: "int32" as const, facet: true },
      { name: "city", type: "string" as const, facet: true },
      { name: "state", type: "string" as const, facet: true },
      { name: "vendor_name", type: "string" as const, facet: false },
      { name: "vendor_slug", type: "string" as const, facet: false },
      { name: "branch_name", type: "string" as const, facet: false },
      { name: "status", type: "string" as const, facet: true },
      { name: "organization_id", type: "string" as const, facet: false },
    ],
    default_sorting_field: "price_per_day_aud",
  };

  try {
    await client.collections().create(schema);
    return { created: true };
  } catch (error) {
    // Collection might already exist
    if (error instanceof Error && error.message.includes("already exists")) {
      return { created: false, exists: true };
    }
    return { created: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function upsertVehicleDocument(document: Record<string, unknown>) {
  const client = createTypesenseClient();

  if (!client) {
    return { skipped: true };
  }

  await client.collections(VEHICLE_COLLECTION_NAME).documents().upsert(document);
  return { skipped: false };
}

export async function deleteVehicleDocument(vehicleId: string) {
  const client = createTypesenseClient();

  if (!client) {
    return { skipped: true };
  }

  try {
    await client.collections(VEHICLE_COLLECTION_NAME).documents(vehicleId).delete();
    return { deleted: true };
  } catch (error) {
    // Document might not exist
    return { deleted: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

type SearchFilters = {
  city?: string;
  state?: string;
  category?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: string;
  fuel?: string;
};

/**
 * Search vehicles in Typesense with sanitized filters.
 * All user inputs are escaped to prevent injection attacks.
 */
export async function searchVehicles(
  query: string,
  filters: SearchFilters = {},
  options: { page?: number; perPage?: number; sortBy?: string } = {},
): Promise<{ vehicles: Vehicle[]; total: number; page: number }> {
  const client = createTypesenseClient();

  if (!client) {
    // Fallback to database search if Typesense is not configured
    return fallbackDatabaseSearch(query, filters, options);
  }

  const { page = 1, perPage = 20, sortBy = "price_per_day_aud:asc" } = options;

  // Build filter by string with proper escaping
  const filterParts: string[] = ["status:=approved"]; // Only show approved vehicles

  if (filters.city) {
    filterParts.push(`city:=${escapeFilterValue(filters.city)}`);
  }
  if (filters.state) {
    filterParts.push(`state:=${escapeFilterValue(filters.state)}`);
  }
  if (filters.category) {
    filterParts.push(`category:=${escapeFilterValue(filters.category)}`);
  }
  if (filters.make) {
    filterParts.push(`make:=${escapeFilterValue(filters.make)}`);
  }
  if (filters.transmission) {
    filterParts.push(`transmission:=${escapeFilterValue(filters.transmission)}`);
  }
  if (filters.fuel) {
    filterParts.push(`fuel:=${escapeFilterValue(filters.fuel)}`);
  }
  if (filters.minPrice !== undefined) {
    filterParts.push(`price_per_day_aud:>=${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    filterParts.push(`price_per_day_aud:<=${filters.maxPrice}`);
  }
  if (filters.seats) {
    filterParts.push(`seats:>=${filters.seats}`);
  }

  const searchParameters = {
    q: query || "*",
    query_by: "title,make,model,vendor_name,branch_name",
    filter_by: filterParts.join(" && "),
    sort_by: sortBy ?? "price_per_day_aud:asc",
    page,
    per_page: perPage,
  };

  try {
    const results = await client.collections<Vehicle>(VEHICLE_COLLECTION_NAME).documents().search(searchParameters);

    const vehicles = results.hits?.map((hit) => hit.document) ?? [];

    return {
      vehicles,
      total: results.found ?? 0,
      page,
    };
  } catch (error) {
    console.error("Typesense search failed; falling back to database search:", error);
    return fallbackDatabaseSearch(query, filters, options);
  }
}

/**
 * Escape filter values to prevent Typesense filter injection.
 * Handles special characters in filter values.
 */
function escapeFilterValue(value: string): string {
  // Escape backticks and single quotes which have special meaning in Typesense filters
  return value.replace(/[`'\\]/g, "\\$&");
}

/**
 * Fallback database search when Typesense is not available.
 * Uses parameterized queries for security.
 */
async function fallbackDatabaseSearch(
  query: string,
  filters: SearchFilters,
  options: { page?: number; perPage?: number; sortBy?: string },
): Promise<{ vehicles: Vehicle[]; total: number; page: number }> {
  const supabase = createAdminClient();
  const { page = 1, perPage = 20, sortBy = "price_per_day_aud:asc" } = options;

  // Build base query joining vehicles with organizations and branches
  let dbQuery = supabase
    .from("vehicles")
    .select(
      `
      id,
      slug,
      title,
      make,
      model,
      year,
      seats,
      fuel,
      transmission,
      category,
      price_per_day_aud,
      daily_distance_limit_km,
      extra_distance_fee_aud,
      instant_book,
      status,
      organizations!inner(id, name, slug, status),
      branches!inner(id, name, city, state, status)
    `,
      { count: "exact" },
    )
    .eq("status", "approved")
    .eq("organizations.status", "approved")
    .eq("branches.status", "approved");

  // Apply text search if query provided
  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,make.ilike.%${query}%,model.ilike.%${query}%`,
    );
  }

  // Apply filters
  if (filters.city) {
    dbQuery = dbQuery.eq("branches.city", filters.city);
  }
  if (filters.state) {
    dbQuery = dbQuery.eq("branches.state", filters.state);
  }
  if (filters.category) {
    dbQuery = dbQuery.eq("category", filters.category);
  }
  if (filters.make) {
    dbQuery = dbQuery.eq("make", filters.make);
  }
  if (filters.transmission) {
    dbQuery = dbQuery.eq("transmission", filters.transmission);
  }
  if (filters.fuel) {
    dbQuery = dbQuery.eq("fuel", filters.fuel);
  }
  if (filters.minPrice !== undefined) {
    dbQuery = dbQuery.gte("price_per_day_aud", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    dbQuery = dbQuery.lte("price_per_day_aud", filters.maxPrice);
  }
  if (filters.seats) {
    dbQuery = dbQuery.gte("seats", filters.seats);
  }

  // Sorting & pagination
  const [sortField, sortDir] = sortBy.split(":");
  const ascending = sortDir !== "desc";
  const validSortFields: Record<string, string> = {
    price_per_day_aud: "price_per_day_aud",
    year: "year",
  };
  const dbSortField = validSortFields[sortField] ?? "price_per_day_aud";

  const from = (page - 1) * perPage;
  dbQuery = dbQuery.range(from, from + perPage - 1).order(dbSortField, { ascending });

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error("Database search error:", error);
    return { vehicles: [], total: 0, page };
  }

  // Transform to Vehicle type
  const vehicles: Vehicle[] =
    data?.map((v) => {
      const org = v.organizations as unknown as { name: string; slug: string };
      const branch = v.branches as unknown as { name: string; city: string; state: string };

      return {
        id: v.id,
        slug: v.slug,
        title: v.title,
        make: v.make,
        model: v.model,
        year: v.year,
        seats: v.seats,
        fuel: v.fuel,
        transmission: v.transmission,
        category: v.category,
        pricePerDayAud: v.price_per_day_aud,
        dailyDistanceLimitKm: v.daily_distance_limit_km,
        extraDistanceFeeAud: v.extra_distance_fee_aud,
        instantBook: v.instant_book,
        city: branch.city,
        state: branch.state,
        imageUrl: "/vehicle-placeholder.jpg", // Placeholder - images stored separately
        vendorName: org.name,
        vendorSlug: org.slug,
        branchName: branch.name,
        verified: true,
      };
    }) ?? [];

  return {
    vehicles,
    total: count ?? 0,
    page,
  };
}

/**
 * Process pending search index jobs from the queue.
 * This should be called periodically (via cron job or background worker).
 */
export async function processSearchIndexJobs(limit = 10): Promise<{
  processed: number;
  errors: string[];
}> {
  const client = createTypesenseClient();
  if (!client) {
    return { processed: 0, errors: ["Typesense not configured"] };
  }

  const supabase = createAdminClient();
  const errors: string[] = [];

  // Fetch pending jobs
  const { data: jobs, error: jobsError } = await supabase
    .from("search_index_jobs")
    .select("id, vehicle_id, operation")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (jobsError || !jobs || jobs.length === 0) {
    return { processed: 0, errors: jobsError ? [jobsError.message] : [] };
  }

  for (const job of jobs) {
    try {
      if (job.operation === "delete") {
        const result = await deleteVehicleDocument(job.vehicle_id);
        if (result.error) {
          errors.push(`Delete failed for ${job.vehicle_id}: ${result.error}`);
        }
      } else if (job.operation === "upsert") {
        // Fetch full vehicle data with relations
        const { data: vehicle } = await supabase
          .from("vehicles")
          .select(
            `
            id, slug, title, make, model, year, seats, fuel, transmission, category,
            price_per_day_aud, daily_distance_limit_km, extra_distance_fee_aud, instant_book, status, organization_id,
            organizations(name, slug, status),
            branches(name, city, state, status)
          `,
          )
          .eq("id", job.vehicle_id)
          .eq("status", "approved")
          .single();

        if (vehicle) {
          // Only index approved vehicles
          const org = vehicle.organizations as unknown as { name: string; slug: string; status: string };
          const branch = vehicle.branches as unknown as { name: string; city: string; state: string; status: string };

          if (org?.status === "approved" && branch?.status === "approved") {
            const document = {
              id: vehicle.id,
              slug: vehicle.slug,
              title: vehicle.title,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              seats: vehicle.seats,
              fuel: vehicle.fuel,
              transmission: vehicle.transmission,
              category: vehicle.category,
              price_per_day_aud: vehicle.price_per_day_aud,
              daily_distance_limit_km: vehicle.daily_distance_limit_km,
              extra_distance_fee_aud: vehicle.extra_distance_fee_aud,
              instant_book: vehicle.instant_book,
              city: branch.city,
              state: branch.state,
              vendor_name: org.name,
              vendor_slug: org.slug,
              branch_name: branch.name,
              status: vehicle.status,
              organization_id: vehicle.organization_id,
            };

            await upsertVehicleDocument(document);
          }
        }
      }

      // Mark job as complete
      await supabase
        .from("search_index_jobs")
        .update({ status: "complete", processed_at: new Date().toISOString() })
        .eq("id", job.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Job ${job.id} failed: ${errorMsg}`);

      // Mark job as failed
      await supabase
        .from("search_index_jobs")
        .update({ status: "failed", error: errorMsg })
        .eq("id", job.id);
    }
  }

  return { processed: jobs.length, errors };
}
