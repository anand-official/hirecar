import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
    const keyLooksValid =
      serviceRoleKey.startsWith("sb_secret_") || serviceRoleKey.startsWith("eyJ");

    const { error: readError } = await supabase.from("vehicles").select("id").limit(1);

    const webhookProbeId = `health_${Date.now()}`;
    const { error: webhookWriteError } = await supabase.from("stripe_webhook_events").insert({
      id: webhookProbeId,
      event_type: "health_check",
      payload: { ok: true },
      processing_status: "processing",
    });

    if (!webhookWriteError) {
      await supabase.from("stripe_webhook_events").delete().eq("id", webhookProbeId);
    }

    const healthy = !readError && !webhookWriteError;

    return NextResponse.json(
      {
        status: healthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        supabase: {
          readOk: !readError,
          webhookTableWriteOk: !webhookWriteError,
          serviceRoleKeyConfigured: serviceRoleKey.length > 0,
          serviceRoleKeyLooksValid: keyLooksValid,
          webhookWriteError: webhookWriteError?.message ?? null,
          webhookWriteCode: webhookWriteError?.code ?? null,
        },
      },
      { status: healthy ? 200 : 503 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    console.error("[Health Check] Unknown error:", err);
    return NextResponse.json(
      { status: "unhealthy", reason: message },
      { status: 503 },
    );
  }
}
