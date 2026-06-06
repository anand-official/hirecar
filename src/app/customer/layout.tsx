import Link from "next/link";
import { requireUser } from "@/lib/security/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LayoutDashboard, MessageCircle, Settings, LogOut } from "lucide-react";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  const navItems = [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "My Enquiries", href: "/customer/enquiries", icon: MessageCircle },
    { name: "Settings", href: "/customer/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-[88px]">
      <SiteHeader />
      
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white hover:text-amber-600 hover:shadow-sm transition-all"
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="mt-8 pt-6 border-t border-slate-200">
                <form action="/auth/sign-out" method="post">
                  <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
                    <LogOut className="h-4.5 w-4.5" />
                    Sign Out
                  </button>
                </form>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {children}
          </main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
