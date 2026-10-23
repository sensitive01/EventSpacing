"use client";

/**
 * @file Step1BasicInfo.tsx
 * @description Step 1 form in the venue registration wizard collecting name, business identity, category classification, and descriptions.
 */

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";

/**
 * Step 1: Basic Information component matching Screen 3.
 *
 * @returns React JSX element
 */
export const Step1BasicInfo: React.FC = () => {
  const { state, updateStep1, nextStep } = useVenueWizard();
  const { step1 } = state;

  const venueTypes = [
    "Banquet Hall",
    "Resort / Lawn",
    "Convention Centre",
    "Hotel / Ballroom",
    "Rooftop Venue",
    "Auditorium",
    "Conference Room",
    "Villa / Farmhouse",
  ];

  const categories = [
    "Wedding",
    "Corporate Events",
    "Birthday Parties",
    "Get Together",
    "Presentations",
    "Social Events",
    "Anniversary",
    "Others",
  ];

  /**
   * Toggles category selection in Step 1.
   *
   * @param category - Name of the event category
   */
  const handleCategoryToggle = (category: string) => {
    const exists = step1.eventCategories.includes(category);
    const updated = exists
      ? step1.eventCategories.filter((c) => c !== category)
      : [...step1.eventCategories, category];
    updateStep1({ eventCategories: updated });
  };

  /**
   * Validates required inputs before proceeding to Step 2.
   *
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1.venueName.trim()) {
      alert("Please enter a venue name");
      return;
    }
    if (step1.eventCategories.length === 0) {
      alert("Please select at least one event category");
      return;
    }
    nextStep();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
          Step 1 of 6
        </span>
        <h2 className="font-serif text-2xl font-bold text-brand-950">
          Basic Information
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Tell us about your venue. This information will be displayed to customers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Venue Name & Business Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Venue Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter your venue name"
              value={step1.venueName}
              onChange={(e) => updateStep1({ venueName: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter business name (if different)"
              value={step1.businessName}
              onChange={(e) => updateStep1({ businessName: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
            />
          </div>
        </div>

        {/* Row 2: Venue Type */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            Venue Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={step1.venueType}
            onChange={(e) => updateStep1({ venueType: e.target.value })}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 bg-white cursor-pointer"
          >
            <option value="">Select venue type</option>
            {venueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3: Event Categories (Checkbox Grid) */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            Event Categories <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const isChecked = step1.eventCategories.includes(cat);
              return (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-brand-50 border-brand-700 text-brand-950 font-semibold"
                      : "bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 rounded text-brand-800 accent-brand-800"
                  />
                  <span className="line-clamp-1">{cat}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Row 4: Short Description (with 300 char counter) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-800">
              Short Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400">
              {step1.shortDescription.length} / 300
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={300}
            required
            placeholder="Write a short description about your venue (e.g. capacity, unique features, location highlights)"
            value={step1.shortDescription}
            onChange={(e) => updateStep1({ shortDescription: e.target.value })}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
          />
        </div>

        {/* Row 5: Detailed Description (with 1000 char counter) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-800">
              Detailed Description
            </label>
            <span className="text-[11px] text-gray-400">
              {step1.detailedDescription.length} / 1000
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Write detailed information about your venue, perfect for customers to know more..."
            value={step1.detailedDescription}
            onChange={(e) =>
              updateStep1({ detailedDescription: e.target.value })
            }
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
          />
        </div>

        {/* Tip Banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-50 border border-brand-200/80 text-xs text-brand-900">
          <Sparkles className="w-4 h-4 text-gold-500 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Provide clear and accurate information to attract more inquiries and bookings.
          </span>
        </div>

        {/* Next Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
