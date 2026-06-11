import { Resend } from "resend";
import { getAppUrl, optionalEnv } from "@/lib/config";

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

export async function sendCustomerEnquiryConfirmation(input: {
  to: string;
  customerName: string;
  vehicleTitle: string;
  leadId: string;
}) {
  if (!resend) {
    return { skipped: true };
  }

  const chatUrl = `${getAppUrl()}/messages/${input.leadId}`;
  const signInUrl = `${getAppUrl()}/auth/sign-in?redirectedFrom=${encodeURIComponent(chatUrl)}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Hire Car <noreply@hirecarmarketplace.com.au>",
    to: input.to,
    subject: `Your enquiry for ${input.vehicleTitle}`,
    text: [
      `Hi ${input.customerName},`,
      "",
      `We've sent your rental enquiry for ${input.vehicleTitle} to the vendor.`,
      "",
      `Sign in to chat with the vendor and track your enquiry:`,
      signInUrl,
      "",
      `Or open your conversation directly after signing in:`,
      chatUrl,
    ].join("\n"),
  });

  return { skipped: false };
}

export async function sendNewMessageNotification(input: {
  to: string;
  recipientName: string;
  senderName: string;
  vehicleTitle: string;
  messagePreview: string;
  leadId: string;
  isVendorRecipient: boolean;
}) {
  if (!resend) {
    return { skipped: true };
  }

  const preview = sanitizeMessagePreview(input.messagePreview);
  const chatUrl = input.isVendorRecipient
    ? `${getAppUrl()}/vendor/leads/${input.leadId}`
    : `${getAppUrl()}/messages/${input.leadId}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Hire Car <noreply@hirecarmarketplace.com.au>",
    to: input.to,
    subject: `New message about ${input.vehicleTitle}`,
    text: [
      `Hi ${input.recipientName},`,
      "",
      `${input.senderName} sent you a message about ${input.vehicleTitle}:`,
      "",
      `"${preview}"`,
      "",
      `Reply here: ${chatUrl}`,
    ].join("\n"),
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

/** Maximum characters of untrusted inbound content included in a notification email. */
const WHATSAPP_PREVIEW_MAX_LENGTH = 300;

/**
 * Collapse and truncate untrusted inbound message content for safe inclusion in
 * a plain-text email body. Strips control characters (defends against header
 * injection / log spoofing) and caps length, since the preview originates from
 * an external WhatsApp sender.
 */
function sanitizeMessagePreview(raw: string): string {
  // Replace any control characters (including CR/LF/tabs) with a single space.
  const collapsed = raw.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
  if (collapsed.length <= WHATSAPP_PREVIEW_MAX_LENGTH) {
    return collapsed;
  }
  return `${collapsed.slice(0, WHATSAPP_PREVIEW_MAX_LENGTH)}…`;
}

/**
 * Retry an async operation up to `maxAttempts` times with a small linear
 * backoff, throwing the last error if every attempt fails. Used so transient
 * email-delivery failures are retried before the caller records the outcome.
 */
async function withRetry<T>(operation: () => Promise<T>, maxAttempts = 3): Promise<T> {
  const attempts = Math.max(1, Math.floor(maxAttempts));
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        // Linear backoff: 100ms, 200ms, ... keeps the webhook responsive while
        // smoothing over brief upstream blips.
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
      }
    }
  }
  throw lastError;
}

/**
 * Notify a lead recipient (vendor or support) about a new inbound WhatsApp lead.
 *
 * Contract:
 * - Returns `{ skipped: true }` without sending when Resend is unconfigured
 *   (`RESEND_API_KEY` unset), matching {@link sendLeadAlert} / {@link sendContactMessage}.
 * - Returns `{ skipped: false }` once the email has been accepted by Resend.
 * - Retries transient send failures up to `maxAttempts` times (default 3). If
 *   every attempt fails, the underlying error is thrown so the caller (the
 *   webhook) can record the final delivery status on the lead. Callers are
 *   expected to catch this and persist a failed status rather than crashing.
 *
 * The `messagePreview` is treated as untrusted inbound content: it is sanitized
 * and length-limited before inclusion, and no secrets are referenced.
 */
export async function sendWhatsAppLeadAlert(
  input: {
    to: string;
    senderName: string;
    senderPhone: string;
    messagePreview: string;
    leadUrl: string;
  },
  maxAttempts = 3,
): Promise<{ skipped: boolean }> {
  if (!resend) {
    return { skipped: true };
  }

  const client = resend;
  const preview = sanitizeMessagePreview(input.messagePreview);

  await withRetry(
    () =>
      client.emails.send({
        from: process.env.EMAIL_FROM ?? "Hire Car Leads <leads@example.com>",
        to: input.to,
        subject: `New WhatsApp lead from ${input.senderName}`,
        text: [
          `${input.senderName} sent a new WhatsApp enquiry.`,
          "",
          `Name: ${input.senderName}`,
          `Phone: ${input.senderPhone}`,
          `Message: ${preview}`,
          "",
          `View the lead: ${input.leadUrl}`,
        ].join("\n"),
      }),
    maxAttempts,
  );

  return { skipped: false };
}
