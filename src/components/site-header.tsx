"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Phone, 
  ChevronDown, 
  MapPin,
  Car
} from "lucide-react";

const locations = [
  { name: "Sydney", href: "/search?city=Sydney" },
  { name: "Melbourne", href: "/search?city=Melbourne" },
  { name: "Brisbane", href: "/search?city=Brisbane" },
  { name: "Perth", href: "/search?city=Perth" },
  { name: "Adelaide", href: "/search?city=Adelaide" },
  { name: "Gold Coast", href: "/search?city=Gold%20Coast" },
];

const vehicleCategories = [
  { name: "Sedans", href: "/search?category=Sedan" },
  { name: "SUVs", href: "/search?category=SUV" },
  { name: "People Movers", href: "/search?category=People%20mover" },
  { name: "Vans", href: "/search?category=Van" },
  { name: "Luxury", href: "/search?category=Luxury" },
];

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "glass border-b border-slate-200/40 shadow-sm" 
            : "bg-transparent"
        }`}
      >
        {/* Top Bar - Shows on scroll for CTA visibility */}
        <div className={`bg-slate-950 text-white text-xs transition-all duration-500 overflow-hidden ${isScrolled ? "max-h-0" : "max-h-10"}`}>
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between">
            <p className="text-slate-400 font-medium tracking-wide">
              Australia&apos;s trusted premium car rental marketplace
            </p>
            <a href="tel:1800123456" className="flex items-center gap-2 hover:text-primary transition-colors font-medium">
              <Phone className="h-3.5 w-3.5" />
              1800 123 456
            </a>
          </div>
        </div>

        {/* Main Header */}
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className={`flex items-center gap-2 text-xl font-bold tracking-tight transition-colors ${
                isScrolled ? "text-slate-900" : "text-white"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 shadow-md ${
                isScrolled ? "bg-slate-950 text-white" : "bg-primary text-primary-foreground"
              }`}>
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </span>
              <span className="hidden sm:inline font-heading">Carhire</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              {/* Locations Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown("locations")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 ${
                    isScrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"
                  }`}
                >
                  Locations
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeDropdown === "locations" ? "rotate-180 text-primary" : ""}`} />
                </button>
                
                {activeDropdown === "locations" && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 glass rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden animate-scale-in origin-top">
                    <div className="p-3 grid gap-1">
                      {locations.map((loc) => (
                        <Link
                          key={loc.name}
                          href={loc.href}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <MapPin className="h-4 w-4" />
                          </div>
                          {loc.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicles Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown("vehicles")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 ${
                    isScrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"
                  }`}
                >
                  Vehicles
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeDropdown === "vehicles" ? "rotate-180 text-primary" : ""}`} />
                </button>
                
                {activeDropdown === "vehicles" && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 glass rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden animate-scale-in origin-top">
                    <div className="p-3 grid gap-1">
                      {vehicleCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Car className="h-4 w-4" />
                          </div>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/pricing" 
                className={`text-sm font-semibold transition-colors py-2 ${
                  isScrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-semibold transition-colors py-2 ${
                  isScrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"
                }`}
              >
                Contact
              </Link>

            </nav>

            {/* CTA & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              {/* Phone CTA - Mobile */}
              <a 
                href="tel:1800123456" 
                className="md:hidden flex items-center gap-2 text-sm"
              >
                <span className={`${isScrolled ? "text-slate-900" : "text-white"}`}>
                  <Phone className="h-5 w-5" />
                </span>
              </a>

              <Link
                href="/auth/sign-in"
                className={`hidden sm:inline-flex rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-sm ${
                  isScrolled 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5" 
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur"
                }`}
              >
                Log In
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-colors ${
                  isScrolled 
                    ? "text-slate-900 hover:bg-slate-100" 
                    : "text-white hover:bg-white/20 backdrop-blur"
                }`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) md:hidden shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold text-slate-900" onClick={closeMobileMenu}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </span>
              <span className="font-heading">Carhire</span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <nav className="flex-1 overflow-y-auto p-5">
            <div className="space-y-8">
              {/* Quick Search */}
              <Link 
                href="/search" 
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl text-primary font-bold hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Car className="h-5 w-5" />
                </div>
                Find a rental car
              </Link>

              {/* Locations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
                  Popular Locations
                </h3>
                <div className="space-y-1">
                  {locations.map((loc) => (
                    <Link
                      key={loc.name}
                      href={loc.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-4 px-3 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary font-medium rounded-xl transition-colors"
                    >
                      <MapPin className="h-5 w-5 text-slate-400" />
                      {loc.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Vehicle Types */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
                  Vehicle Types
                </h3>
                <div className="space-y-1">
                  {vehicleCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-4 px-3 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary font-medium rounded-xl transition-colors"
                    >
                      <Car className="h-5 w-5 text-slate-400" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <a 
              href="tel:1800123456" 
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Call 1800 123 456
            </a>
            <Link
              href="/auth/sign-in"
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-md"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}