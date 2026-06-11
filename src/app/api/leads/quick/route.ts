import { NextResponse, type NextRequest } from "next/server";
import { readJsonBody } from "@/lib/api/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCustomerEnquiryConfirmation, sendLeadAlert } from "@/lib/email/resend";
import { requireApiUser } from "@/lib/security/auth";
import { clientIp, hashIpForStorage } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const ip = clientIp(request.headers);
    const ipHash = hashIpForStorage(ip);
    const { data: body, response: jsonError } = await readJsonBody(request);
    if (jsonError) return jsonError;
    
    const { vehicleId, vendorId } = body;
    
    if (!vehicleId || !vendorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.email) {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
    }

    // 2. Validate vehicle and vendor
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id, branch_id, title")
      .eq("id", vehicleId)
      .eq("organization_id", vendorId)
      .eq("status", "approved")
      .single();

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not available" }, { status: 404 });
    }

    const { data: organization } = await supabase
      .from("organizations")
      .select("billing_email")
      .eq("id", vendorId)
      .single();

    // Get pickup city from branch
    const { data: branch } = await supabase
      .from("branches")
      .select("city")
      .eq("id", vehicle.branch_id)
      .single();

    // 3. Prevent duplicate leads in short timeframe
    const { data: duplicateLead } = await supabase
      .from("leads")
      .select("id")
      .eq("vehicle_id", vehicleId)
      .eq("customer_email", profile.email)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (duplicateLead) {
      return NextResponse.json({
        success: true,
        leadId: duplicateLead.id,
        duplicate: true,
      });
    }

    // 4. Create the lead
    // Set some default dates since this is a quick interest expression, 
    // we can default to tomorrow and the day after just to satisfy the schema constraints
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4);

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        vehicle_id: vehicleId,
        vendor_id: vendorId,
        customer_name: profile.full_name || "Interested User",
        customer_email: profile.email,
        customer_phone: profile.phone || "Not provided",
        pickup_city: branch?.city || "Unknown",
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        message: "I am interested in this vehicle. Please contact me via chat.",
        ip_hash: ipHash,
        status: "new",
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("Lead insertion error:", leadError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // 5. Auto-create the first message in the chat thread
    await supabase.from("messages").insert({
      lead_id: lead.id,
      sender_user_id: user.id,
      body: "I am interested in this vehicle. Is it still available?",
    });

    await supabase.from("lead_events").insert({
      lead_id: lead.id,
      event_type: "quick_interest_submitted",
      metadata: { ip_hash: ipHash, user_id: user.id },
    });

    if (organization?.billing_email) {
      try {
        await sendLeadAlert({
          to: organization.billing_email,
          vehicleTitle: vehicle.title,
          customerName: profile.full_name || "Interested User",
        });
      } catch (emailErr) {
        console.error("[quick lead] vendor alert failed:", emailErr);
      }
    }

    try {
      await sendCustomerEnquiryConfirmation({
        to: profile.email,
        customerName: profile.full_name || "Customer",
        vehicleTitle: vehicle.title,
        leadId: lead.id,
      });
    } catch (emailErr) {
      console.error("[quick lead] customer confirmation failed:", emailErr);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Exception in quick lead API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
