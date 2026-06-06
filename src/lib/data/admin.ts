import { createAdminClient } from "@/lib/supabase/admin";

export type AdminDashboardMetrics = {
  // Vendor moderation
  pendingVendors: number;
  totalVendors: number;
  suspendedVendors: number;

  // Listing moderation
  pendingListings: number;
  totalListings: number;
  suspendedListings: number;

  // Fraud & abuse
  openFraudFlags: number;
  totalFraudFlags: number;
  newFraudFlagsToday: number;

  // Webhooks
  failedWebhooks: number;
  totalWebhooks: number;
  webhooksLast24h: number;

  // Platform activity
  totalLeads: number;
  leadsToday: number;
  totalReviews: number;
  pendingReviews: number;

  // Subscriptions
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  revenueEstimate: number;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Run all counts in parallel
  const [
    // Vendors
    { count: pendingVendors },
    { count: totalVendors },
    { count: suspendedVendors },

    // Listings (vehicles)
    { count: pendingListings },
    { count: totalListings },
    { count: suspendedListings },

    // Fraud flags
    { count: openFraudFlags },
    { count: totalFraudFlags },
    { data: newFraudFlags },

    // Webhooks
    { count: failedWebhooks },
    { count: totalWebhooks },
    { data: webhooksLast24h },

    // Leads
    { count: totalLeads },
    { data: leadsToday },

    // Reviews
    { count: totalReviews },
    { count: pendingReviews },

    // Subscriptions
    { count: activeSubscriptions },
    { count: pastDueSubscriptions },
  ] = await Promise.all([
    // Vendors
    supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("status", "suspended"),

    // Listings
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("vehicles").select("id", { count: "exact", head: true }),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "suspended"),

    // Fraud flags
    supabase.from("fraud_flags").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("fraud_flags").select("id", { count: "exact", head: true }),
    supabase
      .from("fraud_flags")
      .select("id")
      .gte("created_at", today)
      .then(({ data, error }) => ({ data: data?.length ?? 0, error })),

    // Webhooks
    supabase
      .from("stripe_webhook_events")
      .select("id", { count: "exact", head: true })
      .eq("processing_status", "failed"),
    supabase.from("stripe_webhook_events").select("id", { count: "exact", head: true }),
    supabase
      .from("stripe_webhook_events")
      .select("id")
      .gte("processed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .then(({ data, error }) => ({ data: data?.length ?? 0, error })),

    // Leads
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id")
      .gte("created_at", today)
      .then(({ data, error }) => ({ data: data?.length ?? 0, error })),

    // Reviews
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),

    // Subscriptions
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "past_due"),
  ]);

  // Calculate estimated revenue (simplified)
  const { data: plans } = await supabase.from("subscriptions").select("plan_code").eq("status", "active");

  const planPrices: Record<string, number> = {
    starter: 49,
    growth: 149,
    pro: 399,
    business: 999,
    enterprise: 2499,
  };

  const revenueEstimate =
    (plans ?? []).reduce((sum, sub) => {
      return sum + (planPrices[sub.plan_code] ?? 0);
    }, 0) * 12; // Annual estimate

  return {
    pendingVendors: pendingVendors ?? 0,
    totalVendors: totalVendors ?? 0,
    suspendedVendors: suspendedVendors ?? 0,
    pendingListings: pendingListings ?? 0,
    totalListings: totalListings ?? 0,
    suspendedListings: suspendedListings ?? 0,
    openFraudFlags: openFraudFlags ?? 0,
    totalFraudFlags: totalFraudFlags ?? 0,
    newFraudFlagsToday: newFraudFlags ?? 0,
    failedWebhooks: failedWebhooks ?? 0,
    totalWebhooks: totalWebhooks ?? 0,
    webhooksLast24h: webhooksLast24h ?? 0,
    totalLeads: totalLeads ?? 0,
    leadsToday: leadsToday ?? 0,
    totalReviews: totalReviews ?? 0,
    pendingReviews: pendingReviews ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    pastDueSubscriptions: pastDueSubscriptions ?? 0,
    revenueEstimate,
  };
}

export type PendingVendor = {
  id: string;
  name: string;
  slug: string;
  abn: string;
  email: string;
  website: string | null;
  phone: string;
  address: string;
  createdAt: string;
  branchCount: number;
};

export async function getPendingVendors(limit = 50): Promise<PendingVendor[]> {
  const supabase = createAdminClient();

  const { data: vendors, error } = await supabase
    .from("organizations")
    .select(
      `
      id,
      name,
      slug,
      abn,
      billing_email,
      website,
      phone,
      address,
      created_at,
      branches(id)
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch pending vendors: ${error.message}`);
  }

  return (
    vendors?.map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      abn: v.abn,
      email: v.billing_email ?? "",
      website: v.website,
      phone: v.phone ?? "",
      address: v.address ?? "",
      createdAt: v.created_at,
      branchCount: (v.branches as unknown as { id: string }[])?.length ?? 0,
    })) ?? []
  );
}

export type PendingListing = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  vendorName: string;
  vendorId: string;
  branchName: string;
  createdAt: string;
};

export async function getPendingListings(limit = 50): Promise<PendingListing[]> {
  const supabase = createAdminClient();

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select(
      `
      id,
      title,
      make,
      model,
      year,
      category,
      price_per_day_aud,
      organization_id,
      branch_id,
      created_at,
      organizations(name),
      branches(name)
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch pending listings: ${error.message}`);
  }

  return (
    vehicles?.map((v) => ({
      id: v.id,
      title: v.title,
      make: v.make,
      model: v.model,
      year: v.year,
      category: v.category,
      pricePerDay: v.price_per_day_aud,
      vendorId: v.organization_id,
      vendorName: (v.organizations as unknown as { name: string })?.name ?? "Unknown",
      branchName: (v.branches as unknown as { name: string })?.name ?? "Unknown",
      createdAt: v.created_at,
    })) ?? []
  );
}

export type FraudFlagWithDetails = {
  id: string;
  resourceType: string;
  resourceId: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  status: "open" | "reviewing" | "closed";
  createdAt: string;
  // Additional details based on type
  vendorName?: string;
  vehicleTitle?: string;
};

export async function getOpenFraudFlags(limit = 50): Promise<FraudFlagWithDetails[]> {
  const supabase = createAdminClient();

  const { data: flags, error } = await supabase
    .from("fraud_flags")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch fraud flags: ${error.message}`);
  }

  // Fetch additional details for each flag
  const enrichedFlags: FraudFlagWithDetails[] = await Promise.all(
    (flags ?? []).map(async (flag) => {
      let vendorName: string | undefined;
      let vehicleTitle: string | undefined;

      if (flag.resource_type === "vendor" || flag.resource_type === "organization") {
        const { data } = await supabase.from("organizations").select("name").eq("id", flag.resource_id).single();
        vendorName = data?.name;
      } else if (flag.resource_type === "vehicle" || flag.resource_type === "lead_attempt") {
        const { data } = await supabase
          .from("vehicles")
          .select("title, organizations(name)")
          .eq("id", flag.resource_id)
          .single();
        vehicleTitle = (data as unknown as { title: string })?.title;
        vendorName = (data as unknown as { organizations: { name: string } })?.organizations?.name;
      }

      return {
        id: flag.id,
        resourceType: flag.resource_type,
        resourceId: flag.resource_id,
        severity: flag.severity as FraudFlagWithDetails["severity"],
        reason: flag.reason,
        status: flag.status as FraudFlagWithDetails["status"],
        createdAt: flag.created_at,
        vendorName,
        vehicleTitle,
      };
    }),
  );

  return enrichedFlags;
}

export type PendingReview = {
  id: string;
  customerName: string;
  rating: number;
  body: string;
  vendorName: string;
  vendorId: string;
  vehicleTitle: string | null;
  createdAt: string;
};

export async function getPendingReviews(limit = 50): Promise<PendingReview[]> {
  const supabase = createAdminClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      customer_name,
      rating,
      body,
      organization_id,
      vehicle_id,
      created_at,
      organizations(name),
      vehicles(title)
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch pending reviews: ${error.message}`);
  }

  return (
    reviews?.map((r) => ({
      id: r.id,
      customerName: r.customer_name,
      rating: r.rating,
      body: r.body,
      vendorId: r.organization_id,
      vendorName: (r.organizations as unknown as { name: string })?.name ?? "Unknown",
      vehicleTitle: (r.vehicles as unknown as { title: string })?.title ?? null,
      createdAt: r.created_at,
    })) ?? []
  );
}
