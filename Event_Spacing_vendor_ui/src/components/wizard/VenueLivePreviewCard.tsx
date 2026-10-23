"use client";

/**
 * @file VenueLivePreviewCard.tsx
 * @description Renders a live, real-time preview card of the venue as seen by potential customers, used in Step 6.
 */

import React, { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Snowflake,
  Car,
  Wifi,
  UtensilsCrossed,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";
import { StarRating } from "@/components/common/StarRating";

/**
 * VenueLivePreviewCard component displays customer preview and post-submission lifecycle.
 *
 * @returns React JSX element
 */
export const VenueLivePreviewCard: React.FC = () => {
  const { state } = useVenueWizard();
  const { step1, step2, step3, step4, step5 } = state;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const photos =
    step5.photos.length > 0
      ? step5.photos.map((p) => p.url)
      : [
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
        ];

  const currentImageUrl = photos[activePhotoIndex % photos.length];

  /**
   * Advances photo carousel to the next slide.
   */
  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  /**
   * Rewinds photo carousel to the previous slide.
   */
  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const formattedPrice = new Intl.NumberFormat("en-IN").format(
    step4.startingPrice || 75000
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Preview Badge */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-brand-950 flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand-800" />
          <span>Venue Listing Preview</span>
        </h3>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Preview
        </span>
      </div>

      {/* 2. Interactive Venue Card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card">
        {/* Carousel Image */}
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden group">
          <Image
            src={currentImageUrl}
            alt={step1.venueName || "Venue Preview"}
            fill
            sizes="400px"
            className="object-cover transition-transform duration-300"
          />

          {/* Verification Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-900/90 text-gold-300 border border-gold-400/40 backdrop-blur-sm shadow-xs">
              Verified Venue (After Approval)
            </span>
          </div>

          {/* Wishlist Heart */}
          <div className="absolute top-3 right-3 z-10">
            <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Carousel Arrows */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <h4 className="font-serif text-base font-bold text-brand-950 line-clamp-1">
            {step1.venueName || "The Grand Celebration Hall"}
          </h4>

          {/* Rating & Pricing Row */}
          <div className="flex items-center justify-between">
            <StarRating rating={4.8} reviewCount={120} size="sm" />
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block -mb-1">From</span>
              <span className="font-serif text-sm font-bold text-brand-950">
                ₹{formattedPrice}
              </span>
              <span className="text-[10px] text-gray-500"> / Day</span>
            </div>
          </div>

          {/* Locality & Capacity */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-700" />
              {step2.city ? `${step2.city}` : "Bengaluru"}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3 h-3 text-gold-600" />
              {step3.totalCapacity || 500} People
            </span>
          </div>

          {/* Highlighted Amenities Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-gray-600">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Snowflake className="w-3 h-3 text-blue-500" /> AC Hall
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Car className="w-3 h-3 text-amber-500" /> Parking
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Wifi className="w-3 h-3 text-emerald-500" /> WiFi
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <UtensilsCrossed className="w-3 h-3 text-purple-500" /> Dining Area
            </span>
          </div>

          {/* Action Button Mockups */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              className="w-full bg-white text-brand-900 border border-brand-800 text-xs font-semibold py-2 rounded-xl"
            >
              View Details
            </button>
            <button
              type="button"
              className="w-full bg-brand-800 text-white text-xs font-semibold py-2 rounded-xl"
            >
              Send Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* 3. "After Submission" Verification Process Card */}
      <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-5 border border-brand-200/80 shadow-soft space-y-3">
        <h4 className="font-serif text-sm font-bold text-brand-950 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-800" />
          <span>After Submission</span>
        </h4>

        <ul className="space-y-2 text-xs text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Your listing will be reviewed by our team{" "}
              <strong>(within 24–48 hours)</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>You will receive an email and SMS notification after approval.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Once approved, your venue will be live on Event Spacing.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>You can manage your listing, availability, and bookings anytime.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
