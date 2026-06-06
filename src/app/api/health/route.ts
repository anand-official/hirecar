import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Perform a lightweight query to check database connectivity
    const { error } = await supabase
      .from("vehicles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[Health Check] Database error:", error);
      return NextResponse.json(
        { status: "unhealthy", reason: "database_error" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: "healthy", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Health Check] Unknown error:", err);
    return NextResponse.json(
      { status: "unhealthy", reason: "unknown_error" },
      { status: 503 }
    );
  }
}
