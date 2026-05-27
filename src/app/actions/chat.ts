"use server";

import { requireUser } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function sendMessage(leadId: string, body: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  // Validate that the user is allowed to send a message to this lead.
  // We check if the user is either the customer OR a vendor member.
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, vendor_id, customer_email")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return { error: "Lead not found" };
  }

  // Get user's email to verify if they are the customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const isCustomer = profile?.email === lead.customer_email;
  
  // Check if they are a vendor member
  const { data: isVendorMember } = await supabase.rpc("is_org_member", {
    target_organization_id: lead.vendor_id
  });

  if (!isCustomer && !isVendorMember) {
    return { error: "Unauthorized to send messages for this lead" };
  }

  if (!body.trim()) {
    return { error: "Message cannot be empty" };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      lead_id: leadId,
      sender_user_id: user.id,
      body: body.trim(),
    })
    .select("id, lead_id, sender_user_id, body, created_at")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }

  return { data };
}
