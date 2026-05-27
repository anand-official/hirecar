import { Resend } from "resend";
import { optionalEnv } from "@/lib/config";

const apiKey = optionalEnv("RESEND_API_KEY");
export const resend = apiKey ? new Resend(apiKey) : null;

export async function sendLeadAlert(input: {
  to: string;
  vehicleTitle: string;
  customerName: string;
}) {
  if (!resend) {
    return { skipped: true };
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Carhire Leads <leads@example.com>",
    to: input.to,
    subject: `New rental lead for ${input.vehicleTitle}`,
    text: `${input.customerName} submitted a rental enquiry. Open the vendor dashboard to review and respond.`,
  });

  return { skipped: false };
}
