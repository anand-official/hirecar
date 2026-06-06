export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";
export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type PlanCode = "starter" | "growth" | "pro";
export type MemberRole = "owner" | "admin" | "manager" | "staff";

export type Vehicle = {
  id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  city: string;
  state: string;
  pricePerDayAud: number;
  seats: number;
  fuel: string;
  transmission: string;
  category: string;
  imageUrl: string;
  vendorName: string;
  vendorSlug: string;
  branchName: string;
  verified: boolean;
  dailyDistanceLimitKm?: number | null;
  extraDistanceFeeAud?: number | null;
  instantBook?: boolean;
};

export type Vendor = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  verified: boolean;
  vehicleCount: number;
  description: string;
  averageRating?: number;
  reviewCount?: number;
};
