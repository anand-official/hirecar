import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLeadAlert } from "@/lib/email/resend";
import { clientIp } from "@/lib/security/rate-limit";
import { rateLimitSlidingWindow } from "@/lib/security/rate-limit-redis";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { leadSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);

  // Use distributed Redis rate limiting (falls back to memory if Redis unavailable)
  const limit = await rateLimitSlidingWindow(`lead:${ip}`, 5, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many lead submissions",
        retryAfter: limit.retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter || 60) } },
    );
  }

  const payload = leadSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const challenge = await verifyTurnstile(payload.data.turnstileToken, ip);

  if (!challenge.ok) {
    return NextResponse.json({ error: "Security challenge failed" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Validate vehicle exists and is approved
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, title, organization_id, status, branch_id")
    .eq("id", payload.data.vehicleId)
    .eq("organization_id", payload.data.vendorId)
    .eq("status", "approved")
    .single();

  if (vehicleError || !vehicle) {
    return NextResponse.json(
      { error: "Invalid vehicle or vehicle not available" },
      { status: 400 },
    );
  }

  // Validate organization is approved
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id, status, billing_email")
    .eq("id", payload.data.vendorId)
    .eq("status", "approved")
    .single();

  if (orgError || !organization) {
    return NextResponse.json(
      { error: "Invalid vendor or vendor not available" },
      { status: 400 },
    );
  }

  // SECURITY: Validate pickup city matches one of the vendor's branch cities
  // This prevents spam leads with fake pickup locations
  const { data: branches } = await supabase
    .from("branches")
    .select("city")
    .eq("organization_id", payload.data.vendorId)
    .eq("status", "approved");

  const validCities = new Set(branches?.map((b) => b.city.toLowerCase()) ?? []);
  const requestedCity = payload.data.pickupCity.toLowerCase();

  if (!validCities.has(requestedCity)) {
    // Log potential spam/fraud attempt
    await supabase.from("fraud_flags").insert({
      resource_type: "lead",
      resource_id: "pending", // Will be updated after lead creation if we allow it
      severity: "medium",
      reason: `Pickup city "${payload.data.pickupCity}" does not match vendor's branch cities: ${Array.from(validCities).join(", ")}`,
      status: "open",
    });

    return NextResponse.json(
      { error: `Pickup location must be one of the vendor's service areas: ${Array.from(validCities).join(", ")}` },
      { status: 400 },
    );
  }

  // Check for duplicate lead within last hour (same email + vehicle)
  const { data: duplicateLead } = await supabase
    .from("leads")
    .select("id")
    .eq("vehicle_id", payload.data.vehicleId)
    .eq("customer_email", payload.data.email)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .maybeSingle();

  if (duplicateLead) {
    return NextResponse.json(
      { error: "Duplicate lead detected. Please wait before submitting again." },
      { status: 429 },
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      vehicle_id: payload.data.vehicleId,
      vendor_id: payload.data.vendorId,
      customer_name: payload.data.name,
      customer_email: payload.data.email,
      customer_phone: payload.data.phone,
      pickup_city: payload.data.pickupCity,
      start_date: payload.data.startDate,
      end_date: payload.data.endDate,
      message: payload.data.message,
      ip_hash: ip,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Unable to save lead" }, { status: 500 });
  }

  // Log lead event
  await supabase.from("lead_events").insert({
    lead_id: lead.id,
    event_type: "submitted",
    metadata: { ip_hash: ip },
  });

  // Send lead alert to vendor's actual billing email
  const vendorEmail = organization.billing_email;
  if (vendorEmail) {
    await sendLeadAlert({
      to: vendorEmail,
      vehicleTitle: vehicle.title,
      customerName: payload.data.name,
    });
  }

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
