"use client";

/**
 * @file FeaturedVenues.tsx
 * @description Curated featured venues section on the marketplace homepage connecting directly to backend API.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";
import { VenueCard } from "@/components/venues/VenueCard";
import { Venue } from "@/types/venue";
import { api } from "@/lib/api";

/**
 * FeaturedVenues section highlighting top handpicked venues for weddings, corporate, and parties.
 *
 * @returns React JSX element
 */
export const FeaturedVenues: React.FC = () => {
  const [featuredList, setFeaturedList] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadFeatured = async () => {
      try {
        const res = await api.venues.getFeatured();
        if (!isCancelled && res?.data && Array.isArray(res.data)) {
          const mapped = res.data.map((v: any) => ({
            ...v,
            id: v.id || v._id,
          }));
          setFeaturedList(mapped.slice(0, 4));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Featured venues backend fetch error:", err);
      }

      if (!isCancelled) {
        setFeaturedList([]);
        setIsLoading(false);
      }
    };

    loadFeatured();

    return () => {
      isCancelled = true;
    };
  }, []);

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
              Explore verified venues for weddings, corporate meetings, parties, and celebrations.
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

        {/* 4-Card Responsive Grid or Clean Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-4 animate-pulse shadow-soft"
              >
                <div className="h-44 bg-gray-200 rounded-xl w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : featuredList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-soft space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-200 text-gold-700 flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8 text-gold-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-950">
                New Verified Venues Joining Soon
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Are you a banquet hall, lawn, or convention resort owner? List your property on Event Spacing to showcase it to event planners across Bengaluru.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="http://localhost:3001/venues/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <span>List Your Venue on Partner Hub</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredList.map((venue) => (
              <VenueCard key={venue.id} venue={venue} showEnquire={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
