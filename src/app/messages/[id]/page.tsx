import { requireUser } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SiteHeader } from "@/components/site-header";
import { ChatInterface } from "@/components/chat-interface";
import { LeaveReviewModal } from "@/components/leave-review-modal";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CustomerChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (!profile?.email) {
    notFound();
  }

  // Fetch lead and verify ownership
  const { data: lead } = await supabase
    .from("leads")
    .select(`
      id, customer_email,
      organizations(name)
    `)
    .eq("id", id)
    .eq("customer_email", profile.email)
    .single();

  if (!lead) {
    notFound();
  }

  // Fetch existing messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("lead_id", lead.id)
    .order("created_at", { ascending: true });

  const org = lead.organizations as unknown as { name: string } | null;

  return (
    <div className="min-h-screen bg-slate-50 pt-[88px]">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/messages" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#FF5F00]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Enquiries
          </Link>
          
          <LeaveReviewModal leadId={lead.id} vendorName={org?.name || "Vendor"} />
        </div>

        <ChatInterface 
          leadId={lead.id} 
          currentUserId={user.id} 
          initialMessages={messages || []} 
          otherPartyName={org?.name || "Vendor"}
        />
      </main>
    </div>
  );
}
