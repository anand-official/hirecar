"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Hardcoded for the platform owner as requested
const ADMIN_ID = "UJJAWAL";
const ADMIN_PASS = "PROJECT@2026";

export async function loginAdmin(prevState: any, formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === ADMIN_ID && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    // In a real app, you'd use a signed JWT, but for this specific bypass request:
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
    redirect("/admin");
  }

  return { error: "Invalid credentials" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin-login");
}
