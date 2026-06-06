import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Validates that a redirect target is a safe same-origin relative path.
 * Prevents open redirect attacks via the ?next= parameter.
 */
function isSafeRedirectPath(next: string): boolean {
  // Must start with "/" but not "//" (protocol-relative URL)
  if (!next.startsWith("/") || next.startsWith("//")) return false;
  // Must not contain a protocol colon (e.g. "javascript:", "data:")
  if (next.includes(":")) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/vendor/dashboard";
  // Only allow same-origin relative paths; fall back to dashboard for anything suspicious
  const next = isSafeRedirectPath(rawNext) ? rawNext : "/vendor/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth exchange failed:", error.message);
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=auth_failed", requestUrl.origin)
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
