import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isVendorPreOrgPath } from "@/lib/routing";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const path = request.nextUrl.pathname;
  const isAdminRoute =
    path.startsWith("/admin") && !path.startsWith("/admin-login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute =
    path.startsWith("/customer") ||
    path.startsWith("/vendor") ||
    path.startsWith("/messages") ||
    isAdminRoute;

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set(
      "redirectedFrom",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Vendor zone: customers without an org see the upgrade prompt first
  if (user && path.startsWith("/vendor") && !isVendorPreOrgPath(path)) {
    const { count } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) === 0) {
      const from = request.nextUrl.pathname + request.nextUrl.search;
      const plan = request.nextUrl.searchParams.get("plan");
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/vendor/upgrade";
      redirectUrl.search = "";
      if (plan) redirectUrl.searchParams.set("plan", plan);
      redirectUrl.searchParams.set("from", from);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
