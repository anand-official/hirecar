import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Vehicles | Hire Car",
  description: "Search and filter through our nationwide inventory of verified rental vehicles.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
