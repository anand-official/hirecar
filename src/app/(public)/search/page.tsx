"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchWidget } from "@/components/search-widget";
import { ErrorState } from "@/components/error-state";
import {
  Grid3X3,
  List,
  SlidersHorizontal,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Vehicle } from "@/lib/types";

type ViewMode = "grid" | "list";
type SortOption = "price-asc" | "price-desc" | "newest" | "rating";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Best Rated" },
];

const PER_PAGE = 20;

// ── Skeleton card ─────────────────────────────────────────────────────────────
function VehicleCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] bg-white border border-slate-200/60 shadow-sm overflow-hidden animate-pulse">
      <div className="h-56 bg-slate-200" />
      <div className="p-6 space-y-4">
        <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-slate-100 rounded-lg w-20" />
          <div className="h-6 bg-slate-100 rounded-lg w-16" />
          <div className="h-6 bg-slate-100 rounded-lg w-18" />
        </div>
        <div className="h-11 bg-slate-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Main search content ───────────────────────────────────────────────────────
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Read filters from URL params (single source of truth)
  const [filters, setFilters] = useState(() => ({
    city: searchParams.get("city") || undefined,
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
    seats: searchParams.get("seats") ? parseInt(searchParams.get("seats")!) : undefined,
    transmission: searchParams.get("transmission") || undefined,
    fuel: searchParams.get("fuel") || undefined,
    make: searchParams.get("make") || undefined,
  }));

  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("page") || "1");
    return isNaN(p) || p < 1 ? 1 : p;
  });

  // Real data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch from /api/search ────────────────────────────────────────────────
  const fetchVehicles = useCallback(async (
    currentFilters: typeof filters,
    currentPage: number,
    currentSort: SortOption,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilters.city) params.set("city", currentFilters.city);
      if (currentFilters.category) params.set("category", currentFilters.category);
      if (currentFilters.make) params.set("make", currentFilters.make);
      if (currentFilters.transmission) params.set("transmission", currentFilters.transmission);
      if (currentFilters.fuel) params.set("fuel", currentFilters.fuel);
      if (currentFilters.minPrice !== undefined) params.set("minPrice", String(currentFilters.minPrice));
      if (currentFilters.maxPrice !== undefined) params.set("maxPrice", String(currentFilters.maxPrice));
      if (currentFilters.seats !== undefined) params.set("seats", String(currentFilters.seats));
      params.set("page", String(currentPage));
      params.set("perPage", String(PER_PAGE));

      // Map sort option to API parameter
      const sortMap: Record<SortOption, string> = {
        "price-asc": "price_per_day_aud:asc",
        "price-desc": "price_per_day_aud:desc",
        "newest": "year:desc",
        "rating": "price_per_day_aud:asc", // fallback until rating is a field
      };
      params.set("sortBy", sortMap[currentSort]);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setVehicles(data.vehicles ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Something went wrong loading vehicles. Please try again.");
      setVehicles([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run search whenever filters, page, or sort change
  useEffect(() => {
    // fetchVehicles manages its own loading state internally via setIsLoading/setVehicles.
    // This is not a direct setState call — it is a side-effectful async fetch triggered by deps.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicles(filters, page, sortBy);
  }, [filters, page, sortBy, fetchVehicles]);

  // ── URL sync when filters change ─────────────────────────────────────────
  const handleFilterChange = useCallback(
    (newFilters: Record<string, string | number | undefined>) => {
      const updated = newFilters as typeof filters;
      setFilters(updated);
      setPage(1); // reset to first page when filters change

      // Push new URL so state survives refresh / share
      const params = new URLSearchParams();
      if (updated.city) params.set("city", updated.city);
      if (updated.category) params.set("category", updated.category);
      if (updated.make) params.set("make", updated.make);
      if (updated.transmission) params.set("transmission", updated.transmission);
      if (updated.fuel) params.set("fuel", updated.fuel);
      if (updated.minPrice !== undefined) params.set("minPrice", String(updated.minPrice));
      if (updated.maxPrice !== undefined) params.set("maxPrice", String(updated.maxPrice));
      if (updated.seats !== undefined) params.set("seats", String(updated.seats));
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / PER_PAGE);
  const showingFrom = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const showingTo = Math.min(page * PER_PAGE, total);

  // Build visible page numbers (max 5)
  const visiblePages = (() => {
    const range: number[] = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Sticky Search Bar */}
      <div className="bg-black sticky top-[68px] z-30 shadow-xl border-b-[6px] border-primary pb-6 pt-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SearchWidget variant="compact" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
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
            {isLoading ? (
              <span className="inline-block h-9 w-56 bg-slate-200 rounded-lg animate-pulse" />
            ) : (
              <>
                {total} vehicle{total !== 1 ? "s" : ""} available
                {filters.city && (
                  <span className="text-amber-500"> in {filters.city}</span>
                )}
              </>
            )}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            From verified local operators across Australia
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-[180px]">
              <FilterSidebar
                currentFilters={filters}
                onFilterChange={handleFilterChange}
                totalResults={total}
                mobileOpen={isMobileFilterOpen}
                onMobileClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 pl-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                {/* Results Count */}
                {!isLoading && (
                  <span className="text-sm font-medium text-slate-500">
                    Showing{" "}
                    <span className="font-bold text-slate-900">{showingFrom}–{showingTo}</span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">{total}</span>
                  </span>
                )}
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
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-10 overflow-hidden py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                            setPage(1);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                            sortBy === option.value
                              ? "text-amber-600 font-bold bg-amber-50/50"
                              : "text-slate-600 hover:bg-slate-50 font-medium"
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
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar overlay */}
            <div className="lg:hidden">
              <FilterSidebar
                currentFilters={filters}
                onFilterChange={handleFilterChange}
                totalResults={total}
                mobileOpen={isMobileFilterOpen}
                onMobileClose={() => setIsMobileFilterOpen(false)}
                mobileOnly
              />
            </div>

            {/* Error */}
            {error && (
              <ErrorState
                title="Search could not be completed"
                message={error}
                onRetry={() => fetchVehicles(filters, page, sortBy)}
                showHomeLink={true}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm mb-6"
              />
            )}

            {/* Results grid / skeleton / empty */}
            {isLoading ? (
              <SkeletonGrid />
            ) : !error && vehicles.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mb-6">
                  <MapPin className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No vehicles found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  We couldn&apos;t find any vehicles matching your filters. Try adjusting your search or browsing all locations.
                </p>
                <button
                  onClick={() => handleFilterChange({})}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : !error ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {vehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      priority={index < 3}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>

                    {visiblePages[0] > 1 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="w-11 h-11 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
                        >
                          1
                        </button>
                        {visiblePages[0] > 2 && (
                          <span className="text-slate-400 px-1">…</span>
                        )}
                      </>
                    )}

                    {visiblePages.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-11 h-11 rounded-xl text-sm font-bold shadow-sm transition-colors ${
                          p === page
                            ? "bg-slate-950 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    {visiblePages[visiblePages.length - 1] < totalPages && (
                      <>
                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                          <span className="text-slate-400 px-1">…</span>
                        )}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="w-11 h-11 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Filter FAB */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] lg:hidden">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3.5 rounded-full shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {Object.values(filters).filter(v => v !== undefined && v !== "" && v !== 0).length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
              {Object.values(filters).filter(v => v !== undefined && v !== "" && v !== 0).length}
            </span>
          )}
        </button>
      </div>

      <SiteFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <SiteHeader />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
