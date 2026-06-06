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
    from: process.env.EMAIL_FROM ?? "Hire Car Leads <leads@example.com>",
    to: input.to,
    subject: `New rental lead for ${input.vehicleTitle}`,
    text: `${input.customerName} submitted a rental enquiry. Open the vendor dashboard to review and respond.`,
  });

  return { skipped: false };
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  if (!resend) {
    return { skipped: true };
  }

  const to = process.env.CONTACT_EMAIL_TO ?? process.env.EMAIL_FROM ?? "admin.hirecar@gmail.com";

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Hire Car Support <admin.hirecar@gmail.com>",
    to,
    replyTo: input.email,
    subject: `Hire Car contact: ${input.topic}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Topic: ${input.topic}`,
      "",
      input.message,
    ].join("\n"),
  });

  return { skipped: false };
}
