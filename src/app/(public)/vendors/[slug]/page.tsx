import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { VehicleCard } from "@/components/vehicle-card";
import { featuredVehicles, vendors } from "@/lib/mock/marketplace";
import { StarRating } from "@/components/star-rating";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = vendors.find((item) => item.slug === slug);

  if (!vendor) {
    notFound();
  }

  const listings = featuredVehicles.filter((item) => item.vendorSlug === slug);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {vendor.city}, {vendor.state}
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold">
            {vendor.name}
            {vendor.verified ? <BadgeCheck className="h-6 w-6 text-emerald-600" /> : null}
          </h1>
          
          {vendor.averageRating && vendor.reviewCount ? (
            <div className="mt-3 flex items-center gap-2">
              <StarRating rating={vendor.averageRating} />
              <span className="text-sm font-medium text-slate-700">{vendor.averageRating.toFixed(1)}</span>
              <span className="text-sm text-slate-500">({vendor.reviewCount} reviews)</span>
            </div>
          ) : null}

          <p className="mt-4 max-w-3xl text-slate-600">{vendor.description}</p>
        </section>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {listings.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </main>
    </div>
  );
}
