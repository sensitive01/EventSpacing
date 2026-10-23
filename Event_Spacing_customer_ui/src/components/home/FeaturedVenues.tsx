"use client";

/**
 * @file FeaturedVenues.tsx
 * @description Curated featured venues section on the marketplace homepage.
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MOCK_VENUES } from "@/data/mockVenues";
import { VenueCard } from "@/components/venues/VenueCard";

/**
 * FeaturedVenues section highlighting top handpicked venues for weddings, corporate, and parties.
 *
 * @returns React JSX element
 */
export const FeaturedVenues: React.FC = () => {
  // Show first 4 featured venues
  const featuredList = MOCK_VENUES.slice(0, 4);

  return (
    <section className="py-14 sm:py-18 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header with "View All" Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>FEATURED VENUES</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-950 tracking-tight">
              Top Venues for Your Next Event
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1.5">
              Explore handpicked venues for weddings, corporate meetings, parties and more.
            </p>
          </div>

          <Link
            href="/venues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-800 text-brand-850 hover:bg-brand-900 hover:text-white font-semibold text-xs sm:text-sm transition-all duration-200 self-start sm:self-auto shadow-sm"
          >
            <span>View All Venues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredList.map((venue) => (
            <VenueCard key={venue.id} venue={venue} showEnquire={false} />
          ))}
        </div>
      </div>
    </section>
  );
};
