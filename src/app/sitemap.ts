import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIndexableSitemapUrls } from "@/lib/seo/discovery";

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
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const chunkId = typeof id === "number" ? id : 0;

  const staticRoutes: MetadataRoute.Sitemap = chunkId === 0 ? [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/locations`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.5 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/for-vendors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/for-vendors/api`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/vendors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/legal/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ] : [];

  let pseoRoutes: MetadataRoute.Sitemap = [];
  if (chunkId === 0) {
    try {
      const { cityUrls, categoryUrls, cityCategoryUrls } = await getIndexableSitemapUrls();
      const now = new Date();
      pseoRoutes = [
        ...cityUrls.map((path) => ({
          url: `${base}${path}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        })),
        ...categoryUrls.map((path) => ({
          url: `${base}${path}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.75,
        })),
        ...cityCategoryUrls.map((path) => ({
          url: `${base}${path}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
      ];
    } catch {
      // graceful fallback
    }
  }

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
    // graceful fallback
  }

  let vendorRoutes: MetadataRoute.Sitemap = [];
  if (chunkId === 0) {
    try {
      const supabase = createAdminClient();
      const { data: vendors } = await supabase
        .from("organizations")
        .select("slug, updated_at")
        .eq("status", "approved")
        .limit(2000);

      if (vendors) {
        vendorRoutes = vendors.map((v) => ({
          url: `${base}/vendors/${v.slug}`,
          lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
      }
    } catch {
      // graceful fallback
    }
  }

  return [...staticRoutes, ...pseoRoutes, ...vehicleRoutes, ...vendorRoutes];
}
