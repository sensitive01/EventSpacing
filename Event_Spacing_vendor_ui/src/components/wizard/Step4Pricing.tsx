"use client";

/**
 * @file Step4Pricing.tsx
 * @description Step 4 form managing base pricing, deposits, dynamic event-wise package rates table, and policies.
 */

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileText,
  BadgeDollarSign,
  Sparkles,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";
import { EventPricingRow } from "@/types/wizard";

/**
 * Step 4: Pricing & Availability component matching Step 4 screenshot.
 *
 * @returns React JSX element
 */
export const Step4Pricing: React.FC = () => {
  const { state, updateStep4, nextStep, prevStep } = useVenueWizard();
  const { step4 } = state;

  /**
   * Updates an individual cell within the event-wise pricing table.
   *
   * @param id - Row ID
   * @param field - Key to update
   * @param value - New value
   */
  const handleEventPricingChange = (
    id: string,
    field: keyof EventPricingRow,
    value: string | number
  ) => {
    const updated = step4.eventWisePricing.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          [field]: typeof value === "string" ? Number(value) || value : value,
        };
      }
      return row;
    });
    updateStep4({ eventWisePricing: updated });
  };

  /**
   * Appends a new blank event pricing row.
   */
  const handleAddRow = () => {
    const newRow: EventPricingRow = {
      id: `p-${Date.now()}`,
      eventType: "Anniversary / Social",
      fullDayPrice: 40000,
      halfDayPrice: 25000,
      perHourPrice: 7000,
    };
    updateStep4({ eventWisePricing: [...step4.eventWisePricing, newRow] });
  };

  /**
   * Removes an event pricing row by ID.
   *
   * @param id - Row ID to remove
   */
  const handleDeleteRow = (id: string) => {
    const updated = step4.eventWisePricing.filter((row) => row.id !== id);
    updateStep4({ eventWisePricing: updated });
  };

  /**
   * Submits Step 4 after checking minimum starting price.
   *
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step4.startingPrice || step4.startingPrice <= 0) {
      alert("Please enter a valid starting price");
      return;
    }
    nextStep();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
          Step 4 of 6
        </span>
        <h2 className="font-serif text-2xl font-bold text-brand-950">
          Pricing & Availability
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Set your venue pricing, packages and availability calendar.
        </p>
      </div>

      {/* Sub-tabs Bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => updateStep4({ activeTab: "pricing_packages" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step4.activeTab === "pricing_packages"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <BadgeDollarSign className="w-3.5 h-3.5" />
          <span>Pricing & Packages</span>
        </button>

        <button
          type="button"
          onClick={() => updateStep4({ activeTab: "availability_calendar" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step4.activeTab === "availability_calendar"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Availability Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => updateStep4({ activeTab: "time_slots" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step4.activeTab === "time_slots"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Time Slots</span>
        </button>

        <button
          type="button"
          onClick={() => updateStep4({ activeTab: "cancellation_policy" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step4.activeTab === "cancellation_policy"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Cancellation Policy</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Base Pricing */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-brand-950">
            Base Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Pricing Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={step4.pricingType}
                onChange={(e) =>
                  updateStep4({
                    pricingType: e.target.value as typeof step4.pricingType,
                  })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 bg-white"
              >
                <option value="Per Day">Per Day</option>
                <option value="Per Hour">Per Hour</option>
                <option value="Per Event">Per Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Starting Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="25000"
                value={step4.startingPrice || ""}
                onChange={(e) =>
                  updateStep4({ startingPrice: Number(e.target.value) })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                placeholder="10000"
                value={step4.securityDeposit || ""}
                onChange={(e) =>
                  updateStep4({ securityDeposit: Number(e.target.value) })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Advance Payment (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="30"
                value={step4.advancePaymentPercentage || ""}
                onChange={(e) =>
                  updateStep4({
                    advancePaymentPercentage: Number(e.target.value),
                  })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Client PRD Feature: FREE VENUES with Catering Package Engine */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                <Sparkles className="w-3 h-3 text-gold-300" />
                <span>HIGH CONVERSION PACKAGE ENGINE</span>
              </div>
              <h3 className="font-serif text-base font-bold text-emerald-950">
                Offer &ldquo;FREE VENUE RENTAL&rdquo; on Catering Plans
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-xl">
                Waive the venue rental fee when customers book your in-house banquet catering. Featured under the popular &quot;FREE VENUES&quot; filter tab on the marketplace.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={step4.hasFreeVenueCateringOption || false}
                onChange={(e) =>
                  updateStep4({ hasFreeVenueCateringOption: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {step4.hasFreeVenueCateringOption && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-200/60 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  Minimum Guests for Free Hall Rental *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={step4.freeVenueMinGuests || 200}
                  onChange={(e) =>
                    updateStep4({ freeVenueMinGuests: Number(e.target.value) })
                  }
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-700 bg-white"
                />
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  Hall charge is ₹0 for bookings meeting this guest count.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  Starting Catering Rate per Plate (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 950"
                  value={step4.freeVenuePlateStartingPrice || 950}
                  onChange={(e) =>
                    updateStep4({
                      freeVenuePlateStartingPrice: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-700 bg-white"
                />
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  Includes 3-4 course menu + welcome drinks.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Event-wise Pricing (Optional) */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-serif text-base font-bold text-brand-950">
              Event-wise Pricing (Optional)
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-brand-800 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              Set different prices for different event types. Leave blank if same for all.
            </span>
          </div>

          {/* Pricing Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Full Day Price (₹)</th>
                  <th className="py-3 px-4">Half Day Price (₹)</th>
                  <th className="py-3 px-4">Per Hour Price (₹)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {step4.eventWisePricing.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      <input
                        type="text"
                        value={row.eventType}
                        onChange={(e) =>
                          handleEventPricingChange(row.id, "eventType", e.target.value)
                        }
                        className="bg-transparent border-b border-gray-200 focus:border-brand-700 focus:outline-none py-1 font-semibold text-gray-900 w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={row.fullDayPrice || ""}
                        onChange={(e) =>
                          handleEventPricingChange(
                            row.id,
                            "fullDayPrice",
                            e.target.value
                          )
                        }
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-brand-700"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={row.halfDayPrice || ""}
                        onChange={(e) =>
                          handleEventPricingChange(
                            row.id,
                            "halfDayPrice",
                            e.target.value
                          )
                        }
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-brand-700"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={row.perHourPrice || ""}
                        onChange={(e) =>
                          handleEventPricingChange(
                            row.id,
                            "perHourPrice",
                            e.target.value
                          )
                        }
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-brand-700"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete pricing row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-800 hover:text-brand-950 px-4 py-2 rounded-xl border border-dashed border-brand-300 hover:border-brand-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Another Event Type</span>
          </button>
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
