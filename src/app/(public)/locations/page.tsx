import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, Car, ArrowRight, Search } from "lucide-react";

export const metadata = {
  title: "Car Hire Locations | Australia",
  description:
    "Find affordable car hire across Australia. Browse vehicle rentals in Sydney, Melbourne, Brisbane, Perth, Adelaide, Gold Coast, Cairns, and more.",
};

const AU_CITIES = [
  { city: "Sydney", state: "NSW", emoji: "🌉", description: "Harbour city · CBD, North Shore, Western Suburbs" },
  { city: "Melbourne", state: "VIC", emoji: "☕", description: "Cultural capital · CBD, Bayside, Dandenong" },
  { city: "Brisbane", state: "QLD", emoji: "☀️", description: "River city · CBD, Southbank, Logan" },
  { city: "Perth", state: "WA", emoji: "🌅", description: "Indian Ocean gateway · CBD, Fremantle, Swan Valley" },
  { city: "Adelaide", state: "SA", emoji: "🍷", description: "Festival city · CBD, Hills, Barossa" },
  { city: "Gold Coast", state: "QLD", emoji: "🏄", description: "Surf paradise · Surfers, Broadbeach, Coolangatta" },
  { city: "Cairns", state: "QLD", emoji: "🐠", description: "Reef gateway · CBD, Northern Beaches, Atherton" },
  { city: "Darwin", state: "NT", emoji: "🌿", description: "Northern capital · CBD, Palmerston, Litchfield" },
  { city: "Hobart", state: "TAS", emoji: "🏔️", description: "Mountain city · CBD, Sandy Bay, Eastern Shore" },
  { city: "Canberra", state: "ACT", emoji: "🏛️", description: "Capital territory · City, Belconnen, Tuggeranong" },
  { city: "Newcastle", state: "NSW", emoji: "⚓", description: "Hunter Valley · CBD, Maitland, Lake Macquarie" },
  { city: "Wollongong", state: "NSW", emoji: "🌊", description: "Illawarra coast · CBD, Shellharbour, Kiama" },
];

export default async function LocationsPage() {
  const supabase = createAdminClient();

  // Get vehicle counts per city (branches are tied to cities)
  const { data: branchCounts } = await supabase
    .from("branches")
    .select("city, organization_id")
    .eq("status", "approved");

  // Count vehicles per city by joining branch data
  const { data: vehicleCounts } = await supabase
    .from("vehicles")
    .select("branch_id, branches!inner(city, status)")
    .eq("status", "approved");

  // Build city → vehicle count map
  const cityVehicleMap: Record<string, number> = {};
  vehicleCounts?.forEach((v) => {
    type BranchRecord = { city: string; status: string };
    const branch = v.branches as unknown as BranchRecord;
    if (branch?.city) {
      cityVehicleMap[branch.city] = (cityVehicleMap[branch.city] ?? 0) + 1;
    }
  });

  // Build city → operator count map
  const cityOperatorMap: Record<string, Set<string>> = {};
  branchCounts?.forEach((b) => {
    if (!cityOperatorMap[b.city]) cityOperatorMap[b.city] = new Set();
    cityOperatorMap[b.city].add(b.organization_id);
  });

  const totalVehicles = Object.values(cityVehicleMap).reduce((a, b) => a + b, 0);
  const totalCities = Object.keys(cityVehicleMap).length;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 mb-5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">Australia-wide coverage</span>
            </div>
            <h1 className="text-4xl font-black text-white sm:text-5xl">
              Find car hire near you
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Compare vehicles from verified local operators across Australia.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              {[
                { value: totalVehicles || "1,200+", label: "Vehicles available" },
                { value: totalCities || "12", label: "Cities covered" },
                { value: "100%", label: "Verified operators" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* City Grid */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">Browse by city</h2>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Advanced search
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {AU_CITIES.map(({ city, state, emoji, description }) => {
              const vehicleCount = cityVehicleMap[city] ?? 0;
              const operatorCount = cityOperatorMap[city]?.size ?? 0;
              const hasVehicles = vehicleCount > 0;

              return (
                <Link
                  key={city}
                  href={`/locations/${city.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`group relative rounded-3xl border p-6 transition-all duration-200 hover:shadow-lg ${
                    hasVehicles
                      ? "border-slate-200 bg-white hover:border-amber-300 hover:-translate-y-0.5"
                      : "border-slate-100 bg-slate-50 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{emoji}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      hasVehicles
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {state}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                    {city}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-4">{description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Car className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{vehicleCount}</span>
                      {" "}vehicles
                    </span>
                    {operatorCount > 0 && (
                      <span className="text-slate-400 text-xs">
                        {operatorCount} operator{operatorCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className={`mt-4 flex items-center gap-1 text-xs font-semibold transition-colors ${
                    hasVehicles ? "text-amber-600 group-hover:text-amber-700" : "text-slate-400"
                  }`}>
                    {hasVehicles ? "Browse vehicles" : "Coming soon"}
                    {hasVehicles && <ArrowRight className="h-3.5 w-3.5" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-amber-50 border-y border-amber-200 py-12 text-center px-4">
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-black text-slate-900">Don&apos;t see your city?</h2>
            <p className="mt-2 text-slate-600 text-sm">
              Use our search to find vehicles near any Australian location.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search all vehicles
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
