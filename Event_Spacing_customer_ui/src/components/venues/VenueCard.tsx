"use client";

/**
 * @file VenueCard.tsx
 * @description Standard responsive venue card used in Featured grids, Search Results, and Live Preview.
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Heart, ArrowRight } from "lucide-react";
import { Venue } from "@/types/venue";
import { Badge } from "@/components/common/Badge";
import { StarRating } from "@/components/common/StarRating";

interface VenueCardProps {
  venue: Venue;
  showEnquire?: boolean;
  className?: string;
  onEnquire?: (venue: Venue) => void;
  onToggleCompare?: (venue: Venue) => void;
  isCompared?: boolean;
}

/**
 * Reusable VenueCard component presenting high-resolution imagery, capacity, pricing, and action triggers.
 *
 * @param venue - The venue data entity
 * @param showEnquire - Whether to render secondary "Enquire" button alongside "View Details"
 * @param className - Optional CSS class overrides
 * @param onEnquire - Callback fired when clicking "Enquire"
 * @returns React JSX element
 */
export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  showEnquire = false,
  className = "",
  onEnquire,
  onToggleCompare,
  isCompared = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  /**
   * Formats Indian Rupee currency with commas.
   *
   * @param amount - Numeric price
   * @returns Formatted currency string
   */
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* 1. Image Header Area */}
      <div className="relative w-full h-52 sm:h-56 bg-gray-100 overflow-hidden">
        <Image
          src={venue.coverImage || venue.images[0]}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges & Wishlist Heart */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex flex-col gap-1 items-start">
            {venue.pricing?.hasFreeVenueOption && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex items-center gap-1 pointer-events-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping"></span>
                FREE VENUE (CATERING)
              </span>
            )}
            {venue.badge && (
              <Badge variant={venue.badge} className="pointer-events-auto shadow-xs" />
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare(venue);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                  isCompared
                    ? "bg-gold-500 text-brand-950 font-bold"
                    : "bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs"
                }`}
              >
                {isCompared ? "✓ Compared" : "+ Compare"}
              </button>
            )}

            {/* Wishlist Heart Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              aria-label="Save to wishlist"
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-sm active:scale-90"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? "fill-rose-500 text-rose-500" : "text-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Gradient Bottom Shadow on Image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* 2. Card Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-brand-800 transition-colors line-clamp-1">
              {venue.name}
            </h3>
            <StarRating rating={venue.rating} reviewCount={venue.reviewCount} />
          </div>

          {/* Locality */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">
              {venue.location.locality}, {venue.location.city}
            </span>
          </div>

          {/* Capacity Specification */}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-3 border border-gray-100">
            <Users className="w-3.5 h-3.5 text-gold-600" />
            <span className="font-medium">
              {venue.capacity.minGuests} – {venue.capacity.maxGuests} Guests
            </span>
          </div>
        </div>

        {/* 3. Pricing & Call to Actions */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-xs text-gray-500">
              {venue.pricing?.hasFreeVenueOption ? "Special Offer" : "From"}
            </div>
            <div className="text-right">
              {venue.pricing?.hasFreeVenueOption ? (
                <div>
                  <span className="font-serif text-base sm:text-lg font-bold text-emerald-700">
                    ₹0 Hall Rental
                  </span>
                  <span className="block text-[11px] text-gray-500 font-medium">
                    With food from ₹{venue.pricing.freeVenuePlateStartingPrice}/plate
                  </span>
                </div>
              ) : (
                <div>
                  <span className="font-serif text-base sm:text-lg font-bold text-brand-950">
                    ₹ {formatPrice(venue.pricing.pricePerDay)}
                  </span>
                  <span className="text-xs text-gray-500 font-medium"> / Day</span>
                </div>
              )}
            </div>
          </div>

          {/* Button Actions */}
          <div className={`grid gap-2 ${showEnquire ? "grid-cols-2" : "grid-cols-1"}`}>
            <Link
              href={`/venues`}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all text-center"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {showEnquire && (
              <button
                type="button"
                onClick={() => {
                  if (onEnquire) {
                    onEnquire(venue);
                  } else {
                    alert(`Enquiry request initiated for ${venue.name}`);
                  }
                }}
                className="w-full bg-white hover:bg-gray-50 text-brand-900 border border-brand-800 font-semibold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all text-center"
              >
                Enquire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
