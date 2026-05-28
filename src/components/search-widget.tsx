"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Car, Search, ChevronDown, X } from "lucide-react";
import { LocationAutocomplete } from "./LocationAutocomplete";

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
        ${isHero ? "glass rounded-[2rem] shadow-2xl p-6 md:p-8 border border-white/20" : ""}
        ${isCompact ? "bg-white rounded-2xl shadow-lg p-5 border border-slate-100" : ""}
        ${variant === "sidebar" ? "space-y-5" : ""}
      `}>
        {isHero && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-heading tracking-tight">Find your perfect rental</h2>
            <p className="text-sm font-medium text-slate-600 mt-1">Compare vehicles from verified local operators</p>
          </div>
        )}

        <div className={`
          ${variant !== "sidebar" ? "grid gap-4" : "space-y-4"}
          ${isHero ? "md:grid-cols-2 lg:grid-cols-4" : ""}
          ${isCompact ? "sm:grid-cols-2 lg:grid-cols-4" : ""}
        `}>
          {/* Location Input */}
          <div className="relative group">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
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
          <div className="relative group">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
              Pickup Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:text-primary transition-colors" />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border-2 border-transparent bg-slate-50/80 hover:bg-slate-100 pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Return Date */}
          <div className="relative group">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:text-primary transition-colors" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={pickupDate || new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border-2 border-transparent bg-slate-50/80 hover:bg-slate-100 pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Category Select */}
          <div className="relative group">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
              Vehicle Type
            </label>
            <div className="relative">
              <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:text-primary transition-colors" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-2 border-transparent bg-slate-50/80 hover:bg-slate-100 pl-11 pr-10 py-3.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Different Return Location Toggle */}
        {isHero && (
          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={() => setDifferentReturn(!differentReturn)}
              className={`
                flex items-center gap-2.5 text-sm font-bold transition-colors
                ${differentReturn ? "text-primary" : "text-slate-600 hover:text-slate-900"}
              `}
            >
              <div className={`
                w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all
                ${differentReturn ? "bg-primary border-primary shadow-sm" : "border-slate-300 bg-white"}
              `}>
                {differentReturn && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              Return to a different location
            </button>
          </div>
        )}

        {/* Search Button */}
        <div className={`${variant !== "sidebar" ? "mt-8" : "mt-6"}`}>
          <Link
            href={buildSearchUrl()}
            className={`
              flex items-center justify-center gap-2.5 rounded-xl font-bold text-primary-foreground
              bg-primary hover:bg-primary/90 hover:-translate-y-0.5
              shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
              transition-all duration-300
              ${isHero ? "w-full md:w-auto md:inline-flex px-10 py-4.5 text-lg" : ""}
              ${isCompact ? "w-full py-3.5 text-sm" : ""}
              ${variant === "sidebar" ? "w-full py-3.5 text-sm" : ""}
            `}
          >
            <Search className="h-5 w-5" />
            Show Vehicles
          </Link>
        </div>

        {/* Active Filters Display */}
        {hasSearchParams && isHero && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">Active filters:</span>
            {location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-lg shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                {location}
                <button onClick={() => setLocation("")} className="hover:text-primary/70 transition-colors ml-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-lg shadow-sm">
                <Car className="h-3.5 w-3.5" />
                {category}
                <button onClick={() => setCategory("")} className="hover:text-primary/70 transition-colors ml-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {(pickupDate || returnDate) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-lg shadow-sm">
                <Calendar className="h-3.5 w-3.5" />
                {pickupDate && new Date(pickupDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                {pickupDate && returnDate && " - "}
                {returnDate && new Date(returnDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                <button onClick={() => { setPickupDate(""); setReturnDate(""); }} className="hover:text-primary/70 transition-colors ml-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}