import { NextResponse, type NextRequest } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, hashIpForStorage } from "@/lib/security/rate-limit";
import { rateLimitSlidingWindow } from "@/lib/security/rate-limit-redis";
import { contactEventSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const ipHash = hashIpForStorage(ip);
  const limit = await rateLimitSlidingWindow(`contact:${ip}`, 30, 60_000);

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many contact events" }, { status: 429 });
  }

  const { data: rawBody, response: jsonError } = await readJsonBody(request);
  if (jsonError) return jsonError;

  const payload = contactEventSchema.safeParse(rawBody);

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_clicks").insert({
    vehicle_id: payload.data.vehicleId,
    vendor_id: payload.data.vendorId,
    channel: payload.data.channel,
    ip_hash: ipHash,
  });

  if (error) {
    return NextResponse.json({ error: "Unable to track contact event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
