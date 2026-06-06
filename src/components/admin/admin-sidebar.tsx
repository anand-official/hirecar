"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Car, 
  ShieldAlert, 
  Star, 
  CreditCard,
  LogOut,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Control Room", href: "/admin", icon: LayoutDashboard },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Listings", href: "/admin/listings", icon: Car },
  { name: "Fraud Flags", href: "/admin/fraud", icon: ShieldAlert },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Billing", href: "/admin/billing", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6 text-slate-300">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Hire Car Admin</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500/10 text-amber-500"
                  : "hover:bg-slate-900 hover:text-white"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-amber-500" : "text-slate-500 group-hover:text-slate-300"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1.5 pt-6 border-t border-slate-800">
        <Link
          href="/admin/settings"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-slate-900 hover:text-white"
        >
          <Settings className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
          Platform Settings
        </Link>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
