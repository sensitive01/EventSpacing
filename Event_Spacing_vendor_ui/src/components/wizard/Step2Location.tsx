"use client";

/**
 * @file Step2Location.tsx
 * @description Step 2 form in the venue wizard managing address, city, map pin coordinates, and direct contacts.
 */

import React, { useState } from "react";
import { MapPin, ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";

/**
 * Step 2: Location & Contact Information component matching Screen 4.
 *
 * @returns React JSX element
 */
export const Step2Location: React.FC = () => {
  const { state, updateStep2, nextStep, prevStep } = useVenueWizard();
  const { step2 } = state;

  const [isPickingLocation, setIsPickingLocation] = useState(false);

  /**
   * Submits Step 2 after validating mandatory address and phone contact.
   *
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step2.addressLine1.trim()) {
      alert("Please enter Address Line 1");
      return;
    }
    if (!step2.primaryContactName.trim()) {
      alert("Please enter primary contact person name");
      return;
    }
    if (!step2.phoneNumber.trim()) {
      alert("Please enter a valid phone number");
      return;
    }
    nextStep();
  };

  /**
   * Simulates map coordinate pinpointing on click.
   */
  const handleMapClick = () => {
    setIsPickingLocation(true);
    setTimeout(() => {
      setIsPickingLocation(false);
      alert("Location pinned successfully! GPS Coordinates saved.");
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
          Step 2 of 6
        </span>
        <h2 className="font-serif text-2xl font-bold text-brand-950">
          Location & Contact Information
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Help customers find and contact your venue easily.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Venue Address */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-brand-950">
            Venue Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Address Line 1 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Building name, street, area"
                value={step2.addressLine1}
                onChange={(e) => updateStep2({ addressLine1: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Address Line 2
              </label>
              <input
                type="text"
                placeholder="(Optional) Landmark, nearby area"
                value={step2.addressLine2}
                onChange={(e) => updateStep2({ addressLine2: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                value={step2.city}
                onChange={(e) => updateStep2({ city: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 bg-white"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={step2.state}
                onChange={(e) => updateStep2({ state: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 bg-white"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Telangana">Telangana</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Pincode <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter pincode"
                value={step2.pincode}
                onChange={(e) => updateStep2({ pincode: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          {/* Interactive Map Picker Simulation */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-300 bg-gray-100 h-44 flex items-center justify-center">
            {/* Map styling grid graphic */}
            <div className="absolute inset-0 bg-[#e5e3df] bg-[radial-gradient(#c8c5be_1px,transparent_1px)] [background-size:16px_16px] opacity-80" />

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                Bengaluru, Karnataka (Lat: 12.9784, Lng: 77.6408)
              </span>
              <button
                type="button"
                onClick={handleMapClick}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-800 text-white text-xs font-semibold hover:bg-brand-900 shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isPickingLocation ? "Pinning..." : "Pick Location on Map"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="font-serif text-base font-bold text-brand-950">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Primary Contact Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter contact person name"
                value={step2.primaryContactName}
                onChange={(e) =>
                  updateStep2({ primaryContactName: e.target.value })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-brand-700">
                <span className="bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-600 border-r border-gray-200">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Enter mobile number"
                  value={step2.phoneNumber}
                  onChange={(e) =>
                    updateStep2({ phoneNumber: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={step2.emailAddress}
                onChange={(e) =>
                  updateStep2({ emailAddress: e.target.value })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Alternate Contact Number
              </label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-brand-700">
                <span className="bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-600 border-r border-gray-200">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Enter alternate number"
                  value={step2.alternateContactNumber || ""}
                  onChange={(e) =>
                    updateStep2({ alternateContactNumber: e.target.value })
                  }
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Website (Optional)
              </label>
              <input
                type="url"
                placeholder="https://www.yourwebsite.com"
                value={step2.website || ""}
                onChange={(e) => updateStep2({ website: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          {/* Privacy Toggle */}
          <label className="flex items-start gap-2.5 pt-2 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={step2.showContactOnListing}
              onChange={(e) =>
                updateStep2({ showContactOnListing: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-800 accent-brand-800 mt-0.5"
            />
            <span>
              <strong>Show contact details on listing page</strong> (Customers will be able to contact you directly).
            </span>
          </label>
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
