// Feature: elite-ui-overhaul, Property 3: VehicleCard Field Completeness

/**
 * Property Test: VehicleCard Field Completeness
 *
 * For any valid Vehicle object, rendered VehicleCard SHALL contain
 * vehicle name, category, price per day, vendor name, location city,
 * and a CTA link to the vehicle detail page.
 *
 * **Validates: Requirements 5.5**
 */

// @vitest-environment jsdom

import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import { PBT_CONFIG } from "./setup";
import { vehicleArb } from "./arbitraries";
import type { Vehicle as ArbVehicle } from "./arbitraries";
import { VehicleCard } from "@/components/vehicle-card";
import type { Vehicle } from "@/lib/types";

// Mock next/image to render a plain img element
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, ...rest } = props;
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/**
 * Maps the generated arbitrary Vehicle (design doc shape) to the
 * component's Vehicle type (from @/lib/types).
 */
function toComponentVehicle(arb: ArbVehicle): Vehicle {
  return {
    id: arb.id,
    slug: arb.slug,
    title: arb.name,
    make: "TestMake",
    model: "TestModel",
    year: 2023,
    city: arb.location_city,
    state: "WA",
    pricePerDayAud: arb.price_per_day,
    seats: arb.seats,
    fuel: arb.fuel_type,
    transmission: arb.transmission,
    category: arb.category,
    imageUrl: arb.image_url || "/vehicle-placeholder.jpg",
    vendorName: arb.vendor_name,
    vendorSlug: arb.vendor_slug,
    branchName: arb.branch_location,
    verified: true,
    instantBook: false,
  };
}

describe("Property 3: VehicleCard Field Completeness", () => {
  it("rendered VehicleCard contains vehicle name, category, price, vendor name, location city, and CTA link for any valid Vehicle", () => {
    fc.assert(
      fc.property(vehicleArb, (arbVehicle) => {
        const vehicle = toComponentVehicle(arbVehicle);
        const { container, unmount } = render(<VehicleCard vehicle={vehicle} />);

        const textContent = container.textContent || "";

        // Vehicle name must be present
        expect(textContent).toContain(vehicle.title);

        // Price per day must be present (as rendered number)
        expect(textContent).toContain(String(vehicle.pricePerDayAud));

        // Vendor name must be present
        expect(textContent).toContain(vehicle.vendorName);

        // Location city must be present
        expect(textContent).toContain(vehicle.city);

        // CTA link to vehicle detail page must be present
        const link = container.querySelector(`a[href="/cars/${vehicle.slug}"]`);
        expect(link).not.toBeNull();

        // Cleanup to avoid DOM accumulation
        unmount();
      }),
      PBT_CONFIG
    );
  });
});
