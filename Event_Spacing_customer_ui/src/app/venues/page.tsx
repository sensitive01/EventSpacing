"use client";

/**
 * @file venues/page.tsx
 * @description Venue Discovery and Search Results page (Screen 2) featuring faceted filters, sorting, view toggles, and enquiry modals.
 */

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
  ChevronLeft,
  X,
  Send,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { Venue, VenueFilterState } from "@/types/venue";
import { MOCK_VENUES } from "@/data/mockVenues";
import { EVENT_CATEGORIES } from "@/data/mockCategories";
import { FilterSidebar } from "@/components/venues/FilterSidebar";
import { SortHeader } from "@/components/venues/SortHeader";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueComparisonModal } from "@/components/venues/VenueComparisonModal";


/**
 * Inner venues content component reading query parameters.
 *
 * @returns React JSX element
 */
function VenuesExploreContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  // Category pill active state
  const [activeCategory, setActiveCategory] = useState(
    typeParam?.toLowerCase() === "corporate" ? "Corporate Events" : "All Events"
  );

  // Sync active category when URL query param changes
  useEffect(() => {
    if (typeParam?.toLowerCase() === "corporate") {
      setActiveCategory("Corporate Events");
    } else if (!typeParam) {
      setActiveCategory("All Events");
    }
  }, [typeParam]);

  // Filter State
  const [filters, setFilters] = useState<VenueFilterState>({
    searchQuery: "",
    selectedCity: "Bengaluru",
    selectedLocalities: ["Bengaluru"],
    selectedEventTypes: [],
    capacityRange: "any",
    maxPrice: 500000,
    selectedAmenities: [],
    sortBy: "recommended",
    viewMode: "grid",
  });

  // Modal enquiry state
  const [enquiringVenue, setEnquiringVenue] = useState<Venue | null>(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Mobile filters drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Venue Comparison state (up to 3 venues)
  const [comparedVenues, setComparedVenues] = useState<Venue[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (venue: Venue) => {
    setComparedVenues((prev) => {
      const exists = prev.some((v) => v.id === venue.id);
      if (exists) {
        return prev.filter((v) => v.id !== venue.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 venues at a time.");
        return prev;
      }
      return [...prev, venue];
    });
  };

  /**
   * Updates partial filter values.
   *
   * @param partial - Partial filter properties to merge
   */
  const handleFilterChange = (partial: Partial<VenueFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  /**
   * Resets all filters back to default.
   */
  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedCity: "Bengaluru",
      selectedLocalities: ["Bengaluru"],
      selectedEventTypes: [],
      capacityRange: "any",
      maxPrice: 500000,
      selectedAmenities: [],
      sortBy: "recommended",
      viewMode: "grid",
    });
    setActiveCategory("All Events");
  };

  /**
   * Handles search query submission.
   *
   * @param e - Form submit event
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  /**
   * Applies client-side filtering and sorting to the mock venues dataset.
   */
  const filteredVenues = useMemo(() => {
    let list = [...MOCK_VENUES];

    // 1. Category pill filter
    if (activeCategory === "FREE Venues") {
      list = list.filter((v) => v.pricing.hasFreeVenueOption === true);
    } else if (activeCategory !== "All Events") {
      list = list.filter((v) =>
        v.eventTypes.some((et) =>
          et.toLowerCase().includes(activeCategory.toLowerCase())
        )
      );
    }

    // 2. Keyword query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.location.locality.toLowerCase().includes(q) ||
          v.shortDescription.toLowerCase().includes(q)
      );
    }

    // 3. Localities
    if (
      filters.selectedLocalities.length > 0 &&
      !filters.selectedLocalities.includes("Bengaluru")
    ) {
      list = list.filter((v) =>
        filters.selectedLocalities.includes(v.location.locality)
      );
    }

    // 4. Event types
    if (filters.selectedEventTypes.length > 0) {
      list = list.filter((v) =>
        v.eventTypes.some((et) => filters.selectedEventTypes.includes(et))
      );
    }

    // 5. Price limit
    list = list.filter((v) => v.pricing.pricePerDay <= filters.maxPrice);

    // 6. Amenities
    if (filters.selectedAmenities.length > 0) {
      list = list.filter((v) =>
        filters.selectedAmenities.every((amenity) =>
          v.amenities.includes(amenity)
        )
      );
    }

    // 7. Capacity Range
    if (filters.capacityRange !== "any") {
      list = list.filter((v) => {
        if (filters.capacityRange === "upto_50") return v.capacity.maxGuests <= 50;
        if (filters.capacityRange === "51_100")
          return v.capacity.maxGuests >= 51 && v.capacity.minGuests <= 100;
        if (filters.capacityRange === "101_300")
          return v.capacity.maxGuests >= 101 && v.capacity.minGuests <= 300;
        if (filters.capacityRange === "301_500")
          return v.capacity.maxGuests >= 301 && v.capacity.minGuests <= 500;
        if (filters.capacityRange === "500_plus")
          return v.capacity.maxGuests >= 500;
        return true;
      });
    }

    // 8. Sorting
    if (filters.sortBy === "price_low_high") {
      list.sort((a, b) => a.pricing.pricePerDay - b.pricing.pricePerDay);
    } else if (filters.sortBy === "price_high_low") {
      list.sort((a, b) => b.pricing.pricePerDay - a.pricing.pricePerDay);
    } else if (filters.sortBy === "rating_high_low") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [filters, activeCategory]);

  return (
    <div className="w-full bg-[#faf7fb] min-h-screen pb-20">
      {/* 1. Header Banner with Breadcrumbs and Luxury Backdrop */}
      <div className="relative bg-brand-950 text-white py-12 px-4 sm:px-8 border-b border-brand-850 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-white/70 mb-3">
            <Link href="/" className="hover:text-gold-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <Link href="/venues" className="hover:text-gold-400 transition-colors">
              Venues
            </Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-gold-400 font-medium">Explore Events</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-widest text-gold-300 block mb-1">
            EXPLORE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Event Venues
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-xl">
            Find and book the perfect space for your special occasion.
          </p>
        </div>
      </div>

      {/* 2. Top Category Pills Ribbon */}
      <div className="bg-white border-b border-gray-200 sticky top-[69px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 sm:gap-3">
          {/* All Events Button */}
          <button
            onClick={() => setActiveCategory("All Events")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === "All Events"
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Events</span>
          </button>

          {/* Special Client Feature: FREE VENUES (with Catering Plans) */}
          <button
            onClick={() =>
              setActiveCategory(activeCategory === "FREE Venues" ? "All Events" : "FREE Venues")
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === "FREE Venues"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md ring-2 ring-emerald-400"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
            <span>FREE VENUES (Catering Included)</span>
          </button>

          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.name
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Discovery Workspace (Faceted Sidebar + Results Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Faceted Filters (Desktop Only - 3.5 cols on lg) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onApply={() => {}}
            />
          </div>

          {/* Right Results Grid (Full width on mobile, 8.5 cols on lg) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Mobile Filter Toggle & Quick Summary Bar */}
            <div className="lg:hidden flex items-center justify-between gap-3 mb-4 bg-white p-3 rounded-2xl border border-gray-200/90 shadow-xs">
              <div className="text-xs font-bold text-gray-800">
                <span className="text-[#380c48] font-extrabold text-sm">{filteredVenues.length}</span> Venues Available
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#380c48] hover:bg-[#2b0837] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-gold-400" />
                <span>Filters</span>
              </button>
            </div>
            <SortHeader
              filters={filters}
              totalCount={filteredVenues.length}
              onFilterChange={handleFilterChange}
              onSearchSubmit={handleSearchSubmit}
            />

            {/* Results Grid / List */}
            {filteredVenues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
                <Sparkles className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-gray-800">
                  No venues found matching your criteria
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting or resetting your filters to discover available spaces across Bengaluru.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-brand-800 text-white font-semibold text-xs mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  filters.viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    showEnquire={true}
                    onEnquire={(v) => {
                      setEnquiringVenue(v);
                      setEnquirySuccess(false);
                    }}
                    onToggleCompare={handleToggleCompare}
                    isCompared={comparedVenues.some((cv) => cv.id === venue.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls matching Screen 2 */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                aria-label="Previous Page"
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3, 4, 5].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                    currentPage === pageNum
                      ? "bg-brand-900 text-white shadow-sm"
                      : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <span className="px-2 text-gray-400 text-xs">...</span>

              <button
                type="button"
                onClick={() => setCurrentPage(125)}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs"
              >
                125
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="Next Page"
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full overflow-y-auto p-5 shadow-2xl z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#380c48]" />
                  <h3 className="font-serif text-base font-bold text-gray-900">Filter Venues</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                onApply={() => setIsMobileFilterOpen(false)}
              />
            </div>

            <div className="pt-4 border-t border-gray-100 mt-6 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#380c48] hover:bg-[#2b0837] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Show {filteredVenues.length} Venues</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {enquiringVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setEnquiringVenue(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Close Enquiry Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-brand-950">
                  Enquiry Sent to {enquiringVenue.name}!
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  The venue manager has received your request and will contact you directly within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setEnquiringVenue(null)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-brand-800 text-white font-semibold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-950 mb-1">
                  Enquire with {enquiringVenue.name}
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  Get quotes, check availability, or schedule a free venue walkthrough.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEnquirySuccess(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Estimated Guests
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Submit Enquiry</span>
                    <Send className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Comparison Dock Bar */}
      {comparedVenues.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1b0724] text-white px-5 py-3 rounded-2xl shadow-2xl border border-gold-500/50 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-500 text-brand-950 font-bold text-xs flex items-center justify-center">
              {comparedVenues.length}
            </span>
            <span className="text-xs font-semibold text-gray-200">
              {comparedVenues.length === 1 ? "1 venue selected" : `${comparedVenues.length} venues selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-brand-950 font-bold text-xs shadow-md hover:from-gold-600 hover:to-amber-500 transition-all"
            >
              Compare Now
            </button>
            <button
              onClick={() => setComparedVenues([])}
              className="px-2.5 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <VenueComparisonModal
          venues={comparedVenues}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveVenue={(id) => setComparedVenues((prev) => prev.filter((v) => v.id !== id))}
          onEnquire={(v) => {
            setEnquiringVenue(v);
            setEnquirySuccess(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Venues discovery page component matching Screen 2.
 * Wrapped in Suspense boundary for Next.js App Router query parameter compatibility.
 *
 * @returns React JSX element
 */
export default function VenuesExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf9fc] flex items-center justify-center py-20 text-brand-900 font-medium">
          Loading venues...
        </div>
      }
    >
      <VenuesExploreContent />
    </Suspense>
  );
}
