"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// usePathname removed
import { Menu, X, ChevronDown, ShieldCheck, User, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // pathname removed
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const locations = [
    { name: "Sydney", href: "/search?city=Sydney" },
    { name: "Melbourne", href: "/search?city=Melbourne" },
    { name: "Brisbane", href: "/search?city=Brisbane" },
    { name: "Perth", href: "/search?city=Perth" },
    { name: "Adelaide", href: "/search?city=Adelaide" },
    { name: "Gold Coast", href: "/search?city=Gold Coast" },
    { name: "Canberra", href: "/search?city=Canberra" },
    { name: "Hobart", href: "/search?city=Hobart" },
    { name: "Darwin", href: "/search?city=Darwin" },
    { name: "Cairns", href: "/search?city=Cairns" },
  ];

  const vehicleCategories = [
    { name: "Sedans", href: "/search?category=Sedan" },
    { name: "SUVs", href: "/search?category=SUV" },
    { name: "Hatchbacks", href: "/search?category=Hatchback" },
    { name: "Utes & Trucks", href: "/search?category=Ute" },
    { name: "People Movers", href: "/search?category=People mover" },
    { name: "Luxury & Sports", href: "/search?category=Luxury" },
    { name: "Convertibles", href: "/search?category=Convertible" },
    { name: "Electric Vehicles", href: "/search?category=Electric" },
    { name: "Vans & Commercial", href: "/search?category=Van" },
    { name: "Campers", href: "/search?category=Camper" },
  ];

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    // Check auth state
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoadingAuth(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Invisible spacer to push page content down, fixing overlap on all pages */}
      <div className="h-[116px] w-full shrink-0" aria-hidden="true" />
      
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        {/* Vibrant Top Info Bar - Hides on scroll */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.div 
              initial={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-orange-600 via-[#ea580c] to-amber-500 text-white text-xs font-bold tracking-wide py-2.5 px-4 flex justify-center sm:justify-between items-center shadow-inner"
            >
              <span className="hidden sm:inline-block">Australia&apos;s trusted premium car rental marketplace</span>
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Headphones className="h-3.5 w-3.5" /> 1800 123 456
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navbar */}
        <div
          className={`transition-all duration-300 w-full ${
            isScrolled
              ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-white/20 py-3"
              : "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-4"
          }`}
        >
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              
              {/* Vibrant Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="flex h-11 w-11 items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-primary/20">
                  <ShieldCheck className="h-6 w-6 text-orange-400" strokeWidth={2.5} />
                </span>
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-300">
                  Carhire
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                {/* Dropdown 1 */}
                <div
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown("locations")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 font-bold text-sm text-slate-600 hover:text-primary transition-colors py-4 group">
                    Locations 
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeDropdown === "locations" ? "rotate-180 text-primary" : "text-slate-400 group-hover:text-primary"}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === "locations" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[100%] left-0 w-52 bg-white rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden py-3 border border-slate-100 origin-top-left"
                      >
                        {locations.map((loc) => (
                          <Link key={loc.name} href={loc.href} className="block px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-primary hover:translate-x-1 transition-all">
                            {loc.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dropdown 2 */}
                <div
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown("vehicles")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 font-bold text-sm text-slate-600 hover:text-primary transition-colors py-4 group">
                    Vehicles 
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeDropdown === "vehicles" ? "rotate-180 text-primary" : "text-slate-400 group-hover:text-primary"}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === "vehicles" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[100%] left-0 w-52 bg-white rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden py-3 border border-slate-100 origin-top-left"
                      >
                        {vehicleCategories.map((cat) => (
                          <Link key={cat.name} href={cat.href} className="block px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-primary hover:translate-x-1 transition-all">
                            {cat.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link href="/pricing" className="relative font-bold text-sm text-slate-600 hover:text-primary transition-colors group">
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/contact" className="relative font-bold text-sm text-slate-600 hover:text-primary transition-colors group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </nav>

              {/* CTAs */}
              <div className="flex items-center gap-4">
                {!isLoadingAuth && (
                  isLoggedIn ? (
                    <Link href="/customer/dashboard" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#ea580c] to-amber-500 hover:from-[#c2410c] hover:to-[#ea580c] text-white font-bold text-sm px-7 py-3 rounded-full transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  ) : (
                    <Link href="/auth/sign-in" className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-7 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                      Log in / Sign up
                    </Link>
                  )
                )}

                {/* Mobile Toggle */}
                <button onClick={openMobileMenu} className="md:hidden flex h-11 w-11 items-center justify-center text-slate-700 hover:text-primary transition-colors bg-slate-100 rounded-full" aria-label="Open mobile menu">
                  <Menu className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white text-slate-900 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg">
                  <ShieldCheck className="h-6 w-6 text-orange-400" strokeWidth={2.5} />
                </span>
                <span className="text-2xl font-black tracking-tight">Carhire</span>
              </Link>
              <button onClick={closeMobileMenu} className="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-primary transition-colors bg-slate-100 rounded-full" aria-label="Close mobile menu">
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
              <Link href="/search" onClick={closeMobileMenu} className="bg-gradient-to-r from-primary to-amber-500 text-white font-bold text-lg rounded-2xl px-6 py-4 text-center shadow-lg shadow-primary/20">
                Find a Car
              </Link>
              
              <div className="flex flex-col gap-4 mt-4">
                <Link href="/pricing" onClick={closeMobileMenu} className="font-bold text-xl text-slate-800 hover:text-primary hover:translate-x-2 transition-transform">Pricing</Link>
                <Link href="/contact" onClick={closeMobileMenu} className="font-bold text-xl text-slate-800 hover:text-primary hover:translate-x-2 transition-transform">Contact</Link>
              </div>
              
              <div className="mt-auto flex flex-col pt-8 border-t border-slate-100">
                {!isLoadingAuth && (
                  isLoggedIn ? (
                    <Link href="/customer/dashboard" onClick={closeMobileMenu} className="font-bold text-lg text-center bg-slate-100 text-slate-900 rounded-2xl py-4 hover:bg-slate-200 transition-colors flex justify-center items-center gap-2">
                      <User className="h-5 w-5" /> Profile
                    </Link>
                  ) : (
                    <Link href="/auth/sign-in" onClick={closeMobileMenu} className="font-bold text-lg text-center bg-slate-900 text-white rounded-2xl py-4 hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                      Log in / Sign up
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
