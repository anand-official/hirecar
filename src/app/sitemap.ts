import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 1000;
const base = "https://www.hirecar.com.au";

export async function generateSitemaps() {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved");
      
    const total = count || 0;
    const numChunks = Math.ceil(total / PAGE_SIZE) || 1;
    
    return Array.from({ length: numChunks }, (_, i) => ({ id: i }));
  } catch {
    // Fallback to a single chunk if the DB fails during build
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const chunkId = typeof id === "number" ? id : 0;
  
  // Static routes (only output on first chunk)
  const staticRoutes: MetadataRoute.Sitemap = chunkId === 0 ? [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ] : [];

  // Location pages (only output on first chunk)
  const cities = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"];
  const locationRoutes: MetadataRoute.Sitemap = chunkId === 0 ? cities.map((city) => ({
    url: `${base}/search?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  })) : [];

  // Dynamic vehicle pages from DB for this chunk
  let vehicleRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const start = chunkId * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;
    
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("slug, updated_at")
      .eq("status", "approved")
      .order("updated_at", { ascending: false })
      .range(start, end);

    if (vehicles) {
      vehicleRoutes = vehicles.map((v) => ({
        url: `${base}/cars/${v.slug}`,
        lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Sitemap generation fails gracefully if DB is unavailable
  }

  // Dynamic vendor pages from DB (only output on first chunk)
  let vendorRoutes: MetadataRoute.Sitemap = [];
  if (chunkId === 0) {
    try {
      const supabase = createAdminClient();
      const { data: vendors } = await supabase
        .from("organizations")
        .select("slug, updated_at")
        .eq("status", "approved")
        .limit(2000); // 2k vendors max in first chunk is fine

      if (vendors) {
        vendorRoutes = vendors.map((v) => ({
          url: `${base}/vendors/${v.slug}`,
          lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
      }
    } catch {
      // Fails gracefully
    }
  }

  return [...staticRoutes, ...locationRoutes, ...vehicleRoutes, ...vendorRoutes];
}
