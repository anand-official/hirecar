import { notFound } from "next/navigation";
import { BadgeCheck, Phone, Eye, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/security/auth";
import { EnquiryWidget } from "@/components/enquiry-widget";
import { ImageGallery } from "@/components/image-gallery";
import { headers } from "next/headers";
import { createHash } from "crypto";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const supabase = createAdminClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select(`
      id, slug, title, make, model, year, seats, fuel, transmission, category,
      price_per_day_aud, status, organization_id, views_count,
      organizations(name, slug, status, verified_at),
      branches(name, city, state, status, phone),
      vehicle_images(id, storage_path, alt_text, sort_order)
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!vehicle) {
    notFound();
  }

  // Get user for enquiry widget auth state
  const user = await getCurrentUser();
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single();
    if (profile) {
      userProfile = {
        name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      };
    }
  }

  // Log view
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    
    await supabase.rpc('increment_vehicle_view', {
      p_vehicle_id: vehicle.id,
      p_ip_hash: ipHash,
      p_user_id: user?.id || null,
    });
  } catch (err) {
    console.error("Failed to log view:", err);
  }

  // Cast related records
  const org = vehicle.organizations as any;
  const branch = vehicle.branches as any;
  const dbImages = (vehicle.vehicle_images as any[]) || [];

  // Sort images and generate public URLs
  dbImages.sort((a, b) => a.sort_order - b.sort_order);
  const images = dbImages.map((img) => {
    const { data } = supabase.storage.from("vehicle-images").getPublicUrl(img.storage_path);
    return {
      id: img.id,
      url: data.publicUrl,
      alt_text: img.alt_text,
    };
  });

  // Fetch reviews for this organization
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, body, created_at")
    .eq("organization_id", vehicle.organization_id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
    
  const averageRating = reviews?.length 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* LEFT: Main content */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <ImageGallery images={images} />
            </section>

            {/* Title & Details Card */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              {/* Category + Price row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
                    {vehicle.category}
                  </span>
                  <h1 className="mt-3 text-3xl font-bold text-slate-900">
                    {vehicle.title}
                  </h1>

                  {/* Vendor / Rating / Views */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      {org?.name}
                      {org?.verified_at && (
                        <BadgeCheck className="h-4.5 w-4.5 text-emerald-500" />
                      )}
                    </span>
                    {averageRating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700">{averageRating}</span>
                        <span className="text-slate-400">({reviews?.length} reviews)</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {vehicle.views_count} views
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="rounded-2xl bg-slate-950 px-6 py-4 text-center shrink-0">
                  <p className="text-4xl font-black text-white">${vehicle.price_per_day_aud}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-widest">AUD / day</p>
                </div>
              </div>

              {/* Spec Chips */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-6 pt-6 border-t border-slate-100">
                {[
                  { label: "Seats", value: String(vehicle.seats), icon: "👤" },
                  { label: "Fuel", value: vehicle.fuel, icon: "⛽" },
                  { label: "Transmission", value: vehicle.transmission, icon: "⚙️" },
                  { label: "Branch", value: branch?.name ?? "—", icon: "📍" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                    <p className="text-xl mb-1">{icon}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <span className="text-lg shrink-0">ℹ️</span>
                <p className="text-sm leading-6 text-slate-600">
                  Carhire is a discovery platform. Booking, payment, deposit, insurance, vehicle condition, and rental agreement terms are confirmed directly between you and the vendor.
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT: Sticky sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-8 h-fit">
            <EnquiryWidget
              vehicleId={vehicle.id}
              vendorId={vehicle.organization_id}
              isLoggedIn={!!user}
              userProfile={userProfile}
            />
            {branch?.phone && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <a
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  href={`tel:${branch.phone}`}
                >
                  <Phone className="h-4 w-4" />
                  Call vendor directly
                </a>
              </div>
            )}
            {/* Trust badges */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Why book through Carhire</p>
              <ul className="space-y-2.5">
                {[
                  "Verified vendor listings",
                  "No booking fees or hidden charges",
                  "Direct contact with operator",
                  "Australia-wide coverage",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

