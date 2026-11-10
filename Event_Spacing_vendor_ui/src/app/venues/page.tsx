"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Building2,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  Clock,
  Edit,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";

export default function VendorVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "under_review" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVenues = async () => {
      try {
        const res = await api.vendor.getVenues();
        if (isMounted) {
          if (res?.data && Array.isArray(res.data)) {
            setVenues(res.data);
          } else {
            setVenues([]);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Could not fetch vendor venues:", err);
        if (isMounted) {
          setVenues([]);
          setIsLoading(false);
        }
      }
    };

    fetchVenues();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVenues = venues.filter((venue) => {
    const status = venue.status || "live";
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    const matchesQuery =
      (venue.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (venue.location?.locality || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Property Portfolio</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Manage Your Venues</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Monitor listing health, update pricing, block slots, and verify compliance status.
          </p>
        </div>

        <Link
          href="/venues/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>{venues.length === 0 ? "List Your First Venue" : "List Another Venue"}</span>
        </Link>
      </div>

      {/* 2. Filter Bar (Shown if user has venues or is searching) */}
      {venues.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Venues", count: venues.length },
              {
                id: "live",
                label: "Live & Approved",
                count: venues.filter((v) => (v.status || "live") === "live").length,
              },
              {
                id: "under_review",
                label: "Under Review",
                count: venues.filter((v) => v.status === "under_review").length,
              },
              {
                id: "draft",
                label: "Drafts",
                count: venues.filter((v) => v.status === "draft").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  filterStatus === tab.id
                    ? "bg-brand-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterStatus === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venue name, locality..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-800 focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-soft animate-pulse space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-100 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : venues.length === 0 ? (
        /* Empty State for Newly Registered Vendor */
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-soft p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-gold-100 to-amber-50 border border-gold-200 text-brand-900 flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-10 h-10 text-gold-600" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 border border-gold-200 text-[11px] font-bold text-brand-950 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Partner Onboarding</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              No Venues Listed Yet
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Welcome to the Event Spacing Partner Hub! You haven&apos;t added any venues to your account yet. Complete our quick 6-step listing wizard to make your banquet, hall, or resort visible to thousands of event planners.
            </p>
          </div>

          {/* Quick value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
            <div className="p-4 rounded-2xl bg-[#faf7fb] border border-brand-50">
              <span className="text-brand-900 font-bold text-sm block">1. List for Free</span>
              <p className="text-[11px] text-gray-500 mt-1">Zero upfront fees. Only 10% platform fee when bookings confirm.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf7fb] border border-brand-50">
              <span className="text-brand-900 font-bold text-sm block">2. Verified Inquiries</span>
              <p className="text-[11px] text-gray-500 mt-1">Receive direct calls & WhatsApp leads with customer dates and budgets.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf7fb] border border-brand-50">
              <span className="text-brand-900 font-bold text-sm block">3. Fast Payouts</span>
              <p className="text-[11px] text-gray-500 mt-1">Automated NEFT disbursements deposited directly to your bank account.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/venues/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-bold text-sm shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-brand-950" />
              <span>List Your First Venue Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      ) : filteredVenues.length === 0 ? (
        /* Filter/Search yields no results */
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-soft">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-gray-700">No venues match your criteria</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting the status filter or clearing your search term.</p>
          <button
            onClick={() => {
              setFilterStatus("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Render Venue Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
            const isLive = venue.status === "live";
            const isUnderReview = venue.status === "under_review";

            return (
              <div
                key={venue.id || venue._id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-soft overflow-hidden flex flex-col hover:shadow-card transition-shadow"
              >
                {/* Photo & Badges */}
                <div className="relative h-48 w-full bg-gray-100">
                  <Image
                    src={venue.coverImage || venue.images?.[0] || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"}
                    alt={venue.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isLive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Live &amp; Verified</span>
                        </span>
                      ) : isUnderReview ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3" />
                          <span>Under Review</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-600 text-white shadow-sm">
                          Draft
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-400 text-brand-950 shadow-sm">
                        {venue.badge || "Featured"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-gold-300" />
                      <span>{venue.location?.locality || venue.location?.city || "Bengaluru"}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md font-semibold">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                      <span>{venue.rating || 4.8} ({venue.reviewCount || 0})</span>
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-gray-900 leading-snug">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {venue.shortDescription || "Premier celebration venue hosted on Event Spacing."}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Capacity</span>
                      <span className="font-semibold text-gray-800">
                        {venue.capacity?.minGuests || 100}–{venue.capacity?.maxGuests || 800} Guests
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Daily Tariff</span>
                      <span className="font-semibold text-brand-900">
                        ₹{(venue.pricing?.pricePerDay || 120000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Review Warning if under review */}
                  {isUnderReview && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <strong>Admin Verification Queue:</strong> Submitted for floor plan &amp; document audit.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/venues/new`}
                      className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </Link>

                    <Link
                      href={`/calendar`}
                      className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Open calendar for this venue"
                    >
                      <Calendar className="w-4 h-4 text-brand-800" />
                    </Link>

                    {isLive && (
                      <a
                        href={`http://localhost:3000/venues`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-brand-50 text-brand-900 hover:bg-brand-100 transition-colors"
                        title="Preview on Customer Site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}