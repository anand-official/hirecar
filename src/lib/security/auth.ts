import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SupabaseUser = {
  id: string;
  app_metadata?: Record<string, unknown>;
  factors?: unknown[];
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

export function userHasPlatformRole(
  user: SupabaseUser,
  roles = ["owner", "admin", "moderator"],
) {
  const platformRole = user.app_metadata?.platform_role;
  return typeof platformRole === "string" && roles.includes(platformRole);
}

export function userHasMfa(user: SupabaseUser) {
  const aal = user.app_metadata?.aal;
  const amr = user.app_metadata?.amr;

  return aal === "aal2" || (Array.isArray(amr) && amr.includes("mfa"));
}

export async function requireAdmin() {
  const user = await requireUser();

  if (!userHasPlatformRole(user)) {
    redirect("/vendor/dashboard");
  }

  if (!userHasMfa(user)) {
    redirect("/auth/sign-in?reason=mfa-required");
  }

  return user;
}
