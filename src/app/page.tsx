import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { VehicleCard } from "@/components/vehicle-card";
import { SearchWidget } from "@/components/search-widget";
import { LocationCard } from "@/components/location-card";
import { SiteFooter } from "@/components/site-footer";
import { searchVehicles } from "@/lib/search/typesense";
import { MotionScroll } from "@/components/motion-scroll";
import { 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Car,
  DollarSign,
  ChevronDown,
  Search,
  Star
} from "lucide-react";

export const metadata = {
  title: "Carhire | Premium Car Rental",
  description: "Australia's trusted premium car rental marketplace",
};

const popularLocations = [
  { name: "Sydney", imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80", vehicleCount: 142, startingPrice: 45, href: "/search?city=Sydney" },
  { name: "Melbourne", imageUrl: "https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=600&q=80", vehicleCount: 98, startingPrice: 42, href: "/search?city=Melbourne" },
  { name: "Brisbane", imageUrl: "https://images.unsplash.com/photo-1583416750470-965b4387ce43?auto=format&fit=crop&w=600&q=80", vehicleCount: 65, startingPrice: 40, href: "/search?city=Brisbane" },
];

// testimonials array removed
export default async function Home() {
  const { vehicles: featuredVehicles } = await searchVehicles("", {}, { page: 1, perPage: 4 });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-[#ea580c] selection:text-white">
      <SiteHeader />
      
      <main>
        {/* Cinematic Hero Section */}
        <section className="relative h-[650px] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
          {/* Base Image */}
          <Image
            src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=2000&q=80"
            alt="Yellow sports car"
            fill
            priority
            className="object-cover scale-105 transform-gpu"
          />
          {/* Advanced Color Grading / Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_0%,_rgba(0,0,0,0.6)_100%)]" />
          
          <MotionScroll variant="fade-up" className="relative z-10 text-center px-4 -mt-20">
            <h1 className="text-5xl md:text-[6rem] font-black tracking-tight leading-[0.95]">
              <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">Premium car rental.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] to-amber-500 drop-shadow-[0_4px_12px_rgba(234,88,12,0.4)]">
                Without the premium price.
              </span>
            </h1>
            <p className="mt-8 text-xl text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              Book directly with verified Australian operators. Transparent pricing, instant confirmation, zero hidden fees.
            </p>
          </MotionScroll>
        </section>

        {/* Search Widget Container */}
        <MotionScroll variant="scale-in" delay={0.2} className="relative z-20 -mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SearchWidget variant="hero" />
        </MotionScroll>

        {/* Why rent with Carhire? - Bento Grid Style */}
        <section className="pt-24 pb-32 bg-slate-50 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-100/50 rounded-full blur-3xl -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <MotionScroll variant="fade-up" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">Why rent with Carhire?</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                We connect you directly with verified local rental operators. No middlemen, no surprises.
              </p>
            </MotionScroll>

            <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                { icon: ShieldCheck, title: "Best price guaranteed", desc: "Compare and save with verified local operators. No hidden fees or surprises.", color: "from-blue-500 to-blue-600", light: "bg-blue-50", iconColor: "text-blue-600" },
                { icon: Car, title: "Premium vehicle fleet", desc: "From economy to luxury, all vehicles maintained to high standards.", color: "from-purple-500 to-purple-600", light: "bg-purple-50", iconColor: "text-purple-600" },
                { icon: DollarSign, title: "No hidden fees", desc: "Transparent pricing. What you see is what you pay. Full cost breakdown.", color: "from-emerald-500 to-emerald-600", light: "bg-emerald-50", iconColor: "text-emerald-600" },
                { icon: Zap, title: "Instant confirmation", desc: "Book directly with vendors. No waiting, no middleman fees. Get driving.", color: "from-orange-500 to-orange-600", light: "bg-orange-50", iconColor: "text-[#ea580c]" }
              ].map((feature, i) => (
                <MotionScroll key={i} variant="stagger-item" className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300 group">
                  <div className={`h-14 w-14 ${feature.light} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </MotionScroll>
              ))}
            </MotionScroll>
          </div>
        </section>

        {/* How Carhire works */}
        <section className="py-32 bg-white text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionScroll variant="fade-up" className="mb-24">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">How Carhire works</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                Renting a car has never been easier. Three simple steps to get you on the road.
              </p>
            </MotionScroll>

            <div className="relative">
              {/* Vibrant Connecting Line */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1.5 bg-gradient-to-r from-[#ea580c]/20 via-[#ea580c] to-amber-500/20 rounded-full -z-10" />

              <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                {[
                  { icon: Search, step: "1", title: "Search & Compare", desc: "Browse vehicles from verified local operators. Filter by location, dates, and vehicle type." },
                  { icon: CheckCircle2, step: "2", title: "Book Directly", desc: "Contact vendors instantly, no middleman fees. Get transparent pricing and instant confirmation." },
                  { icon: Car, step: "3", title: "Pick Up & Drive", desc: "Collect your vehicle and enjoy the journey. All vendors are verified and rated by customers." }
                ].map((item, i) => (
                  <MotionScroll key={i} variant="stagger-item" className="flex flex-col items-center relative group">
                    <div className="h-24 w-24 bg-gradient-to-br from-[#ea580c] to-amber-500 rounded-[2rem] rotate-3 flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/40 text-white group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-10 w-10 -rotate-3 group-hover:rotate-0 transition-all duration-300" strokeWidth={2.5} />
                    </div>
                    <div className="absolute top-[-10px] right-[25%] bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg border-2 border-white z-10 rotate-12 group-hover:rotate-0 transition-all">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-slate-900">{item.title}</h3>
                    <p className="text-slate-500 text-base leading-relaxed max-w-[280px] font-medium">
                      {item.desc}
                    </p>
                  </MotionScroll>
                ))}
              </MotionScroll>
            </div>
          </div>
        </section>

        {/* Bento Grid Promos - Upgraded Gradients and Imagery */}
        <section className="py-24 bg-slate-950 pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionScroll variant="fade-up" className="mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Unlock special deals</h2>
              <p className="mt-4 text-lg text-slate-400 font-medium">Exclusive offers from our premium vendor network.</p>
            </MotionScroll>

            <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-2 gap-8 h-auto md:h-[550px]">
              
              {/* Weekend Getaway Image Card */}
              <MotionScroll variant="stagger-item" className="relative rounded-[2.5rem] overflow-hidden group h-[400px] md:h-full shadow-2xl border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1527668752968-14ce70a31294?auto=format&fit=crop&w=1200&q=80"
                  alt="Weekend getaway"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/40 to-transparent" />
                <div className="absolute inset-0 p-10 md:p-12 flex flex-col justify-end">
                  <div className="absolute top-10 left-10 bg-gradient-to-r from-[#ea580c] to-amber-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg tracking-wider">
                    UP TO 20% OFF
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[1.1] tracking-tight">Weekend<br/>getaway deals</h3>
                  <p className="text-slate-300 mb-8 max-w-sm font-medium leading-relaxed">Book 3+ day rentals with verified local operators and save big on your next adventure.</p>
                  <div>
                    <Link href="/search" className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:scale-105">
                      Explore deals <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </MotionScroll>

              {/* Stacked Solid Cards */}
              <div className="grid grid-rows-2 gap-8 h-full">
                {/* Vendor Bonus Green Card */}
                <MotionScroll variant="stagger-item" className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2.5rem] p-10 text-white flex flex-col justify-center shadow-2xl overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <Star className="w-64 h-64" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">First-time vendor?</h3>
                    <p className="text-xl font-bold mb-4 text-emerald-100">List free for 30 days</p>
                    <p className="text-emerald-50/80 mb-8 max-w-sm font-medium">Join as a vendor and list your first vehicle with no subscription fees.</p>
                    <div>
                      <Link href="/vendor/onboarding" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white text-white hover:text-emerald-900 px-6 py-3 rounded-full font-bold transition-colors backdrop-blur-md">
                        Become a vendor <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </MotionScroll>

                {/* Family Vacation Blue Card */}
                <MotionScroll variant="stagger-item" className="relative bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-10 text-white flex flex-col justify-center shadow-2xl overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <Car className="w-64 h-64" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Family specials</h3>
                    <p className="text-xl font-bold mb-4 text-blue-200">People movers & SUVs</p>
                    <p className="text-blue-100/80 mb-8 max-w-sm font-medium">Spacious vehicles for family trips starting from just $75/day.</p>
                    <div>
                      <Link href="/search?category=SUV" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white text-white hover:text-blue-900 px-6 py-3 rounded-full font-bold transition-colors backdrop-blur-md">
                        View SUVs <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </MotionScroll>
              </div>
            </MotionScroll>
          </div>
        </section>

        {/* Popular Locations Section */}
        <section className="py-32 bg-[#fafafa]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionScroll variant="fade-up" className="flex flex-col md:flex-row md:items-end justify-between mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Popular Destinations</h2>
                <p className="mt-4 text-lg text-slate-500 font-medium">Find the perfect car in Australia&apos;s top cities</p>
              </div>
              <Link
                href="/search"
                className="mt-6 md:mt-0 inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-full font-bold shadow-sm transition-all hover:shadow-md"
              >
                Browse all cities <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionScroll>

            <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularLocations.map((location) => (
                <MotionScroll key={location.name} variant="stagger-item">
                  <LocationCard
                    name={location.name}
                    imageUrl={location.imageUrl}
                    vehicleCount={location.vehicleCount}
                    startingPrice={location.startingPrice}
                    href={location.href}
                  />
                </MotionScroll>
              ))}
            </MotionScroll>
          </div>
        </section>

        {/* Featured Vehicles Section */}
        {featuredVehicles.length > 0 && (
          <section className="py-32 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <MotionScroll variant="fade-up" className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Featured vehicles</h2>
                  <p className="mt-4 text-lg text-slate-500 font-medium">Hand-picked premium vehicles from our top-rated vendors</p>
                </div>
                <Link
                  href="/search"
                  className="mt-6 md:mt-0 inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-full font-bold shadow-sm transition-all hover:shadow-md"
                >
                  View all vehicles <ArrowRight className="h-4 w-4" />
                </Link>
              </MotionScroll>

              <MotionScroll variant="stagger-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredVehicles.map((vehicle) => (
                  <MotionScroll key={vehicle.id} variant="stagger-item">
                    <VehicleCard vehicle={vehicle} priority={false} />
                  </MotionScroll>
                ))}
              </MotionScroll>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-32 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <MotionScroll variant="fade-up" className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-500 font-medium">Everything you need to know about booking with Carhire.</p>
            </MotionScroll>

            <MotionScroll variant="stagger-container" className="space-y-4">
              {[
                { q: "How do I book a vehicle?", a: "Simply search for your location and dates, select a vehicle, and send a booking request directly to the local operator. Confirmation is usually instant." },
                { q: "Are there any hidden fees?", a: "No. The price you see includes all taxes and basic insurance. Operators may offer optional extras like child seats or GPS at the counter." },
                { q: "Can I cancel my reservation?", a: "Most operators offer free cancellation up to 48 hours before pickup. You can view the specific cancellation policy of any vehicle before booking." },
                { q: "Do I need a special license?", a: "A valid standard driver's license from your home country is required. International drivers may need an International Driving Permit (IDP)." },
              ].map((faq, index) => (
                <MotionScroll key={index} variant="stagger-item">
                  <details className="group bg-white border border-slate-200 rounded-[1.5rem] p-8 cursor-pointer hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50 transition-all">
                    <summary className="flex justify-between items-center font-bold text-xl text-slate-900 list-none">
                      {faq.q}
                      <span className="transition-transform duration-300 group-open:rotate-180 bg-slate-50 p-2 rounded-full group-hover:bg-orange-50 group-hover:text-[#ea580c]">
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </summary>
                    <p className="text-slate-500 mt-6 leading-relaxed text-lg font-medium animate-fade-in border-t border-slate-100 pt-6">
                      {faq.a}
                    </p>
                  </details>
                </MotionScroll>
              ))}
            </MotionScroll>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
