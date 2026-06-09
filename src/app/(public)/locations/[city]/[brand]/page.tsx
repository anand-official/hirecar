import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import { EmptyState } from "@/components/empty-state";
import { searchVehicles } from "@/lib/search/typesense";
import { Filter, Tag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; brand: string }>;
}): Promise<Metadata> {
  const { city, brand } = await params;
  const displayCity = decodeURIComponent(city).replace(/-/g, " ");
  const displayCityCap = displayCity.charAt(0).toUpperCase() + displayCity.slice(1);
  const displayBrand = decodeURIComponent(brand).replace(/-/g, " ");
  const displayBrandCap = displayBrand.charAt(0).toUpperCase() + displayBrand.slice(1);

  // Thin-page prevention rule
  const { total } = await searchVehicles("", { city: displayCityCap, make: displayBrandCap }, { page: 1, perPage: 1 });
  const robots = total < 3 ? { index: false, follow: true } : { index: true, follow: true };

  return {
    title: `${displayBrandCap} Car Hire in ${displayCityCap} | Hire Car`,
    description: `Looking for ${displayBrandCap} car hire in ${displayCityCap}? Compare local rental operators, find the best daily prices, and book instantly.`,
    openGraph: {
      title: `${displayBrandCap} Car Hire in ${displayCityCap} | Hire Car`,
      description: `Compare ${displayBrandCap} vehicles from verified local rental operators in ${displayCityCap}.`,
    },
    alternates: { canonical: `/locations/${city}/${brand}` },
    robots
  };
}

export default async function BrandCityPage({
  params,
}: {
  params: Promise<{ city: string; brand: string }>;
}) {
  const { city, brand } = await params;
  const searchCity = decodeURIComponent(city).replace(/-/g, " ");
  const displayCity = searchCity.charAt(0).toUpperCase() + searchCity.slice(1);
  
  const searchBrand = decodeURIComponent(brand).replace(/-/g, " ");
  const displayBrand = searchBrand.charAt(0).toUpperCase() + searchBrand.slice(1);

  const { vehicles, total } = await searchVehicles("", { city: displayCity, make: displayBrand }, { page: 1, perPage: 24 });

  const avgPrice = vehicles.length > 0
    ? Math.round(vehicles.reduce((acc, v) => acc + v.pricePerDayAud, 0) / vehicles.length)
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.hirecar.com.au/" },
      { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://www.hirecar.com.au/locations" },
      { "@type": "ListItem", "position": 3, "name": displayCity, "item": `https://www.hirecar.com.au/locations/${city.toLowerCase()}` },
      { "@type": "ListItem", "position": 4, "name": displayBrand, "item": `https://www.hirecar.com.au/locations/${city.toLowerCase()}/${brand.toLowerCase()}` }
    ]
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": vehicles.map((v, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.hirecar.com.au/cars/${v.slug}`
    }))
  };

  const schemas = [breadcrumbJsonLd, itemListJsonLd];

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <SiteHeader />

      <main>
        <section className="bg-gradient-to-b from-slate-950 to-slate-800 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/locations/${city.toLowerCase()}`} className="hover:text-white transition-colors">{displayCity}</Link>
              <span>/</span>
              <span className="text-white font-medium">{displayBrand}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-5 w-5 text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm">Verified Vehicles</span>
                </div>
                <h1 className="text-4xl font-black text-white sm:text-5xl">
                  {displayBrand} for hire in {displayCity}
                </h1>
                <p className="mt-3 text-slate-300 max-w-lg">
                  {total > 0
                    ? `Compare ${total} ${displayBrand} vehicles from local operators.`
                    : `Explore ${displayBrand} rental cars from verified local companies.`}
                </p>
              </div>
              
              {avgPrice && (
                <div className="rounded-2xl bg-white/10 border border-white/20 px-6 py-4 text-center shrink-0">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Avg Price</p>
                  <p className="text-3xl font-black text-white">${avgPrice}</p>
                  <p className="text-xs text-slate-400">AUD / day</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {total > 0 && avgPrice && (
          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{displayBrand} Market Insights: {displayCity}</h2>
            <p className="text-slate-600">
              Based on {total} active listings on Hire Car, the average {displayBrand} hire in {displayCity} costs <strong>${avgPrice} AUD per day</strong>.
            </p>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {vehicles.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{vehicles.length}</span> of{" "}
                  <span className="font-bold text-slate-900">{total}</span> vehicles
                </p>
                <Link
                  href={`/search?city=${encodeURIComponent(searchCity)}&make=${encodeURIComponent(searchBrand)}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title={`No ${displayBrand} vehicles found in ${displayCity}`}
              description={`We couldn't find any ${displayBrand} rental cars in this location.`}
              actionLabel={"View all cars in " + displayCity}
              actionHref={`/locations/${city.toLowerCase()}`}
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
