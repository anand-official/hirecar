import { NextResponse, type NextRequest } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, hashIpForStorage } from "@/lib/security/rate-limit";
import { rateLimitSlidingWindow } from "@/lib/security/rate-limit-redis";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { z } from "zod";

const reviewSchema = z.object({
  organizationId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  customerName: z.string().trim().min(2).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
  turnstileToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const ipHash = hashIpForStorage(ip);

  // Use distributed Redis rate limiting (falls back to memory if Redis unavailable)
  // Stricter rate limit for reviews (3 per hour per IP)
  const limit = await rateLimitSlidingWindow(`review:${ip}`, 3, 60 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many review submissions. Please try again later.",
        retryAfter: limit.retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter || 3600) } },
    );
  }

  const { data: rawBody, response: jsonError } = await readJsonBody(request);
  if (jsonError) return jsonError;

  const payload = reviewSchema.safeParse(rawBody);

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const { organizationId, vehicleId, customerName, rating, body, turnstileToken } = payload.data;

  // Verify Turnstile
  const challenge = await verifyTurnstile(turnstileToken, ip);
  if (!challenge.ok) {
    return NextResponse.json({ error: "Security challenge failed" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Verify organization exists and is approved
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, status")
    .eq("id", organizationId)
    .eq("status", "approved")
    .single();

  if (orgError || !org) {
    return NextResponse.json(
      { error: "Invalid organization or organization not approved" },
      { status: 400 },
    );
  }

  // If vehicleId provided, verify it belongs to organization
  if (vehicleId) {
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", vehicleId)
      .eq("organization_id", organizationId)
      .eq("status", "approved")
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: "Invalid vehicle or vehicle not available" },
        { status: 400 },
      );
    }
  }

  // Check for duplicate review (same name + organization within 24 hours)
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("customer_name", customerName)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();

  if (existingReview) {
    return NextResponse.json(
      { error: "You have already submitted a review recently" },
      { status: 429 },
    );
  }

  // Create review (pending approval)
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      organization_id: organizationId,
      vehicle_id: vehicleId || null,
      customer_name: customerName,
      rating,
      body,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }

  // Create fraud flag for admin moderation
  await supabase.from("fraud_flags").insert({
    resource_type: "review",
    resource_id: review.id,
    severity: "low",
    reason: `New review pending moderation (Rating: ${rating}/5)`,
    status: "open",
  });

  // Log audit event
  await supabase.from("audit_logs").insert({
    action: "review_submitted",
    resource_type: "review",
    resource_id: review.id,
    metadata: {
      organization_id: organizationId,
      vehicle_id: vehicleId,
      rating,
      ip_hash: ipHash,
    },
  });

  return NextResponse.json(
    {
      id: review.id,
      message: "Review submitted successfully and is pending approval",
    },
    { status: 201 },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  const vehicleId = searchParams.get("vehicleId");
  
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("perPage") || "50", 10)));

  if (!organizationId) {
    return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("reviews")
    .select("id, vehicle_id, customer_name, rating, body, created_at", { count: "exact" })
    .eq("organization_id", organizationId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (vehicleId) {
    query = query.eq("vehicle_id", vehicleId);
  }

  const offset = (page - 1) * perPage;
  const { data: reviews, count, error } = await query.range(offset, offset + perPage - 1);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }

  return NextResponse.json({ 
    reviews: reviews ?? [],
    pagination: {
      page,
      perPage,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / perPage)
    }
  });
}
