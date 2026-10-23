"use client";

/**
 * @file VendorAddons.tsx
 * @description Vendor services add-on section showcasing decor, catering, photography, etc.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { VENDOR_ADDONS } from "@/data/mockCategories";

/**
 * VendorAddons component displaying trusted vendor service cards with starting rates.
 *
 * @returns React JSX element
 */
export const VendorAddons: React.FC = () => {
  return (
    <section id="vendors" className="py-14 sm:py-18 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
              EVENT ADD-ONS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-950 tracking-tight">
              Everything You Need for a Perfect Event
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1.5">
              Discover trusted vendors for decoration, catering, photography, entertainment and more.
            </p>
          </div>

          <Link
            href="/venues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-800 text-brand-850 hover:bg-brand-900 hover:text-white font-semibold text-xs sm:text-sm transition-all self-start sm:self-auto shadow-sm"
          >
            <span>View All Vendors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Grid Service Cards + "And More" */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {VENDOR_ADDONS.map((addon) => (
            <div
              key={addon.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-gold-400/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col cursor-pointer"
              onClick={() => alert(`Selected vendor service: ${addon.title}`)}
            >
              <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                <Image
                  src={addon.imageUrl}
                  alt={addon.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 15vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between text-center">
                <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-800 transition-colors line-clamp-2">
                  {addon.title}
                </h4>
                {addon.startingPrice && (
                  <span className="text-[11px] font-semibold text-gold-600 mt-1 block">
                    From {addon.startingPrice}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* And More Card */}
          <div
            className="group bg-brand-50 hover:bg-brand-100/70 rounded-2xl border border-brand-100 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 shadow-soft hover:shadow-card"
            onClick={() => alert("Browse all 50+ event vendor categories")}
          >
            <div className="w-12 h-12 rounded-full bg-brand-800 text-gold-400 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-brand-900">
              And More
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">
              50+ Services
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
