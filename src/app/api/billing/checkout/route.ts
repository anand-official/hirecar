import { NextResponse, type NextRequest } from "next/server";
import { readFormDataBody, readJsonBody } from "@/lib/api/request";
import { createCheckoutSession } from "@/lib/billing/stripe";
import { requireApiUser } from "@/lib/security/auth";
import { checkoutSchema } from "@/lib/validation/schemas";
import { ensureUserCanManageOrganization } from "@/lib/data/vendor";

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const contentType = request.headers.get("content-type") ?? "";
  const rawPayloadResult = contentType.includes("application/json")
    ? await readJsonBody(request)
    : await readFormDataBody(request);

  if (rawPayloadResult.response) return rawPayloadResult.response;

  const rawPayload =
    rawPayloadResult.data instanceof FormData
      ? Object.fromEntries(rawPayloadResult.data.entries())
      : rawPayloadResult.data;

  const payload = checkoutSchema.safeParse(rawPayload);

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  // SECURITY: Verify the authenticated user is a member of the target organization.
  // Without this check, any logged-in user could initiate a checkout for any org (IDOR).
  await ensureUserCanManageOrganization(user.id, payload.data.organizationId);

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
