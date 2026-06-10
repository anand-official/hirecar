import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { VehicleCard } from "@/components/vehicle-card";
import { SearchWidget } from "@/components/search-widget";
import { LocationCard } from "@/components/location-card";
import { TrustSignals } from "@/components/trust-signals";
import { HowItWorks } from "@/components/how-it-works";
import { SiteFooter } from "@/components/site-footer";
import { searchVehicles } from "@/lib/search/typesense";
import { createAdminClient } from "@/lib/supabase/admin";
import { MotionScroll } from "@/components/motion-scroll";
import { Section } from "@/components/ui/section";
import {
  ArrowRight,
  ChevronDown,
  Star,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "HireCar Marketplace | Premium Car Rental",
  description: "Premium car rental. Without the premium price.",
};

const popularLocations = [
  { name: "Sydney", imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80", href: "/search?city=Sydney" },
  { name: "Melbourne", imageUrl: "https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=600&q=80", href: "/search?city=Melbourne" },
  { name: "Brisbane", imageUrl: "https://images.unsplash.com/photo-1554939437-ecc492c67b78?auto=format&fit=crop&w=600&q=80", href: "/search?city=Brisbane" },
  { name: "Perth", imageUrl: "/perth.png", href: "/search?city=Perth" },
  { name: "Adelaide", imageUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80", href: "/search?city=Adelaide" },
  { name: "Gold Coast", imageUrl: "https://images.unsplash.com/photo-1535961652354-923cb08225a7?auto=format&fit=crop&w=600&q=80", href: "/search?city=Gold+Coast" },
];

const testimonials = [
  {
    quote: "Found a great deal on a van in Melbourne. The vendor was responsive and the booking process was seamless. Will definitely use again.",
    rating: 5,
    name: "Sarah M.",
  },
  {
    quote: "Compared prices across multiple operators in Sydney and saved over $200 on a week-long rental. Highly recommend this platform.",
    rating: 5,
    name: "James T.",
  },
  {
    quote: "As a frequent traveller, having verified operators gives me peace of mind. Clean cars, fair prices, no surprises.",
    rating: 4,
    name: "Michelle K.",
  },
  {
    quote: "Booked a ute for a weekend move in Brisbane. Direct contact with the owner made everything simple and stress-free.",
    rating: 5,
    name: "David R.",
  },
];

export default async function Home() {
  const { vehicles: featuredVehicles } = await searchVehicles("", {}, { page: 1, perPage: 6 });

  // Fetch live vehicle counts and min prices per city
  const supabase = createAdminClient();
  const { data: cityStats } = await supabase
    .from("vehicles")
    .select("price_per_day_aud, branches!inner(city, status)")
    .eq("status", "approved")
    .eq("branches.status", "approved");

  const cityDataMap: Record<string, { count: number; minPrice: number }> = {};
  cityStats?.forEach((v) => {
    type BranchRecord = { city: string; status: string };
    const branch = v.branches as unknown as BranchRecord;
    if (branch?.city) {
      if (!cityDataMap[branch.city]) {
        cityDataMap[branch.city] = { count: 0, minPrice: v.price_per_day_aud };
      }
      cityDataMap[branch.city].count += 1;
      if (v.price_per_day_aud < cityDataMap[branch.city].minPrice) {
        cityDataMap[branch.city].minPrice = v.price_per_day_aud;
      }
    }
  });

  // Merge live data with location configs
  const locationsWithData = popularLocations.map((loc) => ({
    ...loc,
    vehicleCount: cityDataMap[loc.name]?.count ?? 0,
    startingPrice: cityDataMap[loc.name]?.minPrice ?? 0,
  }));

  return (
    <div className="min-h-screen bg-white text-foreground font-sans overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* ===== 1. HERO SECTION ===== */}
        <section className="relative bg-white pb-0">
          <div className="relative overflow-hidden bg-slate-950 min-h-[520px] flex items-center">
            {/* Background car image */}
            <Image
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80"
              alt="Premium rental car"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right opacity-90"
            />
            {/* Gradient overlays for depth + legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(234,88,12,0.18)_0%,_transparent_55%)]" />

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl py-16 lg:py-20">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white tracking-tight leading-[1.05]">
                  Find the right vehicle,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fb923c] to-[#ea580c]">
                    direct from trusted operators.
                  </span>
                </h1>

                <p className="mt-6 text-lg text-slate-300 max-w-lg leading-relaxed">
                  Compare cars, vans, utes and luxury vehicles from verified Australian rental businesses. No marketplace fees, ever.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href="/search"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#ea580c] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#f97316] transition-all shadow-xl shadow-[#ea580c]/30 hover:scale-[1.02]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Search Vehicles
                  </Link>
                  <Link
                    href="/for-vendors"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    List Your Fleet Free <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Inline mini trust row */}
                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Verified businesses</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No hidden fees</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Australia-wide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Widget — overlapping the banner */}
          <div className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <SearchWidget variant="hero" />
          </div>
        </section>

        {/* ===== 2. TRUST SIGNALS ===== */}
        <TrustSignals />

        {/* ===== 3. HOW IT WORKS ===== */}
        <HowItWorks />

        {/* ===== 4. FEATURED VEHICLES ===== */}
        {featuredVehicles.length > 0 && (
          <Section variant="default" size="md" container>
            <MotionScroll variant="fade-up" className="mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Featured Vehicles
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Browse top-rated rentals available now
              </p>
            </MotionScroll>

            <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <MotionScroll key={vehicle.id} variant="stagger-item">
                  <VehicleCard vehicle={vehicle} priority={false} />
                </MotionScroll>
              ))}
            </MotionScroll>

            <div className="mt-10 flex justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View All Vehicles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Section>
        )}

        {/* ===== 5. TESTIMONIALS ===== */}
        <Section variant="default" size="md" container>
          <MotionScroll variant="fade-up" className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by thousands of renters across Australia
            </p>
          </MotionScroll>

          <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <MotionScroll key={index} variant="stagger-item">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  {/* Star rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  {/* Reviewer name */}
                  <p className="text-sm font-bold text-foreground">
                    {testimonial.name}
                  </p>
                </div>
              </MotionScroll>
            ))}
          </MotionScroll>
        </Section>

        {/* ===== 6. POPULAR LOCATIONS ===== */}
        <Section variant="muted" size="md" container>
          <MotionScroll variant="fade-up" className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Popular Locations
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Explore car hire options across Australia
            </p>
          </MotionScroll>

          <MotionScroll variant="stagger-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationsWithData.map((location) => (
              <MotionScroll key={location.name} variant="stagger-item">
                <LocationCard
                  name={location.name}
                  imageUrl={location.imageUrl}
                  vehicleCount={location.vehicleCount}
                  startingPrice={location.startingPrice || 35}
                  href={location.href}
                />
              </MotionScroll>
            ))}
          </MotionScroll>

          <div className="mt-10 flex justify-center">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-accent transition-colors"
            >
              View All Locations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>

        {/* ===== 7. VENDOR CTA ===== */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Dramatic background */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=80"
              alt="Fleet of premium cars"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(234,88,12,0.15)_0%,_transparent_60%)]" />
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#ea580c]/5 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/20 px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ea580c]" />
                </span>
                <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">Now accepting new operators</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Get More Leads<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] to-amber-400">
                  for Your Fleet
                </span>
              </h2>

              <p className="text-lg md:text-xl text-slate-300 font-medium mb-10 max-w-lg leading-relaxed">
                Join verified operators reaching thousands of renters every month across Australia.
              </p>

              {/* Benefits with premium styling */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[
                  "Reach more customers Australia-wide",
                  "Direct enquiries — no middleman fees",
                  "Verified operator badge builds trust",
                  "Analytics dashboard included",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ea580c] text-white text-xs font-bold shadow-lg shadow-[#ea580c]/20">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-slate-200">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA with glow effect */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/vendor/onboarding"
                  className="group relative inline-flex items-center gap-2 rounded-full bg-[#ea580c] px-8 py-4 font-bold text-white text-lg hover:bg-[#dc5409] transition-all shadow-xl shadow-[#ea580c]/25 hover:shadow-[#ea580c]/40 hover:scale-[1.02]"
                >
                  List Your Fleet Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <span className="text-sm text-slate-400 font-medium">
                  No credit card required · 2 min setup
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ADDITIONAL SECTIONS (SEO & FAQ — not in spec order but add value) ===== */}

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-muted/50 border-t border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <MotionScroll variant="fade-up" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about booking with HireCar Marketplace.
              </p>
            </MotionScroll>

            <MotionScroll variant="stagger-container" className="space-y-4">
              {[
                { q: "How do I book a vehicle?", a: "Simply search for your location and dates, select a vehicle, and send a booking request directly to the local operator. Confirmation is usually instant." },
                { q: "Are there any hidden fees?", a: "No. The price you see includes all taxes and basic insurance. Operators may offer optional extras like child seats or GPS at the counter." },
                { q: "Can I cancel my reservation?", a: "Most operators offer free cancellation up to 48 hours before pickup. You can view the specific cancellation policy of any vehicle before booking." },
                { q: "Do I need a special license?", a: "A valid standard driver's license from your home country is required. International drivers may need an International Driving Permit (IDP)." },
              ].map((faq, index) => (
                <MotionScroll key={index} variant="stagger-item">
                  <details className="group bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-md transition-all">
                    <summary className="flex justify-between items-center font-bold text-lg text-foreground list-none">
                      {faq.q}
                      <span className="transition-transform duration-300 group-open:rotate-180 bg-muted p-2 rounded-full">
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </summary>
                    <p className="text-muted-foreground mt-4 leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </p>
                  </details>
                </MotionScroll>
              ))}
            </MotionScroll>
          </div>
        </section>

        {/* SEO Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1600&q=80"
              alt="Australian road"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/85 to-[#0f172a]/70" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight leading-tight">
                  Car Hire Across<br />Australia
                </h2>
                <div className="space-y-4 text-base text-slate-300 leading-relaxed">
                  <p>
                    HireCar Marketplace makes it easy to find the right vehicle from trusted rental operators across Australia. Compare options from verified businesses in one place.
                  </p>
                  <p>
                    We work with rental companies in all major cities. From small cars to large vans and utes, hire vehicles for business or personal use with confidence.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"].map((city) => (
                    <Link
                      key={city}
                      href={`/search?city=${city}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                      {city}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex flex-col items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm p-6 text-center">
                    <p className="text-3xl font-black text-white">12+</p>
                    <p className="text-sm text-slate-400 mt-1">Cities Covered</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm p-6 text-center">
                    <p className="text-3xl font-black text-white">150+</p>
                    <p className="text-sm text-slate-400 mt-1">Operators</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm p-6 text-center">
                    <p className="text-3xl font-black text-[#ea580c]">$0</p>
                    <p className="text-sm text-slate-400 mt-1">Booking Fees</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm p-6 text-center">
                    <p className="text-3xl font-black text-white">24/7</p>
                    <p className="text-sm text-slate-400 mt-1">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
