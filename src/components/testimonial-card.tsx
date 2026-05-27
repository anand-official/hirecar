"use client";

import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  rating: number;
  vehicleType?: string;
  variant?: "default" | "featured" | "compact";
}

export function TestimonialCard({ 
  quote, 
  author, 
  location, 
  rating, 
  vehicleType,
  variant = "default" 
}: TestimonialCardProps) {
  if (variant === "featured") {
    return (
      <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
        <Quote className="absolute top-6 right-6 h-10 w-10 text-amber-200" />
        
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-5 w-5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-lg text-slate-700 leading-relaxed mb-6">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold text-lg">
            {author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{author}</p>
            <p className="text-sm text-slate-500">{location}</p>
            {vehicleType && (
              <p className="text-xs text-amber-600 mt-0.5">Rented: {vehicleType}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
        {/* Rating */}
        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-sm text-slate-600 leading-relaxed mb-3">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
            {author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{author}</p>
            <p className="text-xs text-slate-500">{location}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 card-lift">
      {/* Rating */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-slate-700 leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">{author}</p>
          <p className="text-xs text-slate-500">{location}</p>
          {vehicleType && (
            <p className="text-xs text-amber-600">Rented: {vehicleType}</p>
          )}
        </div>
      </div>
    </div>
  );
}