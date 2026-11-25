"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { VenueCard } from "@/components/venues/VenueCard";

export default function WishlistPage() {
  const { savedVenues, isLoading, count } = useWishlist();

  return (
    <div className="min-h-screen bg-[#fbf9fc] pb-20">
      {/* 1. Hero Header */}
      <div className="bg-brand-950 text-white py-12 px-4 sm:px-8 border-b border-brand-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Your Shortlist</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Saved Venues
            </h1>
            <p className="text-xs sm:text-sm text-white/75 max-w-xl">
              Compare your favorite banquet halls, wedding palaces, and event spaces in one place.
            </p>
          </div>

          <div className="text-xs font-semibold text-gold-300 bg-white/10 px-4 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
            {count} {count === 1 ? "Venue" : "Venues"} Saved
          </div>
        </div>
      </div>

      {/* 2. Saved Venues Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#380c48]" />
            <span className="text-xs font-medium">Loading your saved venues...</span>
          </div>
        ) : savedVenues.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-12 text-center max-w-lg mx-auto space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              No Saved Venues Yet
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Tap the heart icon on any venue card to bookmark your favorite spaces and compare them anytime.
            </p>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#380c48] hover:bg-[#521369] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Explore Venues</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
