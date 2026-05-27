import type { Vehicle, Vendor } from "@/lib/types";

export const featuredVehicles: Vehicle[] = [
  {
    id: "veh_1",
    slug: "melbourne-toyota-camry-hybrid",
    title: "Toyota Camry Hybrid",
    make: "Toyota",
    model: "Camry Hybrid",
    year: 2024,
    city: "Melbourne",
    state: "VIC",
    pricePerDayAud: 86,
    seats: 5,
    fuel: "Hybrid",
    transmission: "Automatic",
    category: "Sedan",
    imageUrl:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
    vendorName: "Harbour Fleet Rentals",
    vendorSlug: "harbour-fleet-rentals",
    branchName: "Melbourne CBD",
    verified: true,
  },
  {
    id: "veh_2",
    slug: "sydney-kia-carnival",
    title: "Kia Carnival",
    make: "Kia",
    model: "Carnival",
    year: 2023,
    city: "Sydney",
    state: "NSW",
    pricePerDayAud: 119,
    seats: 8,
    fuel: "Petrol",
    transmission: "Automatic",
    category: "People mover",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    vendorName: "Metro Van Hire",
    vendorSlug: "metro-van-hire",
    branchName: "Mascot",
    verified: true,
  },
  {
    id: "veh_3",
    slug: "brisbane-mitsubishi-outlander",
    title: "Mitsubishi Outlander",
    make: "Mitsubishi",
    model: "Outlander",
    year: 2024,
    city: "Brisbane",
    state: "QLD",
    pricePerDayAud: 102,
    seats: 7,
    fuel: "Petrol",
    transmission: "Automatic",
    category: "SUV",
    imageUrl:
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1400&q=80",
    vendorName: "Coastal Rental Co",
    vendorSlug: "coastal-rental-co",
    branchName: "Fortitude Valley",
    verified: false,
  },
];

export const vendors: Vendor[] = [
  {
    id: "ven_1",
    slug: "harbour-fleet-rentals",
    name: "Harbour Fleet Rentals",
    city: "Melbourne",
    state: "VIC",
    verified: true,
    vehicleCount: 42,
    averageRating: 4.8,
    reviewCount: 124,
    description:
      "Business-focused rental operator with CBD pickup, airport delivery, and hybrid fleet options.",
  },
  {
    id: "ven_2",
    slug: "metro-van-hire",
    name: "Metro Van Hire",
    city: "Sydney",
    state: "NSW",
    verified: true,
    vehicleCount: 31,
    averageRating: 4.2,
    reviewCount: 56,
    description:
      "Family vans, people movers, and commercial vehicles near Sydney Airport.",
  },
];

export const cities = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"];
