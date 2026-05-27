import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/security/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return <DashboardShell mode="admin">{children}</DashboardShell>;
}
