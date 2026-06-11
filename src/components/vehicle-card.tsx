"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, BadgeCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavedVehicleButton } from "@/components/saved-vehicle-button";
import type { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
  variant?: "default" | "compact" | "featured";
  saved?: boolean;
}

export function VehicleCard({ vehicle, priority = false, variant = "default", saved = false }: VehicleCardProps) {
  if (variant === "compact") {
    return (
      <Card variant="interactive" className="flex-row p-0 gap-0 card-lift border-slate-200/60 shadow-sm overflow-hidden bg-white/95">
        <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-none bg-slate-100">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            sizes="112px"
            className="object-cover"
          />
        </div>
        <CardContent className="flex-1 min-w-0 py-3 px-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground truncate text-base flex items-center gap-1.5">
              {vehicle.title}
              {vehicle.instantBook && <span title="Instant Book"><Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /></span>}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info">{vehicle.category}</Badge>
              <span className="text-sm text-muted-foreground truncate">{vehicle.vendorName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-extrabold text-foreground">${vehicle.pricePerDayAud}<span className="text-xs font-medium text-muted-foreground">/day</span></span>
            <Link
              href={`/cars/${vehicle.slug}`}
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card variant="interactive" className="p-0 gap-0 card-lift border-slate-200/60 shadow-md overflow-hidden bg-white/95 group/card">
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover/card:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-950/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm border border-white/10">
              Featured
            </span>
            <SavedVehicleButton vehicleId={vehicle.id} initialSaved={saved} />
          </div>
          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white/50">
            <p className="text-lg font-black text-slate-900">${vehicle.pricePerDayAud}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">AUD/day</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
        </div>
        <CardContent className="p-5 flex flex-col gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground line-clamp-1 flex items-center gap-1.5">
              {vehicle.title}
              {vehicle.instantBook && <span title="Instant Book"><Zap className="h-4 w-4 text-amber-500 fill-amber-500" /></span>}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="info">{vehicle.category}</Badge>
              <span className="text-sm text-muted-foreground">{vehicle.vendorName}</span>
              {vehicle.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.city}, {vehicle.state}</span>
          </div>
          <Link
            href={`/cars/${vehicle.slug}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors mt-1"
          >
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Default variant (Clean Marketplace Design)
  return (
    <Link href={`/cars/${vehicle.slug}`} className="block group">
      <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden hover:shadow-lg hover:border-[#ea580c]/30 transition-all duration-300">
        {/* Vehicle Image */}
        <div className="relative h-[200px] bg-slate-50 overflow-hidden">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Year Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-1 rounded">
            {vehicle.year || "2023"}
          </div>
          <div className="absolute top-3 right-3 z-10">
            <SavedVehicleButton vehicleId={vehicle.id} initialSaved={saved} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{vehicle.title}</h3>
              <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
                {vehicle.city}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline text-[#ea580c]">
                <span className="font-black text-xl">${vehicle.pricePerDayAud}</span>
                <span className="text-xs font-bold ml-1">/day</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-sm font-bold text-slate-700">
            {vehicle.vendorName}
            {vehicle.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
          </div>
        </div>
      </div>
    </Link>
  );
}
