"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, MapPin, Calendar, Car } from "lucide-react";
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

  if (isHero) {
    return (
      <div className={`${className} relative w-full max-w-5xl mx-auto`}>
        {/* Sleek Horizontal Pill Container */}
        <div className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[2.5rem] md:rounded-full p-2.5 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-100 border border-slate-100/50 backdrop-blur-2xl">
          
          {/* Location Segment */}
          <div className="flex-1 w-full flex flex-col justify-center px-6 py-3 md:py-0 hover:bg-slate-50/50 rounded-t-[2rem] md:rounded-l-full md:rounded-r-none transition-colors group">
            <label className="text-[11px] font-black tracking-widest text-slate-800 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
              Pickup Location
            </label>
            <LocationAutocomplete 
              onSelect={(res) => {
                if (res?.features?.[0]?.properties?.name) {
                  setLocation(res.features[0].properties.name);
                }
              }} 
              placeholder="City or airport"
              hideIcon={true}
              inputClassName="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-600 font-medium placeholder:text-slate-400 outline-none truncate"
            />
          </div>

          {/* Pickup Date Segment */}
          <div className="flex-[0.8] w-full flex flex-col justify-center px-6 py-3 md:py-0 hover:bg-slate-50/50 transition-colors">
            <label className="text-[11px] font-black tracking-widest text-slate-800 uppercase mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#ea580c]" />
              Pickup
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-600 font-medium outline-none appearance-none"
            />
          </div>

          {/* Return Date Segment */}
          <div className="flex-[0.8] w-full flex flex-col justify-center px-6 py-3 md:py-0 hover:bg-slate-50/50 transition-colors">
            <label className="text-[11px] font-black tracking-widest text-slate-800 uppercase mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#ea580c]" />
              Return
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || new Date().toISOString().split("T")[0]}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-600 font-medium outline-none appearance-none"
            />
          </div>

          {/* Vehicle Type Segment */}
          <div className="flex-[0.8] w-full flex flex-col justify-center px-6 py-3 md:py-0 hover:bg-slate-50/50 transition-colors relative">
            <label className="text-[11px] font-black tracking-widest text-slate-800 uppercase mb-1 flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-[#ea580c]" />
              Vehicle
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-600 font-medium outline-none pr-8 appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <div className="w-full md:w-auto p-2">
            <Link
              href={buildSearchUrl()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#ea580c] to-amber-500 hover:from-[#c2410c] hover:to-[#ea580c] text-white font-bold h-14 md:h-[68px] px-8 rounded-[1.5rem] md:rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              <Search className="h-5 w-5" strokeWidth={2.5} />
              <span className="md:hidden lg:inline">Search</span>
            </Link>
          </div>
        </div>

        {/* Small accessory link below removed for now */}
      </div>
    );
  }

  // Compact or Sidebar Variant
  return (
    <div className={`${className}`}>
      <div className={`
        ${isCompact ? "bg-white p-4 shadow-xl rounded-2xl flex flex-col sm:flex-row gap-4 items-center" : ""}
        ${variant === "sidebar" ? "bg-white p-6 shadow-xl rounded-2xl flex flex-col gap-4" : ""}
      `}>
        <div className="flex-1 w-full bg-slate-50 relative px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary transition-colors">
          <label className="block text-xs font-bold text-slate-500 mb-1">
            WHERE
          </label>
          <LocationAutocomplete 
            onSelect={(res) => {
              if (res?.features?.[0]?.properties?.name) {
                setLocation(res.features[0].properties.name);
              }
            }} 
            placeholder={location || "City or airport"} 
            hideIcon={true}
            inputClassName="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="flex-1 w-full bg-slate-50 relative px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary transition-colors">
          <label className="block text-xs font-bold text-slate-500 mb-1">
            PICKUP
          </label>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-900 font-medium outline-none"
          />
        </div>

        <div className="flex-1 w-full bg-slate-50 relative px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary transition-colors">
          <label className="block text-xs font-bold text-slate-500 mb-1">
            RETURN
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-900 font-medium outline-none"
          />
        </div>

        <Link
          href={buildSearchUrl()}
          className="flex items-center justify-center bg-[#ea580c] hover:bg-[#c2410c] text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all w-full md:w-auto"
        >
          {variant === "sidebar" ? "Search" : <Search className="h-5 w-5" />}
        </Link>
      </div>
    </div>
  );
}