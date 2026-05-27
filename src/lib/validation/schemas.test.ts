import { describe, expect, it } from "vitest";
import { leadSchema, onboardingSchema } from "./schemas";

describe("marketplace validation", () => {
  it("requires an 11 digit ABN and legal agreement acceptance", () => {
    expect(() =>
      onboardingSchema.parse({
        businessName: "Harbour Fleet Rentals",
        abn: "123",
        contactName: "Asha Patel",
        phone: "0400000000",
        city: "Melbourne",
        state: "VIC",
        address: "1 Collins Street",
        acceptedAgreement: true,
      }),
    ).toThrow();
  });

  it("rejects lead submissions without consent", () => {
    expect(() =>
      leadSchema.parse({
        vehicleId: "11111111-1111-4111-8111-111111111111",
        vendorId: "22222222-2222-4222-8222-222222222222",
        name: "Jordan Lee",
        email: "jordan@example.com",
        phone: "0412345678",
        pickupCity: "Sydney",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        consent: false,
      }),
    ).toThrow();
  });
});
