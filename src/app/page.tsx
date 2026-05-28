import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { VehicleCard } from "@/components/vehicle-card";
import { SearchWidget } from "@/components/search-widget";
import { PromoCard } from "@/components/promo-card";
import { LocationCard } from "@/components/location-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { SiteFooter } from "@/components/site-footer";
import { TrustSignalsSection } from "@/components/trust-signals-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { searchVehicles } from "@/lib/search/typesense";
import { 
  Car, 
  ArrowRight,
  Briefcase,
  Headphones,
  TrendingUp,
  ShieldCheck,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const metadata = {
  title: "Car Rental Marketplace - Find Vehicles from Local Operators",
  description: "Australia's trusted marketplace for verified car rental operators. Compare vehicles from independent fleet owners for your next journey.",
};

// Popular locations data
const popularLocations = [
  {
    name: "Sydney",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80",
    vehicleCount: 45,
    startingPrice: 45,
    href: "/search?city=Sydney",
  },
  {
    name: "Melbourne",
    imageUrl: "https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=600&q=80",
    vehicleCount: 38,
    startingPrice: 42,
    href: "/search?city=Melbourne",
  },
  {
    name: "Brisbane",
    imageUrl: "https://images.unsplash.com/photo-1583416750470-965b4387ce43?auto=format&fit=crop&w=600&q=80",
    vehicleCount: 32,
    startingPrice: 40,
    href: "/search?city=Brisbane",
  },
  {
    name: "Perth",
    imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2b3b?auto=format&fit=crop&w=600&q=80",
    vehicleCount: 28,
    startingPrice: 38,
    href: "/search?city=Perth",
  },
  {
    name: "Adelaide",
    imageUrl: "https://images.unsplash.com/photo-1586536677033-2d080ab812bd?auto=format&fit=crop&w=600&q=80",
    vehicleCount: 24,
    startingPrice: 35,
    href: "/search?city=Adelaide",
  },
  {
    name: "Gold Coast",
    imageUrl: "https://images.unsplash.com/photo-1596386461350-326ea775d6f8?auto=format&fit=crop&w=600&q=80",
    vehicleCount: 35,
    startingPrice: 48,
    href: "/search?city=Gold%20Coast",
  },
];

// Testimonials data
const testimonials = [
  {
    quote: "The best car rental experience I've had in Australia. Direct contact with the vendor made everything so smooth.",
    author: "Sarah M.",
    location: "Sydney",
    rating: 5,
    vehicleType: "Toyota Camry",
  },
  {
    quote: "Great prices and excellent service from a local operator. Will definitely use Carhire again for my next trip.",
    author: "Michael T.",
    location: "Melbourne",
    rating: 5,
    vehicleType: "Mazda CX-5",
  },
  {
    quote: "Transparent pricing with no hidden fees. The vendor was professional and the car was in perfect condition.",
    author: "Emma L.",
    location: "Brisbane",
    rating: 5,
    vehicleType: "Hyundai i30",
  },
];

export default async function Home() {
  // Fetch featured vehicles
  const { vehicles: featuredVehicles } = await searchVehicles("", {}, { page: 1, perPage: 6 });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      
      <main>
        {/* Hero Section with Search Widget */}
        <section className="relative min-h-[850px] flex flex-col justify-center pt-24 pb-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-slate-950">
            <Image
              src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=2000&q=80"
              alt="Premium rental car"
              fill
              priority
              className="object-cover object-center opacity-50 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            />
            {/* Dark gradient overlay for modern look */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-50" />
          </div>

          {/* Hero Content */}
          <div className="relative mx-auto max-w-6xl px-4 w-full flex flex-col items-center text-center space-y-14 z-10">
            
            <div className="space-y-6 max-w-4xl mt-16">
              <h1 className="text-5xl font-black text-white sm:text-7xl lg:text-8xl tracking-tighter leading-[1.1] animate-slide-up">
                Premium car rental.<br />
                <span className="text-primary text-gradient">Without the premium price.</span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                Book directly with verified Australian operators. Transparent pricing, instant confirmation, zero hidden fees.
              </p>
            </div>

            {/* Centered Search Widget */}
            <div className="w-full max-w-5xl animate-scale-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <SearchWidget variant="hero" />
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <TrustSignalsSection />

        {/* Promotional Banners */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <PromoCard
                title="Weekend getaway deals"
                subtitle="Save up to 20%"
                description="Book 3+ day rentals with verified local operators and save big on weekend adventures."
                ctaText="Explore deals"
                ctaHref="/search"
                bgImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
                variant="large"
                discount="Up to 20% off"
              />
              <div className="space-y-6">
                <PromoCard
                  title="First-time vendor bonus"
                  subtitle="List free for 30 days"
                  description="Join as a vendor and list your first vehicle with no subscription fees."
                  ctaText="Become a vendor"
                  ctaHref="/vendor/onboarding"
                  bgColor="bg-gradient-to-br from-emerald-600 to-emerald-800"
                  variant="medium"
                />
                <PromoCard
                  title="Family vacation specials"
                  subtitle="People movers & SUVs"
                  description="Spacious vehicles for family trips starting from $75/day."
                  ctaText="View SUVs"
                  ctaHref="/search?category=SUV"
                  bgColor="bg-gradient-to-br from-blue-600 to-blue-800"
                  variant="medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Featured Vehicles Section */}
        <section className="py-24 bg-slate-50 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 font-heading tracking-tight">Featured vehicles</h2>
                <p className="text-lg text-slate-500 font-medium">Hand-picked vehicles from our top-rated vendors</p>
              </div>
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors"
              >
                View all vehicles
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {featuredVehicles.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 mb-6 shadow-inner">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-heading">
                  Vehicles coming soon
                </h3>
                <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
                  Our vendors are adding their fleets. Check back soon or browse all available locations.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                >
                  Browse locations
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredVehicles.map((vehicle, index) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} variant={index === 0 ? "featured" : "default"} />
                  ))}
                </div>
                <div className="mt-10 text-center sm:hidden">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-primary font-bold"
                  >
                    View all vehicles
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Popular Locations Section */}
        <section className="py-24 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 font-heading tracking-tight">Popular locations</h2>
                <p className="text-lg text-slate-500 font-medium">Explore rentals in Australia&apos;s top destinations</p>
              </div>
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors"
              >
                View all locations
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularLocations.map((location) => (
                <LocationCard
                  key={location.name}
                  name={location.name}
                  imageUrl={location.imageUrl}
                  vehicleCount={location.vehicleCount}
                  startingPrice={location.startingPrice}
                  href={location.href}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 mb-4 font-heading tracking-tight">
                What our customers say
              </h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                Real reviews from real customers who rented through Carhire.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  quote={testimonial.quote}
                  author={testimonial.author}
                  location={testimonial.location}
                  rating={testimonial.rating}
                  vehicleType={testimonial.vehicleType}
                  variant="featured"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Business Solutions Section */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/20 px-5 py-2 text-sm font-bold text-primary shadow-sm">
                  <Briefcase className="h-4.5 w-4.5" />
                  For businesses
                </div>
                
                <h2 className="text-4xl font-black text-white sm:text-5xl font-heading tracking-tight">
                  Carhire for Business
                </h2>
                
                <p className="text-xl text-slate-400 leading-relaxed font-medium">
                  Corporate travel and fleet solutions for businesses of all sizes. 
                  Dedicated support, flexible billing, and exclusive rates.
                </p>

                <div className="space-y-5">
                  {[
                    { icon: Briefcase, text: "Corporate accounts with centralized billing" },
                    { icon: Headphones, text: "Dedicated account manager and 24/7 support" },
                    { icon: TrendingUp, text: "Volume discounts and exclusive corporate rates" },
                    { icon: CheckCircle2, text: "Flexible cancellation and modification policies" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 shadow-inner">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-lg text-slate-300 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <Link
                    href="/vendor/onboarding"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
                  >
                    Register your business
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-700 px-8 py-4 text-lg font-bold text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
                  >
                    Contact sales
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
                  <Image
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                    alt="Business fleet solutions"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-[1.5rem] p-6 shadow-2xl border border-slate-100 animate-slide-up">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 shadow-inner">
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">30%</p>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Average savings</p>
                    </div>
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
