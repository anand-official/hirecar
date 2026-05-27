"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchWidget } from "@/components/search-widget";
import { Grid3X3, List, SlidersHorizontal, MapPin, ArrowUpDown, ChevronDown } from "lucide-react";

// Mock data for demo - replace with actual data fetching
const mockVehicles = [
  {
    id: "1",
    slug: "toyota-camry-2023",
    title: "2023 Toyota Camry Hybrid",
    make: "Toyota",
    model: "Camry",
    year: 2023,
    city: "Sydney",
    state: "NSW",
    pricePerDayAud: 75,
    seats: 5,
    fuel: "Hybrid",
    transmission: "Automatic",
    category: "Sedan",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=600&q=80",
    vendorName: "Sydney Premium Rentals",
    vendorSlug: "sydney-premium-rentals",
    branchName: "Sydney CBD Branch",
    verified: true,
  },
  {
    id: "2",
    slug: "mazda-cx5-2023",
    title: "2023 Mazda CX-5 GT",
    make: "Mazda",
    model: "CX-5",
    year: 2023,
    city: "Melbourne",
    state: "VIC",
    pricePerDayAud: 95,
    seats: 5,
    fuel: "Petrol",
    transmission: "Automatic",
    category: "SUV",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
    vendorName: "Melbourne Car Hire",
    vendorSlug: "melbourne-car-hire",
    branchName: "Melbourne Airport",
    verified: true,
  },
  {
    id: "3",
    slug: "hyundai-kona-2022",
    title: "2022 Hyundai Kona Electric",
    make: "Hyundai",
    model: "Kona",
    year: 2022,
    city: "Brisbane",
    state: "QLD",
    pricePerDayAud: 85,
    seats: 5,
    fuel: "Electric",
    transmission: "Automatic",
    category: "SUV",
    imageUrl: "https://images.unsplash.com/photo-1593055497741-5d7b6b6d29a6?auto=format&fit=crop&w=600&q=80",
    vendorName: "Eco Rentals Brisbane",
    vendorSlug: "eco-rentals-brisbane",
    branchName: "Brisbane CBD",
    verified: true,
  },
  {
    id: "4",
    slug: "kia-carnival-2023",
    title: "2023 Kia Carnival",
    make: "Kia",
    model: "Carnival",
    year: 2023,
    city: "Perth",
    state: "WA",
    pricePerDayAud: 125,
    seats: 8,
    fuel: "Diesel",
    transmission: "Automatic",
    category: "People mover",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
    vendorName: "Perth Family Rentals",
    vendorSlug: "perth-family-rentals",
    branchName: "Perth Airport",
    verified: true,
  },
  {
    id: "5",
    slug: "bmw-3series-2023",
    title: "2023 BMW 3 Series",
    make: "BMW",
    model: "3 Series",
    year: 2023,
    city: "Sydney",
    state: "NSW",
    pricePerDayAud: 145,
    seats: 5,
    fuel: "Petrol",
    transmission: "Automatic",
    category: "Luxury",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
    vendorName: "Luxury Car Hire Sydney",
    vendorSlug: "luxury-car-hire-sydney",
    branchName: "Sydney Airport",
    verified: true,
  },
  {
    id: "6",
    slug: "toyota-hilux-2022",
    title: "2022 Toyota Hilux SR5",
    make: "Toyota",
    model: "Hilux",
    year: 2022,
    city: "Adelaide",
    state: "SA",
    pricePerDayAud: 95,
    seats: 5,
    fuel: "Diesel",
    transmission: "Automatic",
    category: "Ute",
    imageUrl: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80",
    vendorName: "Adelaide Utility Rentals",
    vendorSlug: "adelaide-utility-rentals",
    branchName: "Adelaide CBD",
    verified: true,
  },
];

type ViewMode = "grid" | "list";
type SortOption = "price-asc" | "price-desc" | "newest" | "rating";

function SearchContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || undefined,
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
    seats: searchParams.get("seats") ? parseInt(searchParams.get("seats")!) : undefined,
    transmission: searchParams.get("transmission") || undefined,
    fuel: searchParams.get("fuel") || undefined,
    make: searchParams.get("make") || undefined,
  });

  const handleFilterChange = (newFilters: Record<string, string | number | undefined>) => {
    setFilters(newFilters as typeof filters);
    // In a real app, this would trigger a new search
  };

  // Apply filters to mock data
  let filteredVehicles = mockVehicles.filter((vehicle) => {
    if (filters.city && vehicle.city !== filters.city) return false;
    if (filters.category && vehicle.category !== filters.category) return false;
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission) return false;
    if (filters.fuel && vehicle.fuel !== filters.fuel) return false;
    if (filters.seats && vehicle.seats < filters.seats) return false;
    if (filters.minPrice && vehicle.pricePerDayAud < filters.minPrice) return false;
    if (filters.maxPrice && vehicle.pricePerDayAud > filters.maxPrice) return false;
    return true;
  });

  // Sort vehicles
  filteredVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.pricePerDayAud - b.pricePerDayAud;
      case "price-desc":
        return b.pricePerDayAud - a.pricePerDayAud;
      case "newest":
        return b.year - a.year;
      default:
        return 0;
    }
  });

  const totalResults = filteredVehicles.length;
  const currentPage = 1;
  const perPage = 20;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "rating", label: "Best Rated" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Search Widget Header */}
      <div className="bg-white border-b border-slate-200 sticky top-[72px] z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SearchWidget variant="compact" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Search</span>
            {filters.city && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900">{filters.city}</span>
              </>
            )}
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {totalResults} vehicles available
            {filters.city && <span className="text-amber-500"> in {filters.city}</span>}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            From verified local operators across Australia
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-[180px]">
              <FilterSidebar
                currentFilters={filters}
                onFilterChange={handleFilterChange}
                totalResults={totalResults}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 pl-3">
                {/* Mobile Filter Button */}
                <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                {/* Results Count */}
                <span className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">1-{Math.min(totalResults, perPage)}</span> of{" "}
                  <span className="font-bold text-slate-900">{totalResults}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 pr-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-all"
                  >
                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                    {sortOptions.find((o) => o.value === sortBy)?.label}
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-10 overflow-hidden py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                            sortBy === option.value ? "text-amber-600 font-bold bg-amber-50/50" : "text-slate-600 hover:bg-slate-50 font-medium"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mb-6">
                  <MapPin className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No vehicles found
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  We couldn't find any vehicles matching your current filters. Try adjusting your search or browsing all available locations.
                </p>
                <button
                  onClick={() => handleFilterChange({})}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                  {filteredVehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      priority={index < 3}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalResults > perPage && (
                  <div className="mt-12 flex items-center justify-center gap-3">
                    <button className="px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed shadow-sm" disabled>
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((page) => (
                        <button
                          key={page}
                          className={`w-11 h-11 rounded-xl text-sm font-bold shadow-sm transition-colors ${
                            page === currentPage
                              ? "bg-slate-950 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button className="px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
