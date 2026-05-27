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
        <section className="relative min-h-[800px] flex flex-col justify-center pt-24 pb-12">
          {/* Background Image */}
          <div className="absolute inset-0 bg-slate-950">
            <Image
              src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=2000&q=80"
              alt="Premium rental car"
              fill
              priority
              className="object-cover object-center opacity-60"
            />
            {/* Sixt-style dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950/90" />
          </div>

          {/* Hero Content */}
          <div className="relative mx-auto max-w-5xl px-4 w-full flex flex-col items-center text-center space-y-12">
            
            <div className="space-y-6 max-w-3xl mt-12">
              <h1 className="text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl tracking-tight leading-tight">
                Premium car rental.<br />
                <span className="text-[var(--primary)]">Without the premium price.</span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
                Book directly with verified Australian operators. Transparent pricing, instant confirmation, zero hidden fees.
              </p>
            </div>

            {/* Centered Search Widget */}
            <div className="w-full">
              <SearchWidget variant="hero" />
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <TrustSignalsSection />

        {/* Promotional Banners */}
        <section className="py-16 bg-slate-50">
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
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured vehicles</h2>
                <p className="text-slate-600">Hand-picked vehicles from our top-rated vendors</p>
              </div>
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
              >
                View all vehicles
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {featuredVehicles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 mb-4">
                  <Car className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Vehicles coming soon
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  Our vendors are adding their fleets. Check back soon or browse all available locations.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  Browse locations
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredVehicles.map((vehicle, index) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
                  ))}
                </div>
                <div className="mt-8 text-center sm:hidden">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-amber-600 font-semibold"
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
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular locations</h2>
                <p className="text-slate-600">Explore rentals in Australia&apos;s top destinations</p>
              </div>
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
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
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                What our customers say
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Real reviews from real customers who rented through Carhire.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
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
        <section className="py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400">
                  <Briefcase className="h-4 w-4" />
                  For businesses
                </div>
                
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Carhire for Business
                </h2>
                
                <p className="text-lg text-slate-400 leading-relaxed">
                  Corporate travel and fleet solutions for businesses of all sizes. 
                  Dedicated support, flexible billing, and exclusive rates.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Briefcase, text: "Corporate accounts with centralized billing" },
                    { icon: Headphones, text: "Dedicated account manager and 24/7 support" },
                    { icon: TrendingUp, text: "Volume discounts and exclusive corporate rates" },
                    { icon: CheckCircle2, text: "Flexible cancellation and modification policies" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                        <feature.icon className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-slate-300">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/vendor/onboarding"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all"
                  >
                    Register your business
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 transition-all"
                  >
                    Contact sales
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                    alt="Business fleet solutions"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">30%</p>
                      <p className="text-sm text-slate-600">Average savings for corporate clients</p>
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
