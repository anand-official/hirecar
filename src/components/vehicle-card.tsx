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
      <article className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{vehicle.title}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="truncate">{vehicle.vendorName}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {vehicle.seats}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" />
              {vehicle.fuel}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold text-slate-900">${vehicle.pricePerDayAud}</span>
              <span className="text-xs text-slate-500">/day</span>
            </div>
            <Link
              href={`/cars/${vehicle.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200">
        {/* Image */}
        <div className="relative h-56 overflow-hidden img-zoom">
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.title} available from ${vehicle.vendorName}`}
            fill
            priority={priority}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Featured Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-full">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-4 left-4">
            <p className="text-3xl font-bold text-white">${vehicle.pricePerDayAud}</p>
            <p className="text-sm text-white/80">AUD/day</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{vehicle.title}</h3>
          
          <Link
            href={`/vendors/${vehicle.vendorSlug}`}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            {vehicle.vendorName}
            {vehicle.verified && (
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
            )}
          </Link>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            {features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Location & Branch */}
          <div className="flex items-center gap-1 text-sm text-slate-500 mb-6">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span>{vehicle.city}</span>
            <span className="text-slate-300">|</span>
            <span>{vehicle.branchName}</span>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Link
              href={`/cars/${vehicle.slug}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              View details
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Phone className="h-4 w-4" />
              Contact
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm card-lift">
      {/* Image */}
      <div className="relative h-52 overflow-hidden img-zoom">
        <Image
          src={vehicle.imageUrl}
          alt={`${vehicle.title} available from ${vehicle.vendorName}`}
          fill
          priority={priority}
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
          <p className="text-lg font-bold text-slate-900">${vehicle.pricePerDayAud}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">AUD/day</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Vendor */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1">
            {vehicle.title}
          </h3>
          <Link
            href={`/vendors/${vehicle.vendorSlug}`}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-amber-600 transition-colors"
          >
            {vehicle.vendorName}
            {vehicle.verified && (
              <BadgeCheck className="h-4 w-4 text-emerald-500" aria-label="Verified vendor" />
            )}
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded"
            >
              {index === 0 && <Gauge className="h-3 w-3" />}
              {index === 1 && <Users className="h-3 w-3" />}
              {index === 2 && <Fuel className="h-3 w-3" />}
              {feature}
            </span>
          ))}
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="truncate">{vehicle.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{vehicle.seats} seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{vehicle.year}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/cars/${vehicle.slug}`}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 hover:text-slate-950 transition-colors"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}