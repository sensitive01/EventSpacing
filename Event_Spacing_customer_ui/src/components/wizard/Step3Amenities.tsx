"use client";

/**
 * @file Step3Amenities.tsx
 * @description Step 3 form in the venue wizard configuring facility checkboxes, guest capacities, and space counters.
 */

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Snowflake,
  Car,
  Wifi,
  Zap,
  DoorOpen,
  Layers,
  Volume2,
  Monitor,
  Gem,
  UtensilsCrossed,
  Sun,
  ArrowUpDown,
  Accessibility,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";

/**
 * Step 3: Amenities & Facilities component matching Screen 5.
 *
 * @returns React JSX element
 */
export const Step3Amenities: React.FC = () => {
  const { state, updateStep3, nextStep, prevStep } = useVenueWizard();
  const { step3 } = state;

  const amenityCards = [
    { name: "AC Hall", icon: <Snowflake className="w-4 h-4 text-blue-500" /> },
    { name: "Parking", icon: <Car className="w-4 h-4 text-amber-500" /> },
    { name: "WiFi", icon: <Wifi className="w-4 h-4 text-emerald-500" /> },
    { name: "Power Backup", icon: <Zap className="w-4 h-4 text-yellow-500" /> },
    { name: "Changing Rooms", icon: <DoorOpen className="w-4 h-4 text-purple-500" /> },
    { name: "Stage", icon: <Layers className="w-4 h-4 text-pink-500" /> },
    { name: "Sound System", icon: <Volume2 className="w-4 h-4 text-indigo-500" /> },
    { name: "Projector / AV Setup", icon: <Monitor className="w-4 h-4 text-cyan-500" /> },
    { name: "Bridal Room", icon: <Gem className="w-4 h-4 text-rose-500" /> },
    { name: "Dining Area", icon: <UtensilsCrossed className="w-4 h-4 text-orange-500" /> },
    { name: "Outdoor Space", icon: <Sun className="w-4 h-4 text-emerald-500" /> },
    { name: "Elevator", icon: <ArrowUpDown className="w-4 h-4 text-blue-500" /> },
    { name: "Wheelchair Access", icon: <Accessibility className="w-4 h-4 text-teal-500" /> },
    { name: "CCTV Security", icon: <ShieldCheck className="w-4 h-4 text-slate-600" /> },
    { name: "Valet Parking", icon: <KeyRound className="w-4 h-4 text-gold-600" /> },
  ];

  /**
   * Toggles an amenity in state.
   *
   * @param amenityName - Title of amenity
   */
  const handleToggleAmenity = (amenityName: string) => {
    const exists = step3.selectedAmenities.includes(amenityName);
    const updated = exists
      ? step3.selectedAmenities.filter((a) => a !== amenityName)
      : [...step3.selectedAmenities, amenityName];
    updateStep3({ selectedAmenities: updated });
  };

  /**
   * Validates capacity inputs before continuing.
   *
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step3.totalCapacity || step3.totalCapacity <= 0) {
      alert("Please specify a valid total guest capacity");
      return;
    }
    nextStep();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
          Step 3 of 6
        </span>
        <h2 className="font-serif text-2xl font-bold text-brand-950">
          Amenities & Facilities
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Select the amenities and facilities available at your venue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Interactive Venue Amenities Grid */}
        <div>
          <h3 className="font-serif text-base font-bold text-brand-950 mb-3">
            Venue Amenities
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {amenityCards.map((item) => {
              const isChecked = step3.selectedAmenities.includes(item.name);
              return (
                <label
                  key={item.name}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-brand-50/70 border-brand-700 text-brand-950 font-semibold shadow-2xs"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleAmenity(item.name)}
                    className="w-4 h-4 rounded text-brand-800 accent-brand-800"
                  />
                  <div className="flex items-center gap-1.5 line-clamp-1">
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 2: Capacity & Space Details */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="font-serif text-base font-bold text-brand-950">
            Capacity & Space Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Total Capacity (People) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 500"
                value={step3.totalCapacity || ""}
                onChange={(e) =>
                  updateStep3({ totalCapacity: Number(e.target.value) })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Seating Capacity (People) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 350"
                value={step3.seatingCapacity || ""}
                onChange={(e) =>
                  updateStep3({ seatingCapacity: Number(e.target.value) })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Floating Capacity (People)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 500"
                value={step3.floatingCapacity || ""}
                onChange={(e) =>
                  updateStep3({ floatingCapacity: Number(e.target.value) })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Number of Halls / Rooms
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 2"
                value={step3.numberOfHalls || ""}
                onChange={(e) =>
                  updateStep3({ numberOfHalls: Number(e.target.value) })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Other Facilities (Optional) */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-800">
              Other Facilities (Optional)
            </label>
            <span className="text-[11px] text-gray-400">
              {step3.otherFacilities.length} / 500
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Mention any other facilities or special features (e.g., lawn area, swimming pool, in-house catering, generator backup, etc.)"
            value={step3.otherFacilities}
            onChange={(e) =>
              updateStep3({ otherFacilities: e.target.value })
            }
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
          />
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-6 flex items-center justify-between border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
