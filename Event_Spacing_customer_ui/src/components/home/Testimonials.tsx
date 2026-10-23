"use client";

/**
 * @file Testimonials.tsx
 * @description Customer review testimonials section with star ratings and client roles.
 */

import React, { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/data/mockCategories";

/**
 * Testimonials component rendering customer endorsements.
 *
 * @returns React JSX element
 */
export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Slides carousel to the previous testimonial.
   */
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  /**
   * Slides carousel to the next testimonial.
   */
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-14 sm:py-20 bg-gray-50/70 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
              TESTIMONIALS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-950 tracking-tight">
              What Our Customers Say
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full border border-gray-300 hover:border-brand-800 bg-white hover:bg-brand-900 hover:text-white flex items-center justify-center transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full border border-gray-300 hover:border-brand-800 bg-white hover:bg-brand-900 hover:text-white flex items-center justify-center transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between relative"
            >
              <Quote className="w-8 h-8 text-brand-100 absolute top-5 right-5" />

              <div>
                {/* 5 Filled Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-500"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-700 leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-brand-100 flex-shrink-0 border-2 border-gold-300">
                  <Image
                    src={item.avatarUrl}
                    alt={item.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-950">
                    {item.name}
                  </h4>
                  <span className="text-xs text-gray-500 font-medium">
                    {item.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
