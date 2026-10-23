"use client";

/**
 * @file FaqSection.tsx
 * @description Interactive accordion answering frequently asked questions about booking and verification.
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { MOCK_FAQS } from "@/data/mockFaqs";

/**
 * FaqSection component with collapsible questions and side banquet photo.
 *
 * @returns React JSX element
 */
export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  /**
   * Toggles an accordion FAQ item.
   *
   * @param id - FAQ identifier string
   */
  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Decorative Image (4 cols) */}
          <div className="lg:col-span-4 hidden lg:block sticky top-28">
            <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-card border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                alt="Event Spacing luxury venue"
                fill
                sizes="33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-wider text-gold-300 font-bold block mb-1">
                  24/7 SUPPORT AVAILABLE
                </span>
                <p className="font-serif text-lg font-bold">
                  Need personalized assistance choosing a venue?
                </p>
                <a
                  href="tel:+919876543210"
                  className="inline-block mt-3 text-xs bg-gold-500 text-brand-950 font-bold px-3 py-1.5 rounded-lg"
                >
                  Call +91 98765 43210
                </a>
              </div>
            </div>
          </div>

          {/* Right Accordion Questions (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
                  FREQUENTLY ASKED QUESTIONS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-950 tracking-tight">
                  Got Questions? We&apos;ve Got Answers.
                </h2>
              </div>

              <Link
                href="/#faq"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-800 hover:text-brand-950 underline underline-offset-4 self-start sm:self-auto"
              >
                <span>View All FAQs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Accordion List (2-column layout on md) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_FAQS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-brand-300 bg-brand-50/40 shadow-sm"
                        : "border-gray-200 bg-gray-50/50 hover:bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-bold text-brand-950 pr-2">
                        {faq.question}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-brand-800 shadow-xs">
                        {isOpen ? (
                          <Minus className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-brand-100/60 mt-1 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
