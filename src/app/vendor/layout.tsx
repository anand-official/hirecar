import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/security/auth";

export const dynamic = "force-dynamic";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return <DashboardShell mode="vendor">{children}</DashboardShell>;
}
