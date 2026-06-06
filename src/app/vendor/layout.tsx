import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/security/auth";

import { getVendorContext } from "@/lib/data/vendor";

export const dynamic = "force-dynamic";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const context = await getVendorContext(user.id);

  if (context.organizations.length === 0) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return <DashboardShell mode="vendor">{children}</DashboardShell>;
}
