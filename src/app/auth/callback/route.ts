import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  type AuthRole,
  resolvePostAuthDestination,
} from "@/lib/routing";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const rawRole = requestUrl.searchParams.get("role");
  const plan = requestUrl.searchParams.get("plan");

  const role: AuthRole | null =
    rawRole === "customer" || rawRole === "vendor" ? rawRole : null;

  const next = resolvePostAuthDestination(role, rawNext, plan);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth exchange failed:", error.message);
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=auth_failed", requestUrl.origin),
      );
    }

    if (data.user) {
      const admin = createAdminClient();

      await admin.from("profiles").upsert({
        id: data.user.id,
        full_name:
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          null,
        email: data.user.email,
        updated_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
