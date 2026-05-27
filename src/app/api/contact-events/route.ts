import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { contactEventSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = rateLimit(`contact:${ip}`, 30, 60_000);

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many contact events" }, { status: 429 });
  }

  const payload = contactEventSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_clicks").insert({
    vehicle_id: payload.data.vehicleId,
    vendor_id: payload.data.vendorId,
    channel: payload.data.channel,
    ip_hash: ip,
  });

  if (error) {
    return NextResponse.json({ error: "Unable to track contact event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
