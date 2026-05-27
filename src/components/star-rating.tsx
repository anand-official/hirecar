"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 20, 
  interactive = false,
  onRatingChange 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-0.5" role={interactive ? "group" : undefined} aria-label={`${rating} out of ${maxRating} stars`}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;

        if (!interactive) {
          return (
            <Star
              key={i}
              size={size}
              aria-hidden
              className={`${isFilled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
            />
          );
        }

        return (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
            className="cursor-pointer transition-transform hover:scale-125 focus:outline-none focus-visible:scale-125"
            style={{ width: size, height: size }}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRatingChange?.(starValue)}
          >
            <Star
              size={size}
              className={`${isFilled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
