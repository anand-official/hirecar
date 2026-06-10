import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mutable send mock + key flag so each test can choose whether Resend is
// "configured" (key present) and how the send behaves.
const sendMock = vi.fn();
let apiKey: string | undefined = "test-key";

vi.mock("@/lib/config", () => ({
  optionalEnv: (name: string) => (name === "RESEND_API_KEY" ? apiKey : undefined),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const baseInput = {
  to: "vendor@example.com",
  senderName: "Jane Doe",
  senderPhone: "447700900123",
  messagePreview: "Hi, is the Toyota available this weekend?",
  leadUrl: "https://hirecar.example/admin/leads/abc",
};

describe("sendWhatsAppLeadAlert", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    apiKey = "test-key";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no-ops and returns skipped when Resend is unconfigured", async () => {
    apiKey = undefined;
    const { sendWhatsAppLeadAlert } = await import("./resend");

    const result = await sendWhatsAppLeadAlert(baseInput);

    expect(result).toEqual({ skipped: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends a plain-text alert and returns skipped=false on success", async () => {
    sendMock.mockResolvedValue({ id: "email_1" });
    const { sendWhatsAppLeadAlert } = await import("./resend");

    const result = await sendWhatsAppLeadAlert(baseInput);

    expect(result).toEqual({ skipped: false });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const payload = sendMock.mock.calls[0][0];
    expect(payload.subject).toBe("New WhatsApp lead from Jane Doe");
    expect(payload.to).toBe("vendor@example.com");
    expect(payload.text).toContain("447700900123");
    expect(payload.text).toContain("Toyota available this weekend");
    expect(payload.text).toContain(baseInput.leadUrl);
  });

  it("truncates and strips control characters from the message preview", async () => {
    sendMock.mockResolvedValue({ id: "email_1" });
    const { sendWhatsAppLeadAlert } = await import("./resend");

    await sendWhatsAppLeadAlert({
      ...baseInput,
      messagePreview: `line one\nline two\r\n${"x".repeat(500)}`,
    });

    const text: string = sendMock.mock.calls[0][0].text;
    const messageLine = text.split("\n").find((line) => line.startsWith("Message: "))!;
    // No raw newlines leaked into the body beyond our own join structure.
    expect(messageLine).toContain("line one line two");
    expect(messageLine).toContain("…");
    // Preview portion is capped (300 chars + ellipsis), not the full 500+.
    expect(messageLine.length).toBeLessThan("Message: ".length + 320);
  });

  it("retries transient failures then succeeds", async () => {
    vi.useFakeTimers();
    sendMock
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce({ id: "email_2" });
    const { sendWhatsAppLeadAlert } = await import("./resend");

    const promise = sendWhatsAppLeadAlert(baseInput, 3);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual({ skipped: false });
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting all attempts so the caller can record failure", async () => {
    vi.useFakeTimers();
    sendMock.mockRejectedValue(new Error("down"));
    const { sendWhatsAppLeadAlert } = await import("./resend");

    const promise = sendWhatsAppLeadAlert(baseInput, 3);
    const assertion = expect(promise).rejects.toThrow("down");
    await vi.runAllTimersAsync();
    await assertion;

    expect(sendMock).toHaveBeenCalledTimes(3);
  });
});
