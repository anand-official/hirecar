import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/security/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-300 selection:bg-amber-500/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-900 border-l border-slate-800 shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
