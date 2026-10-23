"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { vendorVenuesList } from "@/data/mockVendorData";

export default function VendorVenuesPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "under_review" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVenues = vendorVenuesList.filter((venue) => {
    const matchesFilter = filterStatus === "all" || venue.status === filterStatus;
    const matchesQuery =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.locality.toLowerCase().includes(searchQuery.toLowerCase());
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
          <span>List Another Venue</span>
        </Link>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Venues", count: vendorVenuesList.length },
            {
              id: "live",
              label: "Live & Approved",
              count: vendorVenuesList.filter((v) => v.status === "live").length,
            },
            {
              id: "under_review",
              label: "Under Review",
              count: vendorVenuesList.filter((v) => v.status === "under_review").length,
            },
            {
              id: "draft",
              label: "Drafts",
              count: vendorVenuesList.filter((v) => v.status === "draft").length,
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

      {/* 3. Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((venue) => {
          const isLive = venue.status === "live";
          const isUnderReview = venue.status === "under_review";

          return (
            <div
              key={venue.id}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-soft overflow-hidden flex flex-col hover:shadow-card transition-shadow"
            >
              {/* Photo & Badges */}
              <div className="relative h-48 w-full bg-gray-100">
                <Image
                  src={venue.coverImage}
                  alt={venue.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {isLive && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live & Verified
                    </span>
                  )}
                  {isUnderReview && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Under Review
                    </span>
                  )}
                  {venue.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-400 text-brand-950">
                      {venue.badge}
                    </span>
                  )}
                </div>

                {/* Bottom Photo Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-gold-400" />
                    <span>{venue.location.locality}, {venue.location.city}</span>
                  </div>
                  {isLive && (
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs text-xs font-semibold">
                      <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                      <span>{venue.rating}</span>
                      <span className="text-gray-300">({venue.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-gray-900 leading-snug">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {venue.shortDescription}
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Capacity</span>
                    <span className="font-semibold text-gray-800">
                      {venue.capacity.minGuests}–{venue.capacity.maxGuests} Guests
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Daily Tariff</span>
                    <span className="font-semibold text-brand-900">
                      ₹{venue.pricing.pricePerDay.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Review Warning if under review */}
                {isUnderReview && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    <strong>Admin Verification Queue:</strong> Submitted for document audit. No changes can be made until review completes.
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
    </div>
  );
}
