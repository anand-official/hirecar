"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Lazily import SearchBox to prevent SSR crash — mapbox-gl uses `document` at module init
const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox as any),
  { ssr: false }
) as any;

interface LocationAutocompleteProps {
  onSelect: (location: any) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({ onSelect, placeholder = "City or airport", className }: LocationAutocompleteProps) {
  const [value, setValue] = useState("");

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  if (!MAPBOX_TOKEN) {
    // Fallback plain input when no token is configured
    return (
      <div className={`relative flex items-center w-full ${className}`}>
        <MapPin className="absolute left-3 z-10 h-5 w-5 text-amber-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSelect({ city: e.target.value });
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3 z-10 text-amber-500 pointer-events-none">
        <MapPin className="h-5 w-5" />
      </div>
      <div className="w-full [&>form>input]:pl-10 [&>form>input]:h-12 [&>form>input]:w-full [&>form>input]:rounded-lg [&>form>input]:border [&>form>input]:border-slate-200 [&>form>input]:bg-white [&>form>input]:px-3 [&>form>input]:py-2 [&>form>input]:text-sm focus-visible:[&>form>input]:outline-none focus-visible:[&>form>input]:ring-2 focus-visible:[&>form>input]:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50">
        <SearchBox
          accessToken={MAPBOX_TOKEN}
          options={{ country: "au", language: "en" }}
          value={value}
          onChange={(v: string) => setValue(v)}
          onRetrieve={(res: any) => onSelect(res)}
          placeholder={placeholder}
          theme={{
            variables: {
              fontFamily: "inherit",
              unit: "1rem",
              padding: "0",
              boxShadow: "none",
            },
          }}
        />
      </div>
    </div>
  );
}
