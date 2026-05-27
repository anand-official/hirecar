import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutSession } from "@/lib/billing/stripe";
import { requireUser } from "@/lib/security/auth";
import { checkoutSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const contentType = request.headers.get("content-type") ?? "";
  const rawPayload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const payload = checkoutSchema.safeParse(rawPayload);

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const session = await createCheckoutSession({
    plan: payload.data.plan,
    organizationId: payload.data.organizationId,
    userId: user.id,
    email: user.email,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a Checkout URL" }, { status: 500 });
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
