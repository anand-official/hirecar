"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
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
  Star,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
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
  { label: "Featured", href: "/admin/featured", icon: Star },
  { label: "Leads", href: "/admin/leads", icon: MessageSquare },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Reviews", href: "/admin/reviews", icon: ClipboardList },
  { label: "Fraud", href: "/admin/fraud", icon: AlertTriangle },
  { label: "Audit", href: "/admin/audit", icon: ClipboardList },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close drawer on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setDrawerOpen(false);
    }
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (!drawerOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [drawerOpen]);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isLinkActive = useCallback(
    (href: string) => {
      if (mode === "vendor" && href === "/vendor/dashboard") {
        return pathname === href;
      }
      if (mode === "admin" && href === "/admin") {
        return pathname === href;
      }
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname, mode]
  );

  const navContent = (
    <>
      <div className="mb-2 px-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
      </div>
      {links.map(({ label, href, icon: Icon }) => {
        const isActive = isLinkActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 min-h-[44px] text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}

      <div className="mt-8 px-3 border-t border-border pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 min-h-[44px] text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              ref={triggerRef}
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-foreground hover:bg-accent transition-colors md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-bold text-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              Hire Car {mode === "admin" ? "Admin" : "Vendor"}
            </Link>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-primary/10"
          >
            <span className="hidden sm:inline">Public marketplace</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-hidden="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => {
              setDrawerOpen(false);
              triggerRef.current?.focus();
            }}
          />
          {/* Drawer panel */}
          <div
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${mode === "admin" ? "Admin" : "Vendor"} navigation`}
            className="absolute left-0 top-0 h-full w-[260px] max-w-[80vw] bg-background border-r border-border shadow-xl animate-slide-in-left"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">
                Navigation
              </span>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  triggerRef.current?.focus();
                }}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-1 p-4">{navContent}</nav>
          </div>
        </div>
      )}

      {/* Main layout with sidebar */}
      <div
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        inert={drawerOpen || undefined}
      >
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card shadow-sm p-4">
              <nav className="grid gap-1">{navContent}</nav>
            </div>
          </aside>

          {/* Content area - ≥90% viewport width on mobile */}
          <main className="min-w-0 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
