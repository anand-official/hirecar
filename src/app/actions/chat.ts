"use server";

import { sendNewMessageNotification } from "@/lib/email/resend";
import { requireUser } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  leadId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

async function notifyMessageRecipient(
  leadId: string,
  senderUserId: string,
  messageBody: string,
) {
  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .select(`
      id, customer_email, customer_name, vendor_id,
      vehicles(title),
      organizations(name, billing_email)
    `)
    .eq("id", leadId)
    .single();

  if (!lead) return;

  type VehicleRow = { title: string };
  type OrgRow = { name: string; billing_email: string | null };
  const vehicle = lead.vehicles as unknown as VehicleRow | null;
  const org = lead.organizations as unknown as OrgRow | null;
  const vehicleTitle = vehicle?.title ?? "your enquiry";

  const { data: senderProfile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", senderUserId)
    .maybeSingle();

  const senderName = senderProfile?.full_name ?? "Someone";

  const { data: vendorMembers } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", lead.vendor_id)
    .in("role", ["owner", "admin", "manager"]);

  const vendorUserIds = new Set(vendorMembers?.map((m) => m.user_id) ?? []);
  const senderIsVendor = vendorUserIds.has(senderUserId);

  try {
    if (senderIsVendor) {
      await sendNewMessageNotification({
        to: lead.customer_email,
        recipientName: lead.customer_name,
        senderName: org?.name ?? senderName,
        vehicleTitle,
        messagePreview: messageBody,
        leadId,
        isVendorRecipient: false,
      });
    } else if (org?.billing_email) {
      await sendNewMessageNotification({
        to: org.billing_email,
        recipientName: org.name,
        senderName: lead.customer_name,
        vehicleTitle,
        messagePreview: messageBody,
        leadId,
        isVendorRecipient: true,
      });
    }
  } catch (err) {
    console.error("[chat] message notification failed:", err);
  }
}

export async function sendMessage(leadId: string, body: string) {
  const user = await requireUser();
  const payload = sendMessageSchema.safeParse({ leadId, body });

  if (!payload.success) {
    return { error: "Message must be between 1 and 2000 characters" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      lead_id: payload.data.leadId,
      sender_user_id: user.id,
      body: payload.data.body,
    })
    .select("id, lead_id, sender_user_id, body, created_at")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message. You may not have permission." };
  }

  void notifyMessageRecipient(payload.data.leadId, user.id, payload.data.body);

  return { data };
}
