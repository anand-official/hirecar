"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PromoCardProps {
  title: string;
  subtitle: string;
  description?: string;
  ctaText: string;
  ctaHref: string;
  bgImage?: string;
  bgColor?: string;
  variant?: "large" | "medium" | "small";
  discount?: string;
}

export function PromoCard({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  bgImage,
  bgColor = "bg-gradient-to-br from-slate-900 to-slate-800",
  variant = "medium",
  discount,
}: PromoCardProps) {
  const heightClass = variant === "large" ? "min-h-[400px]" : variant === "medium" ? "min-h-[280px]" : "min-h-[200px]";
  const paddingClass = variant === "large" ? "p-8 md:p-12" : variant === "medium" ? "p-6 md:p-8" : "p-5";
  const titleSize = variant === "large" ? "text-3xl md:text-4xl" : variant === "medium" ? "text-2xl md:text-3xl" : "text-xl";

  return (
    <div className={`
      relative overflow-hidden rounded-2xl ${heightClass} ${paddingClass}
      group card-lift
      ${!bgImage ? bgColor : ""}
    `}>
      {/* Background Image */}
      {bgImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-end">
        {/* Discount Badge */}
        {discount && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 text-sm font-bold rounded-full">
              {discount}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className={`${titleSize} font-bold text-white mb-2`}>
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-lg text-white/90 font-medium mb-2">
          {subtitle}
        </p>

        {/* Description */}
        {description && (
          <p className="text-sm text-white/70 mb-6 max-w-md">
            {description}
          </p>
        )}

        {/* CTA */}
        <Link
          href={ctaHref}
          className={`
            inline-flex items-center gap-2 font-semibold text-white
            hover:gap-3 transition-all duration-200
            ${variant === "large" ? "text-base mt-4" : "text-sm mt-3"}
          `}
        >
          {ctaText}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}