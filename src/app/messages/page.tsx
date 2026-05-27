import { requireUser } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";

export default async function CustomerMessagesPage() {
  const user = await requireUser();
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (!profile?.email) {
    return (
      <div>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p>Please complete your profile to view messages.</p>
        </main>
      </div>
    );
  }

  // Fetch leads for this customer email
  const { data: leads } = await supabase
    .from("leads")
    .select(`
      id, created_at, status, 
      vehicles(title, price_per_day_aud),
      organizations(name)
    `)
    .eq("customer_email", profile.email)
    .order("created_at", { ascending: false });

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Enquiries</h1>
        
        {(!leads || leads.length === 0) ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold">No enquiries yet</h3>
            <p className="mt-2 text-sm text-slate-500">Browse cars and click "I am interested" to start a chat.</p>
            <Link href="/" className="mt-4 inline-block rounded-md bg-[#FF5F00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E05300]">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => {
              const vehicle = lead.vehicles as any;
              const org = lead.organizations as any;
              return (
                <Link key={lead.id} href={`/messages/${lead.id}`}>
                  <div className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#FF5F00] hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">{lead.status}</p>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#FF5F00] transition-colors" />
                    </div>
                    <h3 className="mt-2 text-xl font-bold">{vehicle?.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">Vendor: {org?.name}</p>
                    <p className="mt-4 text-xs text-slate-400">
                      Enquired on {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
