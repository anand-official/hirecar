import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp } from "@/lib/security/rate-limit";
import { getCurrentUser } from "@/lib/security/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = clientIp(request.headers);
    const user = await getCurrentUser();
    
    // Quick validation
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Invalid vehicle ID format" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Call the RPC to increment views
    // We use the admin client because the user might be unauthenticated and we need to write to the table
    const { error } = await supabase.rpc("increment_vehicle_view", {
      p_vehicle_id: id,
      p_ip_hash: ip,
      p_user_id: user?.id || null,
    });

    if (error) {
      console.error("Error incrementing vehicle view:", error);
      return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exception in view tracking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
