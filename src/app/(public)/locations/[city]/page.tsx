import { SiteHeader } from "@/components/site-header";
import { VehicleCard } from "@/components/vehicle-card";
import { featuredVehicles } from "@/lib/mock/marketplace";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const readableCity = decodeURIComponent(city);
  const listings = featuredVehicles.filter(
    (vehicle) => vehicle.city.toLowerCase() === readableCity.toLowerCase(),
  );

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Rental cars in {readableCity}</h1>
        <p className="mt-2 text-slate-600">
          Approved marketplace listings for local rental vendors and fleet branches.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(listings.length ? listings : featuredVehicles).map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </main>
    </div>
  );
}
