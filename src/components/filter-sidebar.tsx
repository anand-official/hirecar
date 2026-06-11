"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, X, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  currentFilters: {
    city?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    seats?: number;
    transmission?: string;
    fuel?: string;
    make?: string;
  };
  onFilterChange: (filters: Record<string, string | number | undefined>) => void;
  totalResults: number;
  /** Controlled open state for the mobile drawer */
  mobileOpen?: boolean;
  /** Called when the mobile drawer should close */
  onMobileClose?: () => void;
  /** When true, renders ONLY the mobile drawer (no desktop panel) */
  mobileOnly?: boolean;
  /** Live facet counts from search API */
  facetCounts?: Record<string, Record<string, number>>;
}

const categories = [
  { value: "Sedan", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "People mover", label: "People Mover" },
  { value: "Van", label: "Van" },
  { value: "Ute", label: "Ute" },
  { value: "Luxury", label: "Luxury" },
];

const transmissions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const fuelTypes = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Electric", label: "Electric" },
];

const seatOptions = [
  { value: 2, label: "2 seats" },
  { value: 4, label: "4 seats" },
  { value: 5, label: "5 seats" },
  { value: 7, label: "7 seats" },
  { value: 8, label: "8+ seats" },
];

const popularMakes = [
  { value: "Toyota", label: "Toyota" },
  { value: "Mazda", label: "Mazda" },
  { value: "Hyundai", label: "Hyundai" },
  { value: "Kia", label: "Kia" },
  { value: "Ford", label: "Ford" },
  { value: "BMW", label: "BMW" },
];

function facetCount(
  facetCounts: Record<string, Record<string, number>> | undefined,
  field: string,
  value: string,
): number | null {
  const count = facetCounts?.[field]?.[value];
  return count !== undefined ? count : null;
}

interface FilterSectionProps {
  title: string;
  sectionKey: string;
  expandedSections: string[];
  toggleSection: (section: string) => void;
  children: ReactNode;
}

function FilterSection({ title, sectionKey, expandedSections, toggleSection, children }: FilterSectionProps) {
  const isExpanded = expandedSections.includes(sectionKey);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        <ChevronDown 
          className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} 
        />
      </button>
      {isExpanded && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function FilterSidebar({
  currentFilters,
  onFilterChange,
  totalResults,
  mobileOpen = false,
  onMobileClose,
  mobileOnly = false,
  facetCounts,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["category", "price"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const activeFiltersCount = Object.values(currentFilters).filter(v => v !== undefined && v !== "" && v !== 0).length;

  const updateFilter = (key: string, value: string | number | undefined) => {
    onFilterChange({ ...currentFilters, [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = activeFiltersCount > 0;

  const handleClose = () => {
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${mobileOnly
          ? mobileOpen ? "fixed inset-y-0 right-0 z-[101] w-[85vw] max-w-[340px] shadow-2xl" : "hidden"
          : mobileOpen ? "fixed inset-y-0 right-0 z-[101] w-[85vw] max-w-[340px] shadow-2xl" : "hidden lg:block"
        }
        bg-white lg:bg-transparent lg:sticky lg:top-24 lg:h-fit
      `}>
        <div className="h-full flex flex-col bg-white lg:rounded-xl lg:border lg:border-slate-200 lg:shadow-sm lg:block">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between p-4 border-b border-slate-100 lg:border-0">
            <div>
              <h2 className="font-semibold text-slate-900">Filters</h2>
              <p className="text-sm text-slate-500">{totalResults} results</p>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>
              )}
              <button
                onClick={handleClose}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto lg:overflow-visible">
            {/* Active Filter Pills */}
            {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 p-4 border-b border-slate-100">
              {Object.entries(currentFilters).map(([key, value]) => {
                if (!value || value === "" || value === 0) return null;
                return (
                  <span 
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
                  >
                    {key}: {value}
                    <button 
                      onClick={() => updateFilter(key, undefined)}
                      className="hover:text-amber-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Filter Sections */}
          <div className="px-4 pb-4">
            {/* Category */}
            <FilterSection title="Vehicle Type" sectionKey="category" expandedSections={expandedSections} toggleSection={toggleSection}>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentFilters.category === cat.value}
                      onChange={(e) => updateFilter("category", e.target.checked ? cat.value : undefined)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900">
                      {cat.label}
                    </span>
                    {facetCount(facetCounts, "category", cat.value) !== null && (
                      <span className="text-xs text-slate-400">
                        ({facetCount(facetCounts, "category", cat.value)})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" sectionKey="price" expandedSections={expandedSections} toggleSection={toggleSection}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Min ($/day)</label>
                    <input
                      type="number"
                      value={currentFilters.minPrice || ""}
                      onChange={(e) => updateFilter("minPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                      min={0}
                      max={2000}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Max ($/day)</label>
                    <input
                      type="number"
                      value={currentFilters.maxPrice || ""}
                      onChange={(e) => updateFilter("maxPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="2000"
                      min={0}
                      max={2000}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={currentFilters.maxPrice || 500}
                  onChange={(e) => updateFilter("maxPrice", parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </FilterSection>

            {/* Seats */}
            <FilterSection title="Seats" sectionKey="seats" expandedSections={expandedSections} toggleSection={toggleSection}>
              <div className="flex flex-wrap gap-2">
                {seatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter("seats", currentFilters.seats === option.value ? undefined : option.value)}
                    className={`
                      px-3 py-1.5 text-sm rounded-lg border transition-colors
                      ${currentFilters.seats === option.value 
                        ? "border-amber-500 bg-amber-50 text-amber-700 font-medium" 
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Transmission */}
            <FilterSection title="Transmission" sectionKey="transmission" expandedSections={expandedSections} toggleSection={toggleSection}>
              <div className="space-y-2">
                {transmissions.map((trans) => (
                  <label key={trans.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentFilters.transmission === trans.value}
                      onChange={(e) => updateFilter("transmission", e.target.checked ? trans.value : undefined)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900">
                      {trans.label}
                    </span>
                    {facetCount(facetCounts, "transmission", trans.value) !== null && (
                      <span className="text-xs text-slate-400">
                        ({facetCount(facetCounts, "transmission", trans.value)})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Fuel Type */}
            <FilterSection title="Fuel Type" sectionKey="fuel" expandedSections={expandedSections} toggleSection={toggleSection}>
              <div className="space-y-2">
                {fuelTypes.map((fuel) => (
                  <label key={fuel.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentFilters.fuel === fuel.value}
                      onChange={(e) => updateFilter("fuel", e.target.checked ? fuel.value : undefined)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900">
                      {fuel.label}
                    </span>
                    {facetCount(facetCounts, "fuel", fuel.value) !== null && (
                      <span className="text-xs text-slate-400">
                        ({facetCount(facetCounts, "fuel", fuel.value)})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Make */}
            <FilterSection title="Make" sectionKey="make" expandedSections={expandedSections} toggleSection={toggleSection}>
              <div className="space-y-2">
                {popularMakes.map((make) => (
                  <label key={make.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentFilters.make === make.value}
                      onChange={(e) => updateFilter("make", e.target.checked ? make.value : undefined)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900">
                      {make.label}
                    </span>
                    {facetCount(facetCounts, "make", make.value) !== null && (
                      <span className="text-xs text-slate-400">
                        ({facetCount(facetCounts, "make", make.value)})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
          </div>

          {/* Mobile Apply Button */}
          <div className="shrink-0 lg:hidden p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Show {totalResults} results
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}