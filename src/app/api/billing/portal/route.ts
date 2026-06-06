import { NextResponse, type NextRequest } from "next/server";
import { readFormDataBody } from "@/lib/api/request";
import { getStripe } from "@/lib/billing/stripe";
import { getAppUrl } from "@/lib/config";
import { requireApiUser } from "@/lib/security/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { data: formData, response: formError } = await readFormDataBody(request);
  if (formError) return formError;

  const customerId = String(formData.get("stripeCustomerId") ?? "");

  if (!customerId.startsWith("cus_")) {
    return NextResponse.json({ error: "Missing Stripe customer" }, { status: 400 });
  }

  // SECURITY: Verify the provided Stripe customer ID actually belongs to an
  // organization the authenticated user is a member of. Without this check,
  // any logged-in user could open the billing portal for any other customer.
  const supabase = createAdminClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "Invalid customer" }, { status: 400 });
  }

  // Verify the user is a member of the organization that owns this subscription
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", subscription.organization_id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}/vendor/billing`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
