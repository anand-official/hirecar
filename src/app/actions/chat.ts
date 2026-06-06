"use server";

import { requireUser } from "@/lib/security/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  leadId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export async function sendMessage(leadId: string, body: string) {
  const user = await requireUser();
  const payload = sendMessageSchema.safeParse({ leadId, body });

  if (!payload.success) {
    return { error: "Message must be between 1 and 2000 characters" };
  }

  // Use the authenticated client so RLS handles authorization natively
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
    // If it's an RLS error, it will manifest as an insert failure
    return { error: "Failed to send message. You may not have permission." };
  }

  return { data };
}
