import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { getAppUrl } from "@/lib/config";
import { requireUser } from "@/lib/security/auth";

export async function POST(request: NextRequest) {
  await requireUser();
  const formData = await request.formData();
  const customerId = String(formData.get("stripeCustomerId") ?? "");

  if (!customerId.startsWith("cus_")) {
    return NextResponse.json({ error: "Missing Stripe customer" }, { status: 400 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}/vendor/billing`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
