import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BadgeCheck,
  MapPin,
  Car,
  Star,
  Phone,
  Mail,
  Building2,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import ReviewSection from "@/components/review-section";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Vehicle } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────
type Branch = {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
};

type VendorData = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  verified: boolean;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  branches: Branch[];
  vehicleCount: number;
  averageRating: number | null;
  reviewCount: number;
  reviews: { id: string; customer_name: string; rating: number; body: string; created_at: string }[];
};

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("name, branches(city, state, status)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!data) return {};
  const branches = (data.branches as unknown as Branch[]) ?? [];
  const firstApprovedBranch = branches.find((branch) => branch.status === "approved");
  const location = firstApprovedBranch
    ? ` in ${firstApprovedBranch.city}, ${firstApprovedBranch.state}`
    : "";

  return {
    title: `${data.name} - Car Rental${location}`,
    description: `Verified car rental operator${location}. Browse their fleet on Hire Car Marketplace.`,
  };
}

// ── Data fetching ──────────────────────────────────────────────────────────
async function getVendor(slug: string): Promise<VendorData | null> {
  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select(`
      id, name, slug, status, billing_email, website, phone, created_at,
      branches(id, name, city, state, status)
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!org) return null;

  // Count vehicles
  const { count: vehicleCount } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", org.id)
    .eq("status", "approved");

  // Aggregate reviews
  const { data: reviewData } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, body, created_at")
    .eq("organization_id", org.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const reviewCount = reviewData?.length ?? 0;
  const averageRating =
    reviewCount > 0
      ? reviewData!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  // Get approved branches
  const branches = (org.branches as Branch[]).filter((b) => b.status === "approved");

  // Use branch city/state if no profile city
  const firstBranch = branches[0];
  const city = firstBranch?.city ?? "";
  const state = firstBranch?.state ?? "";

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    city,
    state,
    verified: true, // Passed status === approved check
    description: null,
    phone: org.phone ?? null,
    email: org.billing_email ?? null,
    website: org.website ?? null,
    created_at: org.created_at,
    branches,
    vehicleCount: vehicleCount ?? 0,
    averageRating: reviewCount > 0 ? Math.round(averageRating! * 10) / 10 : null,
    reviewCount,
    reviews: reviewData ?? [],
  };
}

async function getVendorVehicles(organizationId: string): Promise<Vehicle[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("vehicles")
    .select(`
      id, slug, title, make, model, year, seats, fuel, transmission, category,
      price_per_day_aud, status,
      organizations!inner(name, slug),
      branches!inner(name, city, state, status)
    `)
    .eq("organization_id", organizationId)
    .eq("status", "approved")
    .order("price_per_day_aud", { ascending: true })
    .limit(12);

  if (!data) return [];

  return data.map((v) => {
    const org = v.organizations as unknown as { name: string; slug: string };
    const branch = v.branches as unknown as { name: string; city: string; state: string };
    return {
      id: v.id,
      slug: v.slug,
      title: v.title,
      make: v.make,
      model: v.model,
      year: v.year,
      seats: v.seats,
      fuel: v.fuel,
      transmission: v.transmission,
      category: v.category,
      pricePerDayAud: v.price_per_day_aud,
      city: branch.city,
      state: branch.state,
      imageUrl: "/vehicle-placeholder.jpg",
      vendorName: org.name,
      vendorSlug: org.slug,
      branchName: branch.name,
      verified: true,
    };
  });
}

// ── Star rating ──────────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getVendor(slug);

  if (!vendor) notFound();

  const fleet = await getVendorVehicles(vendor.id);

  const memberSince = new Date(vendor.created_at).getFullYear();

  const autoRentalSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "name": vendor.name,
    "url": `https://hirecar.com.au/vendors/${vendor.slug}`,
    ...(vendor.phone && { "telephone": vendor.phone }),
    ...(vendor.email && { "email": vendor.email }),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": vendor.city,
      "addressRegion": vendor.state,
      "addressCountry": "AU"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }} />
      <SiteHeader />

      {/* Hero Banner */}
      <div className="bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/search" className="hover:text-white transition-colors">Search</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{vendor.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              {/* Verification badge */}
              {vendor.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Operator
                </span>
              )}

              <h1 className="text-4xl font-bold text-white tracking-tight lg:text-5xl">
                {vendor.name}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {vendor.city}, {vendor.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-amber-500" />
                  {vendor.vehicleCount} vehicle{vendor.vehicleCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-amber-500" />
                  Member since {memberSince}
                </span>
              </div>

              {vendor.averageRating !== null && (
                <div className="flex items-center gap-3">
                  <StarDisplay rating={vendor.averageRating} />
                  <span className="text-white font-bold text-lg">{vendor.averageRating.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">
                    ({vendor.reviewCount} review{vendor.reviewCount !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="lg:w-80 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4 shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Contact
              </h2>
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex items-center gap-3 text-white font-semibold hover:text-amber-400 transition-colors group"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-amber-500/10 transition-colors">
                    <Phone className="h-4.5 w-4.5 text-amber-500" />
                  </span>
                  {vendor.phone}
                </a>
              )}
              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="flex items-center gap-3 text-slate-300 font-medium hover:text-white transition-colors group"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-amber-500/10 transition-colors">
                    <Mail className="h-4.5 w-4.5 text-amber-500" />
                  </span>
                  {vendor.email}
                </a>
              )}
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors mt-2"
                >
                  Visit website
                </a>
              )}
              {!vendor.phone && !vendor.email && (
                <p className="text-sm text-slate-400">
                  Contact this vendor by enquiring on one of their vehicles below.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Left: Fleet + Description */}
          <div className="space-y-12">
            {/* Description */}
            {vendor.description && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">About {vendor.name}</h2>
                <p className="text-slate-600 leading-relaxed">{vendor.description}</p>
              </section>
            )}

            {/* Fleet */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Available Fleet
                  <span className="ml-3 text-lg font-normal text-slate-400">
                    ({vendor.vehicleCount} vehicle{vendor.vehicleCount !== 1 ? "s" : ""})
                  </span>
                </h2>
                {vendor.vehicleCount > 12 && (
                  <Link
                    href={`/search?vendor=${vendor.slug}`}
                    className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {fleet.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <Car className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No vehicles currently available.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {fleet.map((vehicle, i) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i < 3} />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <ReviewSection
                organizationId={vendor.id}
                initialReviews={vendor.reviews}
              />
            </section>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-6">
            {/* Branches */}
            {vendor.branches.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-5">
                  Locations
                </h2>
                <ul className="space-y-3">
                  {vendor.branches.map((branch) => (
                    <li key={branch.id} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <Building2 className="h-4 w-4 text-amber-600" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{branch.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {branch.city}, {branch.state}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust indicators */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Why Hire Car?
              </h2>
              {[
                { title: "Identity Verified", desc: "ABN and business details confirmed" },
                { title: "Direct Contact", desc: "No middlemen — contact the fleet owner" },
                { title: "Transparent Pricing", desc: "No hidden booking fees" },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-amber-900 mb-3">
                Looking for a specific vehicle?
              </p>
              <Link
                href={`/search?city=${encodeURIComponent(vendor.city)}`}
                className="inline-flex items-center gap-2 w-full justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
              >
                Browse all {vendor.city} vehicles
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
