"use client";

/**
 * @file StepperHeader.tsx
 * @description Top progress tracker and hero banner for the 6-step venue onboarding funnel.
 */

import React from "react";
import { Check, Store, MapPin, Sparkles, Calendar, Image as ImageIcon, Send } from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";

/**
 * StepperHeader component displaying the top banner benefits and interactive 6-step progress indicator.
 *
 * @returns React JSX element
 */
export const StepperHeader: React.FC = () => {
  const { state, goToStep } = useVenueWizard();
  const { currentStep, completedSteps } = state;

  const steps = [
    { number: 1, label: "Basic Information", sub: "Venue details", icon: <Store className="w-4 h-4" /> },
    { number: 2, label: "Location & Contact", sub: "Address and contact info", icon: <MapPin className="w-4 h-4" /> },
    { number: 3, label: "Amenities & Facilities", sub: "Features and services", icon: <Sparkles className="w-4 h-4" /> },
    { number: 4, label: "Pricing & Availability", sub: "Rates and calendars", icon: <Calendar className="w-4 h-4" /> },
    { number: 5, label: "Photos & Media", sub: "Upload photos and videos", icon: <ImageIcon className="w-4 h-4" /> },
    { number: 6, label: "Review & Submit", sub: "Check and publish", icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-brand-950 text-white border-b border-brand-900">
      {/* Vendor Portal Direct Link Announcement */}
      <div className="bg-[#1b0724] border-b border-brand-800/80 px-4 py-2 text-xs text-gray-300">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-400 shrink-0"></span>
            <span>Venue Host or Banquet Manager? Manage your calendar, pricing & customer leads directly on the dedicated portal.</span>
          </div>
          <a
            href="http://localhost:3001"
            className="text-gold-400 hover:text-gold-300 font-bold underline flex items-center gap-1 shrink-0"
          >
            Launch Vendor Hub (Port 3001) &rarr;
          </a>
        </div>
      </div>

      {/* Top Value Banner */}
      <div className="relative py-8 sm:py-10 px-4 sm:px-8 overflow-hidden">
        {/* Subtle royal background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/70 via-brand-950 to-brand-950" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Title */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              List Your <span className="text-gold-400">Venue</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Reach thousands of customers and grow your venue business with Event Spacing.
            </p>
          </div>

          {/* Right Value Proposition Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">
                👑
              </div>
              <div>
                <div className="text-xs font-bold text-white">Get More Bookings</div>
                <div className="text-[10px] text-white/60">Increase venue visibility</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                🛡️
              </div>
              <div>
                <div className="text-xs font-bold text-white">Trusted Platform</div>
                <div className="text-[10px] text-white/60">Verified enquiries</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                🎧
              </div>
              <div>
                <div className="text-xs font-bold text-white">Dedicated Support</div>
                <div className="text-[10px] text-white/60">Concierge assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 6-Step Stepper Bar */}
      <div className="bg-brand-900/90 border-t border-white/10 py-4 px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[780px]">
          {steps.map((step, idx) => {
            const isCurrent = currentStep === step.number;
            const isCompleted = completedSteps.includes(step.number);
            const isClickable = isCompleted || step.number < currentStep;

            return (
              <React.Fragment key={step.number}>
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(step.number)}
                  disabled={!isClickable && !isCurrent}
                  className={`flex items-center gap-3 px-3 py-2 rounded-2xl transition-all select-none text-left ${
                    isCurrent
                      ? "bg-brand-800 border border-gold-400/40 shadow-sm"
                      : isClickable
                      ? "hover:bg-white/5 cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      isCurrent
                        ? "bg-gold-500 text-brand-950 font-extrabold"
                        : isCompleted
                        ? "bg-brand-700 text-gold-300 border border-gold-400/30"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                  </div>

                  {/* Step Title & Subtitle */}
                  <div className="hidden sm:block">
                    <div
                      className={`text-xs font-bold tracking-wide ${
                        isCurrent ? "text-gold-300" : isCompleted ? "text-white" : "text-white/70"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-white/50">{step.sub}</div>
                  </div>
                </button>

                {/* Connecting separator line */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 border-t border-dashed border-white/20" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
