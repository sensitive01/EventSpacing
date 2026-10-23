/**
 * @file HowItWorks.tsx
 * @description 4-step workflow explaining the venue discovery and booking process.
 */

import React from "react";
import Image from "next/image";
import { Search, ListChecks, CalendarCheck, PartyPopper, ChevronRight } from "lucide-react";

/**
 * HowItWorks component detailing the 4 steps: Search, Compare, Book, and Celebrate.
 *
 * @returns React JSX element
 */
export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "1. Search",
      desc: "Enter your event details and explore venues",
      icon: <Search className="w-5 h-5 text-brand-700" />,
    },
    {
      number: "2",
      title: "2. Compare",
      desc: "View details, prices and availability",
      icon: <ListChecks className="w-5 h-5 text-brand-700" />,
    },
    {
      number: "3",
      title: "3. Book",
      desc: "Confirm and make secure payment",
      icon: <CalendarCheck className="w-5 h-5 text-brand-700" />,
    },
    {
      number: "4",
      title: "4. Celebrate",
      desc: "Enjoy your event with peace of mind",
      icon: <PartyPopper className="w-5 h-5 text-brand-700" />,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-brand-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Flow Steps (7 cols) */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
              SIMPLE STEPS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-950 tracking-tight mb-2">
              How Event Spacing Works
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-10">
              Find and book the perfect event space in just a few steps.
            </p>

            {/* Stepper Grid with Connecting Arrows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex flex-col items-center text-center relative group">
                  {/* Step Icon Bubble */}
                  <div className="w-14 h-14 rounded-2xl bg-brand-100/70 border border-brand-200/80 flex items-center justify-center mb-3 shadow-soft group-hover:scale-105 group-hover:bg-brand-200/80 transition-all duration-200">
                    {step.icon}
                  </div>

                  <h3 className="font-serif text-base font-bold text-brand-950 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[150px]">
                    {step.desc}
                  </p>

                  {/* Horizontal Arrow on Desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 -right-3 text-brand-300">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Image Arch (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md h-80 sm:h-96 rounded-t-full rounded-b-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                alt="Couple celebrating at an Indian wedding"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white text-center">
                <span className="text-xs font-semibold tracking-wider text-gold-300 uppercase block mb-1">
                  100% Hassle-Free
                </span>
                <span className="font-serif text-base font-bold drop-shadow">
                  Your Dream Celebration Starts Here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
