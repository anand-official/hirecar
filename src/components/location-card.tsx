"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Car, ArrowRight } from "lucide-react";

interface LocationCardProps {
  name: string;
  imageUrl: string;
  vehicleCount: number;
  startingPrice: number;
  href: string;
}

export function LocationCard({ name, imageUrl, vehicleCount, startingPrice, href }: LocationCardProps) {
  return (
    <Link 
      href={href}
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 card-lift"
    >
      {/* Image Container */}
      <div className="relative h-40 overflow-hidden img-zoom">
        <Image
          src={imageUrl}
          alt={`Car rentals in ${name}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Location Name Overlay */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-white" />
          <span className="font-semibold text-white">{name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Car className="h-4 w-4 text-amber-500" />
              <span>{vehicleCount} vehicles available</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              From <span className="text-amber-600 font-bold">${startingPrice}</span>/day
            </p>
          </div>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}