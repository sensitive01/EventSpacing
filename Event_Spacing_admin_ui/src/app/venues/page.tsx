"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Star,
  MapPin,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";
import { mockAdminVenuesCatalog as initialVenues } from "@/data/mockAdminData";
import { Venue } from "@/types/venue";

export default function AdminVenuesCatalogPage() {
  const [venues, setVenues] = useState(initialVenues);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const toggleVerified = (id: string) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isVerified: !v.isVerified } : v))
    );
  };

  const updateBadge = (id: string, badge: any) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, badge: badge === "none" ? undefined : badge } : v))
    );
  };

  const toggleSuspension = (id: string) => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: v.status === "live" ? "suspended" : "live" } : v
      )
    );
  };

  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || v.location.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">Catalog Governance</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Platform Venue Catalog</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Control verified checkmarks, assign homepage feature badges, or suspend listings for policy violations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3000/venues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-800 text-gold-300 text-xs font-semibold hover:bg-brand-900 transition-colors"
          >
            <span>Preview Customer Discovery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. Search & City Filters */}
      <div className="bg-[#14061d] rounded-2xl p-4 border border-brand-900/60 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative min-w-[300px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue name, locality, or vendor partner..."
            className="w-full pl-9 pr-3 py-2 bg-brand-950 border border-brand-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500"
          >
            <option value="all">All Serviceable Cities</option>
            <option value="bengaluru">Bengaluru</option>
          </select>
        </div>
      </div>

      {/* 3. Catalog Table */}
      <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/40">
                <th className="py-3 px-4">Venue Details</th>
                <th className="py-3 px-4">Vendor Partner</th>
                <th className="py-3 px-4">Tariff & Capacity</th>
                <th className="py-3 px-4 text-center">Verified Check</th>
                <th className="py-3 px-4">Marketplace Badge</th>
                <th className="py-3 px-4 text-center">Listing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/40 text-xs">
              {filteredVenues.map((v) => {
                const isLive = v.status === "live";

                return (
                  <tr key={v.id} className="hover:bg-brand-950/50 transition-colors">
                    {/* Venue info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-950 shrink-0">
                          <Image src={v.coverImage} alt={v.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{v.name}</span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gold-400" />
                            {v.location.locality}, {v.location.city}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Vendor Partner */}
                    <td className="py-4 px-4 text-gray-300">
                      <span className="font-semibold block">{v.vendorName}</span>
                      <span className="text-[10px] text-gray-500 font-mono">ID: {v.id}</span>
                    </td>

                    {/* Tariff & Capacity */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-gold-400 block">
                        ₹{v.pricing.pricePerDay.toLocaleString()} / day
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {v.capacity.minGuests}–{v.capacity.maxGuests} Guests
                      </span>
                    </td>

                    {/* Verified check toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleVerified(v.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          v.isVerified
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                        title="Click to toggle verified checkmark"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{v.isVerified ? "Verified" : "Unverified"}</span>
                      </button>
                    </td>

                    {/* Marketplace Feature Badge */}
                    <td className="py-4 px-4">
                      <select
                        value={v.badge || "none"}
                        onChange={(e) => updateBadge(v.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-brand-950 border border-brand-800 text-[11px] font-semibold text-gold-300 focus:outline-none focus:border-gold-500"
                      >
                        <option value="none">No Badge</option>
                        <option value="Popular">🔥 Popular</option>
                        <option value="Featured">⭐ Featured</option>
                        <option value="Premium">👑 Premium</option>
                        <option value="Budget Friendly">🏷️ Budget Friendly</option>
                        <option value="New">✨ New</option>
                      </select>
                    </td>

                    {/* Status toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleSuspension(v.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                          isLive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400"
                            : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-400"
                        }`}
                      >
                        {isLive ? "Live (Active)" : "Suspended"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
