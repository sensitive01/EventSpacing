"use client";

/**
 * @file WizardSidebarLeft.tsx
 * @description Left sidebar during venue onboarding featuring venue thumbnail, value proposition, and hotline support.
 */

import React from "react";
import Image from "next/image";
import {
  Users,
  FileCheck2,
  TrendingUp,
  Sparkles,
  Layers,
  Headphones,
  Phone,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";

/**
 * WizardSidebarLeft component providing constant seller motivation and quick support.
 *
 * @returns React JSX element
 */
export const WizardSidebarLeft: React.FC = () => {
  const { state } = useVenueWizard();
  const coverPhoto = state.step5.photos.find((p) => p.isCover)?.url || state.step5.photos[0]?.url;

  const valueProps = [
    { icon: <Users className="w-4 h-4 text-gold-600" />, text: "Reach more customers" },
    { icon: <FileCheck2 className="w-4 h-4 text-gold-600" />, text: "Get quality enquiries" },
    { icon: <TrendingUp className="w-4 h-4 text-gold-600" />, text: "Increase bookings and revenue" },
    { icon: <Sparkles className="w-4 h-4 text-gold-600" />, text: "Showcase your venue beautifully" },
    { icon: <Layers className="w-4 h-4 text-gold-600" />, text: "Free listing with easy management" },
    { icon: <Headphones className="w-4 h-4 text-gold-600" />, text: "Dedicated support team" },
  ];

  return (
    <aside className="space-y-6">
      {/* 1. Venue Preview Card Thumbnail */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-soft">
        <div className="relative w-full h-36 bg-gray-100">
          <Image
            src={coverPhoto || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"}
            alt="Venue Preview"
            fill
            sizes="300px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gold-300 block">
              DRAFT PREVIEW
            </span>
            <div className="font-serif text-xs sm:text-sm font-bold line-clamp-1">
              {state.step1.venueName || "Your Venue Name"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. "Why List Your Venue?" Checklist */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-soft space-y-4">
        <h3 className="font-serif text-base font-bold text-brand-950">
          Why List Your Venue?
        </h3>
        <ul className="space-y-3">
          {valueProps.map((item) => (
            <li key={item.text} className="flex items-center gap-3 text-xs text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gold-50 border border-gold-200 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <span className="font-medium">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Need Help Hotline Box */}
      <div className="bg-gradient-to-br from-brand-50 to-brand-100/60 rounded-2xl p-4 border border-brand-200/80 shadow-soft flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-brand-800 text-gold-400 flex items-center justify-center flex-shrink-0 shadow-xs">
          <Phone className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-gray-500 block">
            Need Help?
          </span>
          <a
            href="tel:+919876543210"
            className="font-bold text-sm text-brand-950 hover:text-brand-800 transition-colors"
          >
            +91 98765 43210
          </a>
          <span className="text-[10px] text-brand-700 block mt-0.5 font-medium">
            Our onboarding team will assist you
          </span>
        </div>
      </div>
    </aside>
  );
};
