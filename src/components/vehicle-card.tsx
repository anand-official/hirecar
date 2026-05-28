"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Fuel, MapPin, Users, Gauge, Calendar, ArrowRight, Phone, Star } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
  variant?: "default" | "compact" | "featured";
}

export function VehicleCard({ vehicle, priority = false, variant = "default" }: VehicleCardProps) {
  // Generate feature badges based on vehicle specs
  const features = [
    vehicle.transmission,
    `${vehicle.seats} seats`,
    vehicle.fuel,
  ];

  if (variant === "compact") {
    return (
      <article className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-bold text-slate-900 truncate text-lg group-hover:text-primary transition-colors">{vehicle.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <span className="truncate font-medium">{vehicle.vendorName}</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
              <Users className="h-4 w-4 text-slate-400" />
              {vehicle.seats}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
              <Fuel className="h-4 w-4 text-slate-400" />
              {vehicle.fuel}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">${vehicle.pricePerDayAud}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase">/day</span>
            </div>
            <Link
              href={`/cars/${vehicle.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View deal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl ring-1 ring-white/10">
        {/* Image */}
        <div className="relative h-72 overflow-hidden">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Featured Badge */}
          <div className="absolute top-5 left-5">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-full shadow-lg">
              <Star className="h-3.5 w-3.5 fill-current" />
              Featured Partner
            </span>
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-6 right-6 text-right">
            <p className="text-4xl font-black text-white tracking-tight drop-shadow-md">${vehicle.pricePerDayAud}</p>
            <p className="text-sm font-bold text-white/70 uppercase tracking-wider">AUD/day</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 -mt-12">
          <div className="bg-white rounded-3xl p-6 shadow-xl ring-1 ring-slate-100 relative z-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading tracking-tight group-hover:text-primary transition-colors">{vehicle.title}</h3>
            
            <Link
              href={`/vendors/${vehicle.vendorSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors mb-5"
            >
              {vehicle.vendorName}
              {vehicle.verified && (
                <BadgeCheck className="h-4.5 w-4.5 text-primary" />
              )}
            </Link>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-100"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Location & Branch */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{vehicle.city}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="truncate">{vehicle.branchName}</span>
            </div>

            {/* CTAs */}
            <div className="flex gap-4">
              <Link
                href={`/cars/${vehicle.slug}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
              >
                View details
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all">
                <Phone className="h-4.5 w-4.5" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-slate-200/60 shadow-sm card-lift flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={vehicle.imageUrl}
          alt={`${vehicle.title} available from ${vehicle.vendorName}`}
          fill
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg ring-1 ring-black/5">
          <p className="text-lg font-black text-slate-900 tracking-tight">${vehicle.pricePerDayAud}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">AUD/day</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title & Vendor */}
        <div className="mb-5">
          <h3 className="font-bold text-slate-900 text-xl mb-1.5 line-clamp-1 font-heading group-hover:text-primary transition-colors">
            {vehicle.title}
          </h3>
          <Link
            href={`/vendors/${vehicle.vendorSlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
          >
            {vehicle.vendorName}
            {vehicle.verified && (
              <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified vendor" />
            )}
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {features.map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10"
            >
              {index === 0 && <Gauge className="h-3.5 w-3.5" />}
              {index === 1 && <Users className="h-3.5 w-3.5" />}
              {index === 2 && <Fuel className="h-3.5 w-3.5" />}
              {feature}
            </span>
          ))}
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-sm font-medium mt-auto">
          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{vehicle.city}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <Users className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{vehicle.seats}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{vehicle.year}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/cars/${vehicle.slug}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          View deal
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    </article>
  );
}