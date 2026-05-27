import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/vendor/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

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
