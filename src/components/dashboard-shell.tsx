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
  ExternalLink
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white text-sm font-bold">C</span>
            Carhire {mode === "admin" ? "Admin" : "Vendor"}
          </Link>
          <Link href="/search" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Public marketplace
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 h-fit lg:sticky lg:top-8">
          <nav className="grid gap-1">
            {links.map(({ label, href, icon: Icon }) => {
              // Active if exact match, or starts-with for sub-routes (but not /vendor/dashboard matching /vendor)
              const isActive = pathname === href || (href !== "/vendor/dashboard" && href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
