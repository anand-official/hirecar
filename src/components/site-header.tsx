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
  Car,
  Building2
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled 
            ? "glass border-b border-slate-200/50" 
            : "bg-transparent"
        }`}
      >
        {/* Top Bar - Shows on scroll for CTA visibility */}
        <div className={`bg-slate-950 text-white text-xs transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0" : "max-h-10"}`}>
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between">
            <p className="text-slate-400">
              Australia&apos;s trusted car rental marketplace
            </p>
            <a href="tel:1800123456" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Phone className="h-3 w-3" />
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
              className={`flex items-center gap-2 text-lg font-semibold transition-colors ${
                isScrolled ? "text-slate-900" : "text-white"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                isScrolled ? "bg-slate-950 text-white" : "bg-amber-500 text-slate-950"
              }`}>
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <span className="hidden sm:inline">Carhire</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              {/* Locations Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown("locations")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    isScrolled ? "text-slate-600 hover:text-slate-950" : "text-white/90 hover:text-white"
                  }`}
                >
                  Locations
                  <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "locations" ? "rotate-180" : ""}`} />
                </button>
                
                {activeDropdown === "locations" && (
                  <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-scale-in">
                    <div className="p-2">
                      {locations.map((loc) => (
                        <Link
                          key={loc.name}
                          href={loc.href}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <MapPin className="h-4 w-4 text-amber-500" />
                          {loc.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicles Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown("vehicles")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    isScrolled ? "text-slate-600 hover:text-slate-950" : "text-white/90 hover:text-white"
                  }`}
                >
                  Vehicles
                  <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "vehicles" ? "rotate-180" : ""}`} />
                </button>
                
                {activeDropdown === "vehicles" && (
                  <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-scale-in">
                    <div className="p-2">
                      {vehicleCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Car className="h-4 w-4 text-amber-500" />
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/pricing" 
                className={`text-sm font-medium transition-colors ${
                  isScrolled ? "text-slate-600 hover:text-slate-950" : "text-white/90 hover:text-white"
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium transition-colors ${
                  isScrolled ? "text-slate-600 hover:text-slate-950" : "text-white/90 hover:text-white"
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
                className={`hidden sm:inline-flex rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                  isScrolled 
                    ? "bg-slate-950 text-white hover:bg-slate-800 shadow-sm" 
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur"
                }`}
              >
                Log In
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? "text-slate-600 hover:bg-slate-100" 
                    : "text-white hover:bg-white/10"
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900" onClick={closeMobileMenu}>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              Carhire
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <nav className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              {/* Quick Search */}
              <Link 
                href="/search" 
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-slate-900 font-medium"
              >
                <Car className="h-5 w-5 text-amber-600" />
                Find a car
              </Link>

              {/* Locations */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Popular Locations
                </h3>
                <div className="space-y-1">
                  {locations.map((loc) => (
                    <Link
                      key={loc.name}
                      href={loc.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {loc.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Vehicle Types */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Vehicle Types
                </h3>
                <div className="space-y-1">
                  {vehicleCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Car className="h-4 w-4 text-slate-400" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other Links */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Company
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/pricing"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Contact
                  </Link>

                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-slate-200 space-y-3">
            <a 
              href="tel:1800123456" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 rounded-lg text-slate-700 font-medium"
            >
              <Phone className="h-4 w-4" />
              1800 123 456
            </a>
            <Link
              href="/auth/sign-in"
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-full py-3 bg-slate-950 text-white rounded-lg font-semibold"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}