"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, X, SlidersHorizontal, RotateCcw } from "lucide-react";

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
}

const categories = [
  { value: "Sedan", label: "Sedan", count: 45 },
  { value: "SUV", label: "SUV", count: 38 },
  { value: "People mover", label: "People Mover", count: 12 },
  { value: "Van", label: "Van", count: 23 },
  { value: "Ute", label: "Ute", count: 18 },
  { value: "Luxury", label: "Luxury", count: 8 },
];

const transmissions = [
  { value: "Automatic", label: "Automatic", count: 89 },
  { value: "Manual", label: "Manual", count: 55 },
];

const fuelTypes = [
  { value: "Petrol", label: "Petrol", count: 78 },
  { value: "Diesel", label: "Diesel", count: 42 },
  { value: "Hybrid", label: "Hybrid", count: 15 },
  { value: "Electric", label: "Electric", count: 9 },
];

const seatOptions = [
  { value: 2, label: "2 seats" },
  { value: 4, label: "4 seats" },
  { value: 5, label: "5 seats" },
  { value: 7, label: "7 seats" },
  { value: 8, label: "8+ seats" },
];

const popularMakes = [
  { value: "Toyota", label: "Toyota", count: 28 },
  { value: "Mazda", label: "Mazda", count: 22 },
  { value: "Hyundai", label: "Hyundai", count: 18 },
  { value: "Kia", label: "Kia", count: 15 },
  { value: "Ford", label: "Ford", count: 12 },
  { value: "BMW", label: "BMW", count: 8 },
];

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

export function FilterSidebar({ currentFilters, onFilterChange, totalResults }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["category", "price"]);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden flex items-center gap-2 w-full justify-center py-3 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium mb-4"
      >
        <SlidersHorizontal className="h-5 w-5" />
        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${mobileOpen ? "fixed inset-y-0 left-0 z-50 w-80" : "hidden lg:block"}
        bg-white lg:bg-transparent lg:sticky lg:top-24 lg:h-fit
      `}>
        <div className="h-full overflow-auto lg:overflow-visible bg-white lg:rounded-xl lg:border lg:border-slate-200 lg:shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:border-0">
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
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

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
                    <span className="text-xs text-slate-400">({cat.count})</span>
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
                    <span className="text-xs text-slate-400">({trans.count})</span>
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
                    <span className="text-xs text-slate-400">({fuel.count})</span>
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
                    <span className="text-xs text-slate-400">({make.count})</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Mobile Apply Button */}
          <div className="lg:hidden p-4 border-t border-slate-100">
            <button
              onClick={() => setMobileOpen(false)}
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