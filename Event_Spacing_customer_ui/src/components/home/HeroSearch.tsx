"use client";

/**
 * @file HeroSearch.tsx
 * @description Hero banner section featuring grand event backdrop and multi-parameter search filter widget.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  IndianRupee,
  Search,
  Sparkles,
} from "lucide-react";

/**
 * Hero search banner with dynamic inputs and quick popular search tags.
 *
 * @returns React JSX element
 */
export const HeroSearch: React.FC = () => {
  const router = useRouter();

  // Search filter local states
  const [eventType, setEventType] = useState("Wedding");
  const [location, setLocation] = useState("Bengaluru");
  const [date, setDate] = useState("2026-12-12");
  const [guests, setGuests] = useState("100");
  const [budget, setBudget] = useState("50000-200000");

  const popularSearches = [
    "Wedding Halls",
    "Banquet Halls",
    "Conference Rooms",
    "Party Halls",
    "Lawns & Resorts",
    "Board Rooms",
  ];

  /**
   * Handles search form submission and navigates to the /venues page with query parameters.
   *
   * @param e - Form submit event
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      type: eventType,
      city: location,
      date: date,
      guests: guests,
      budget: budget,
    }).toString();
    router.push(`/venues?${query}`);
  };

  /**
   * Handles clicking on popular search tag chip.
   *
   * @param chipText - Name of the tag clicked
   */
  const handleChipClick = (chipText: string) => {
    router.push(`/venues?query=${encodeURIComponent(chipText)}`);
  };

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Hero Image with Dark Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=85')`,
        }}
      >
        {/* Multilayer gradient for optimal contrast and royal glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/85 via-brand-900/75 to-brand-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center w-full">
        {/* Catchphrase Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/30 text-gold-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4 shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>FIND • PLAN • BOOK • CELEBRATE</span>
        </div>

        {/* Main H1 Title */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-normal">
          Perfect Spaces for <br className="hidden sm:inline" />
          <span className="text-gold-400 font-serif">
            Every Occasion
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/90 font-normal mb-10 leading-relaxed">
          From dream weddings to board meetings, find and book the best event spaces
          and services — all in one place.
        </p>

        {/* Multi-Parameter Search Widget Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/20 text-gray-800 text-left">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center"
          >
            {/* 1. Event Type */}
            <div className="flex flex-col px-3 py-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-200/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                Event Type
              </span>
              <select
                aria-label="Event Type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="bg-transparent text-sm font-semibold text-brand-950 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="Wedding">Wedding</option>
                <option value="Corporate Events">Corporate Event</option>
                <option value="Birthday Parties">Birthday Party</option>
                <option value="Get Together">Get Together</option>
                <option value="Presentations">Presentation</option>
                <option value="Social Events">Social Event</option>
              </select>
            </div>

            {/* 2. Location */}
            <div className="flex flex-col px-3 py-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-200/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold-500" /> Location
              </span>
              <select
                aria-label="Location City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-sm font-semibold text-brand-950 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Whitefield">Whitefield, Blr</option>
                <option value="Indiranagar">Indiranagar, Blr</option>
                <option value="Koramangala">Koramangala, Blr</option>
                <option value="Electronic City">Electronic City</option>
              </select>
            </div>

            {/* 3. Date Picker */}
            <div className="flex flex-col px-3 py-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-200/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-gold-500" /> Date
              </span>
              <input
                aria-label="Event Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-brand-950 focus:outline-none cursor-pointer mt-0.5"
              />
            </div>

            {/* 4. Guests Selector */}
            <div className="flex flex-col px-3 py-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-200/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-gold-500" /> Guests
              </span>
              <select
                aria-label="Number of Guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent text-sm font-semibold text-brand-950 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="50">Up to 50</option>
                <option value="100">100 Guests</option>
                <option value="250">100 - 250</option>
                <option value="500">250 - 500</option>
                <option value="1000">500 - 1000+</option>
              </select>
            </div>

            {/* 5. Budget Range */}
            <div className="flex flex-col px-3 py-2 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-200/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-gold-500" /> Budget
              </span>
              <select
                aria-label="Budget Range"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-transparent text-xs font-semibold text-brand-950 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="0-50000">₹0 - ₹50,000</option>
                <option value="50000-200000">₹50,000 - ₹2,00,000</option>
                <option value="200000-500000">₹2,00,000 - ₹5,00,000</option>
                <option value="500000-plus">₹5,00,000+</option>
              </select>
            </div>

            {/* 6. Search Venues Submit Button */}
            <div className="sm:col-span-2 lg:col-span-1 h-full flex items-center">
              <button
                type="submit"
                className="w-full h-full min-h-[50px] bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Search className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">Search Venues</span>
              </button>
            </div>
          </form>
        </div>

        {/* Popular Searches Quick Chips */}
        <div className="mt-5 flex items-center justify-center flex-wrap gap-2 text-xs text-white/90">
          <span className="font-semibold text-gold-300">Popular Searches:</span>
          {popularSearches.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white text-xs transition-all duration-150 backdrop-blur-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
