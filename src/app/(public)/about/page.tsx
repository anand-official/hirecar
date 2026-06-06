import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Building2, ShieldCheck, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "About Us | Hire Car",
  description: "Learn about Hire Car's mission to connect customers with verified, independent car rental operators across Australia.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="bg-slate-950 py-24 sm:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-black text-white sm:text-6xl tracking-tight">
                Empowering independent rental operators.
              </h1>
              <p className="mt-6 text-xl leading-8 text-slate-300 font-medium">
                We built Hire Car because we believe the future of mobility shouldn&apos;t be controlled by just three mega-corporations.
              </p>
            </div>
          </div>
        </section>

        {/* Mission / Story */}
        <section className="py-24 sm:py-32 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">The Hire Car Story</h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  For decades, the car rental industry has been dominated by a handful of global conglomerates. They dictate the prices, control the inventory at airports, and often provide an impersonal, inflexible service to customers.
                </p>
                <p>
                  Meanwhile, there are hundreds of brilliant, independent local rental businesses across Australia offering better rates, specialized vehicles, and genuine customer service. But they struggle to be found online against the massive marketing budgets of the big players.
                </p>
                <p className="font-semibold text-slate-900">
                  That&apos;s why we created Hire Car.
                </p>
                <p>
                  We are a dedicated marketplace that gives local, independent rental operators a platform to showcase their fleets directly to you. No hidden middlemen, no opaque pricing algorithms—just real businesses providing real value.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] sm:aspect-square overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80"
                  alt="Independent car rental operator handing over keys"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Verified Vendors</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-50 py-24 sm:py-32 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Why choose our marketplace?</h2>
              <p className="mt-4 text-lg text-slate-600">
                Our platform is built on transparency, fairness, and supporting local business.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  title: "Direct Connection",
                  description: "When you enquire on Hire Car, you deal directly with the fleet owner. No call centers, no runarounds. Just direct communication for better service.",
                  icon: HeartHandshake,
                  color: "bg-blue-100 text-blue-600"
                },
                {
                  title: "Strictly Verified",
                  description: "Every operator on our platform undergoes a strict verification process. We check their ABN, contact details, and business standing before they can list.",
                  icon: ShieldCheck,
                  color: "bg-emerald-100 text-emerald-600"
                },
                {
                  title: "No Booking Fees",
                  description: "We don't charge customers booking fees or hidden commissions that inflate prices. The price you see is the daily rate set by the vendor.",
                  icon: Building2,
                  color: "bg-amber-100 text-amber-600"
                }
              ].map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${value.color} mb-6`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl mb-6">Ready to find your perfect rental?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/search"
                className="rounded-xl bg-slate-950 px-8 py-4 text-lg font-bold text-white hover:bg-slate-800 transition-colors w-full sm:w-auto"
              >
                Browse Vehicles
              </Link>
              <Link
                href="/vendors"
                className="rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors w-full sm:w-auto"
              >
                View Operators
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
