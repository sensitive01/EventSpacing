/**
 * @file StarRating.tsx
 * @description Star rating indicator with review count for venue cards and testimonials.
 */

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

/**
 * StarRating component displays a numerical rating with filled star icons and review tally.
 *
 * @param rating - Rating value (e.g., 4.8)
 * @param reviewCount - Total count of reviews (e.g., 320)
 * @param size - Star size token ('sm' | 'md' | 'lg')
 * @param showCount - Whether to display count in parentheses
 * @param className - Optional container styling
 * @returns React JSX element
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-semibold",
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Star className={`${iconSizes[size]} fill-amber-400 text-amber-500`} />
      <span className={`font-semibold text-gray-900 ${textSizes[size]}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className={`text-gray-500 ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
