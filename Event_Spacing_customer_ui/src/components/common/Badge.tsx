/**
 * @file Badge.tsx
 * @description Renders color-coded status pills matching the design (Popular, Featured, Budget Friendly, New, Premium).
 */

import React from "react";

export type BadgeVariant =
  | "Popular"
  | "Featured"
  | "Budget Friendly"
  | "New"
  | "Premium"
  | "Verified"
  | "Free Venue Plan";

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

/**
 * Returns specific Tailwind color classes mapped to badge variant.
 *
 * @param variant - Badge variant name
 * @returns CSS class string
 */
function getBadgeStyles(variant: BadgeVariant): string {
  switch (variant) {
    case "Popular":
      return "bg-amber-500/90 text-white border-amber-600";
    case "Featured":
      return "bg-purple-700/95 text-white border-purple-800";
    case "Budget Friendly":
      return "bg-emerald-600/90 text-white border-emerald-700";
    case "New":
      return "bg-teal-600/90 text-white border-teal-700";
    case "Premium":
      return "bg-gold-500 text-white border-gold-600";
    case "Verified":
      return "bg-blue-600 text-white border-blue-700";
    case "Free Venue Plan":
      return "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-800";
    default:
      return "bg-gray-800 text-white border-gray-900";
  }
}

/**
 * Status Badge Component.
 *
 * @param variant - Badge variant style
 * @param className - Optional CSS classes
 * @returns JSX element
 */
export const Badge: React.FC<BadgeProps> = ({ variant, className = "" }) => {
  const styles = getBadgeStyles(variant);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm backdrop-blur-sm border ${styles} ${className}`}
    >
      {variant === "Popular" && <span className="mr-1">🔥</span>}
      {variant === "Featured" && <span className="mr-1">✨</span>}
      {variant === "Premium" && <span className="mr-1">👑</span>}
      {variant}
    </span>
  );
};
