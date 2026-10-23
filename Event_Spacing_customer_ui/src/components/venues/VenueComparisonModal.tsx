"use client";

import React from "react";
import Image from "next/image";
import { X, Check, Minus, Sparkles, Building2, Users, IndianRupee, MapPin } from "lucide-react";
import { Venue } from "@/types/venue";

interface VenueComparisonModalProps {
  venues: Venue[];
  onClose: () => void;
  onRemoveVenue: (venueId: string) => void;
  onEnquire: (venue: Venue) => void;
}

export const VenueComparisonModal: React.FC<VenueComparisonModalProps> = ({
  venues,
  onClose,
  onRemoveVenue,
  onEnquire,
}) => {
  if (venues.length === 0) return null;

  const comparisonAttributes = [
    {
      name: "Daily Rental Price",
      render: (v: Venue) => (
        <div>
          <span className="font-bold text-sm sm:text-base text-brand-950">
            ₹{v.pricing.pricePerDay.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 block">per day</span>
        </div>
      ),
    },
    {
      name: "FREE VENUE Option",
      render: (v: Venue) =>
        v.pricing.hasFreeVenueOption ? (
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <span className="font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> ₹0 Hall Rental
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">
              Min {v.pricing.freeVenueMinGuests} pax @ ₹{v.pricing.freeVenuePlateStartingPrice}/plate
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Standard Rental Only</span>
        ),
    },
    {
      name: "Guest Capacity",
      render: (v: Venue) => (
        <span className="font-semibold text-xs text-gray-800">
          {v.capacity.seatingCapacity} Seated / {v.capacity.maxGuests} Max
        </span>
      ),
    },
    {
      name: "Sub-Halls / Spaces",
      render: (v: Venue) => (
        <span className="text-xs text-gray-700">
          {v.spaces && v.spaces.length > 0
            ? v.spaces.map((s) => s.name).join(", ")
            : `${v.capacity.hallCount} Hall(s)`}
        </span>
      ),
    },
    {
      name: "Location",
      render: (v: Venue) => (
        <span className="text-xs text-gray-600">
          {v.location.locality}, {v.location.city}
        </span>
      ),
    },
    {
      name: "Air Conditioning",
      render: (v: Venue) =>
        v.amenities.some((a) => a.toLowerCase().includes("ac")) ? (
          <span className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1">
            <Check className="w-4 h-4" /> Central AC
          </span>
        ) : (
          <span className="text-gray-400 text-xs flex items-center justify-center gap-1">
            <Minus className="w-4 h-4" /> Non-AC
          </span>
        ),
    },
    {
      name: "Valet Parking",
      render: (v: Venue) =>
        v.amenities.some((a) => a.toLowerCase().includes("parking")) ? (
          <span className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1">
            <Check className="w-4 h-4" /> Yes
          </span>
        ) : (
          <span className="text-gray-400 text-xs flex items-center justify-center gap-1">
            <Minus className="w-4 h-4" /> No
          </span>
        ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-6 border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Side-by-Side Analysis</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-950">Compare Venues</h2>
            <p className="text-xs text-gray-500">
              Comparing {venues.length} venue(s) on capacities, packages, and amenities
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left w-1/4 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 rounded-l-2xl">
                  Properties
                </th>
                {venues.map((venue) => (
                  <th key={venue.id} className="p-3 align-top min-w-[220px]">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/90 p-3 space-y-2.5">
                      <button
                        onClick={() => onRemoveVenue(venue.id)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-200">
                        <Image
                          src={venue.coverImage || venue.images[0]}
                          alt={venue.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="text-left">
                        <h4 className="font-serif font-bold text-sm text-brand-950 truncate">
                          {venue.name}
                        </h4>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-brand-800 shrink-0" />
                          {venue.location.locality}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onEnquire(venue);
                        }}
                        className="w-full py-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs transition-colors"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {comparisonAttributes.map((attr, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="p-3 text-left font-bold text-gray-700 bg-gray-50/40">{attr.name}</td>
                  {venues.map((venue) => (
                    <td key={venue.id} className="p-3 align-middle">
                      {attr.render(venue)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
