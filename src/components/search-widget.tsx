"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Car, Search, ChevronDown, X } from "lucide-react";
import { LocationAutocomplete } from "./LocationAutocomplete";
const cities = [
  "Sydney",
  "Melbourne", 
  "Brisbane",
  "Perth",
  "Adelaide",
  "Gold Coast",
  "Canberra",
  "Darwin",
];

const categories = [
  { value: "", label: "All Categories" },
  { value: "Sedan", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "People mover", label: "People Mover" },
  { value: "Van", label: "Van" },
  { value: "Ute", label: "Ute" },
  { value: "Luxury", label: "Luxury" },
];

interface SearchWidgetProps {
  variant?: "hero" | "compact" | "sidebar";
  className?: string;
}

export function SearchWidget({ variant = "hero", className = "" }: SearchWidgetProps) {
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [category, setCategory] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [differentReturn, setDifferentReturn] = useState(false);

  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (location) params.set("city", location);
    if (category) params.set("category", category);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    return `/search?${params.toString()}`;
  };

  const hasSearchParams = location || category || pickupDate;

  return (
    <div className={`${className}`}>
      {/* Main Search Container */}
      <div className={`
        ${isHero ? "bg-white rounded-2xl shadow-2xl p-6 md:p-8" : ""}
        ${isCompact ? "bg-white rounded-xl shadow-lg p-4" : ""}
        ${variant === "sidebar" ? "space-y-4" : ""}
      `}>
        {isHero && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Find your perfect rental</h2>
            <p className="text-sm text-slate-500 mt-1">Compare vehicles from verified local operators</p>
          </div>
        )}

        <div className={`
          ${variant !== "sidebar" ? "grid gap-4" : "space-y-4"}
          ${isHero ? "md:grid-cols-2 lg:grid-cols-4" : ""}
          ${isCompact ? "sm:grid-cols-2 lg:grid-cols-4" : ""}
        `}>
          {/* Location Input */}
          <div className="relative">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Pickup Location
            </label>
            <LocationAutocomplete 
              onSelect={(res: any) => {
                if (res?.features?.[0]?.properties?.name) {
                  setLocation(res.features[0].properties.name);
                } else if (res?.features?.[0]?.place_name) {
                  setLocation(res.features[0].place_name.split(",")[0]);
                }
              }} 
              placeholder={location || "City or airport"} 
            />
          </div>

          {/* Pickup Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Pickup Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={pickupDate || new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Vehicle Type
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-8 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Different Return Location Toggle */}
        {isHero && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setDifferentReturn(!differentReturn)}
              className={`
                flex items-center gap-2 text-sm font-medium transition-colors
                ${differentReturn ? "text-amber-600" : "text-slate-500 hover:text-slate-700"}
              `}
            >
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                ${differentReturn ? "bg-amber-500 border-amber-500" : "border-slate-300"}
              `}>
                {differentReturn && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              Different return location
            </button>
          </div>
        )}

        {/* Search Button */}
        <div className={`${variant !== "sidebar" ? "mt-6" : "mt-4"}`}>
          <Link
            href={buildSearchUrl()}
            className={`
              flex items-center justify-center gap-2 rounded-lg font-semibold text-white
              bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500
              shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30
              transition-all duration-200
              ${isHero ? "w-full md:w-auto md:inline-flex px-8 py-4 text-base" : ""}
              ${isCompact ? "w-full py-3 text-sm" : ""}
              ${variant === "sidebar" ? "w-full py-3 text-sm" : ""}
            `}
          >
            <Search className="h-5 w-5" />
            Show Cars
          </Link>
        </div>

        {/* Active Filters Display */}
        {hasSearchParams && isHero && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Active filters:</span>
            {location && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                <MapPin className="h-3 w-3" />
                {location}
                <button onClick={() => setLocation("")} className="hover:text-amber-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                <Car className="h-3 w-3" />
                {category}
                <button onClick={() => setCategory("")} className="hover:text-amber-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(pickupDate || returnDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                <Calendar className="h-3 w-3" />
                {pickupDate && new Date(pickupDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                {pickupDate && returnDate && " - "}
                {returnDate && new Date(returnDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                <button onClick={() => { setPickupDate(""); setReturnDate(""); }} className="hover:text-amber-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}