"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { 
  LayoutDashboard, 
  GitBranch, 
  Car, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  Settings,
  LayoutGrid,
  Users,
  List,
  AlertTriangle,
  ClipboardList,
  ExternalLink,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const vendorLinks = [
  { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "Branches", href: "/vendor/branches", icon: GitBranch },
  { label: "Vehicles", href: "/vendor/vehicles", icon: Car },
  { label: "Leads", href: "/vendor/leads", icon: MessageSquare },
  { label: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { label: "Billing", href: "/vendor/billing", icon: CreditCard },
  { label: "Settings", href: "/vendor/settings", icon: Settings },
];

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Vendors", href: "/admin/vendors", icon: Users },
  { label: "Branches", href: "/admin/branches", icon: GitBranch },
  { label: "Listings", href: "/admin/listings", icon: List },
  { label: "Leads", href: "/admin/leads", icon: MessageSquare },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Reviews", href: "/admin/reviews", icon: ClipboardList },
  { label: "Fraud", href: "/admin/fraud", icon: AlertTriangle },
  { label: "Audit", href: "/admin/audit", icon: ClipboardList },
];

export function DashboardShell({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "vendor" | "admin";
}) {
  const pathname = usePathname();
  const links = mode === "vendor" ? vendorLinks : adminLinks;

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-slate-900 font-heading">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Hire Car {mode === "admin" ? "Admin" : "Vendor"}
          </Link>
          <Link href="/search" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-slate-100/50 hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-primary/10">
            Public marketplace
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-4 h-fit lg:sticky lg:top-24">
          <nav className="grid gap-1.5">
            <div className="mb-2 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigation</p>
            </div>
            {links.map(({ label, href, icon: Icon }) => {
              // Active if exact match, or starts-with for sub-routes (but not /vendor/dashboard matching /vendor)
              const isActive = pathname === href || (href !== "/vendor/dashboard" && href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "" : "text-slate-400"}`} />
                  {label}
                </Link>
              );
            })}
            
            <div className="mt-8 px-3 border-t border-slate-100 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
