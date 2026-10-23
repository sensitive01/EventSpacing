"use client";

/**
 * @file CategoryBar.tsx
 * @description Quick category carousel cards displaying event types with photo previews and icon buttons.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Briefcase,
  Cake,
  Users,
  MonitorPlay,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { EVENT_CATEGORIES } from "@/data/mockCategories";

/**
 * Renders the circular/card event category strip directly below the hero.
 *
 * @returns React JSX element
 */
export const CategoryBar: React.FC = () => {
  /**
   * Helper returning appropriate Lucide icon component.
   *
   * @param id - Category ID
   * @returns JSX Icon element
   */
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "cat-weddings":
        return <Heart className="w-4 h-4 text-pink-600" />;
      case "cat-corporate":
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case "cat-birthdays":
        return <Cake className="w-4 h-4 text-purple-600" />;
      case "cat-gatherings":
        return <Users className="w-4 h-4 text-amber-600" />;
      case "cat-presentations":
        return <MonitorPlay className="w-4 h-4 text-indigo-600" />;
      case "cat-social":
        return <Sparkles className="w-4 h-4 text-orange-600" />;
      default:
        return <MoreHorizontal className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {EVENT_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/venues?type=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center bg-gray-50/70 hover:bg-white rounded-2xl p-2.5 transition-all duration-300 hover:shadow-card border border-gray-100 text-center"
            >
              {/* Category Thumbnail Image */}
              <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden mb-2 shadow-sm">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 15vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Icon Circle */}
              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200/80 flex items-center justify-center -mt-6 relative z-10 group-hover:border-gold-400 group-hover:scale-105 transition-all">
                {getCategoryIcon(cat.id)}
              </div>

              {/* Category Name */}
              <span className="mt-2 text-xs font-semibold text-gray-800 group-hover:text-brand-800 line-clamp-1 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* "And More" Card */}
          <Link
            href="/venues"
            className="group flex flex-col items-center bg-gray-50/70 hover:bg-white rounded-2xl p-2.5 transition-all duration-300 hover:shadow-card border border-gray-100 text-center"
          >
            <div className="relative w-full h-24 sm:h-28 rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 flex items-center justify-center mb-2 shadow-sm">
              <MoreHorizontal className="w-8 h-8 text-gold-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200/80 flex items-center justify-center -mt-6 relative z-10">
              <Sparkles className="w-4 h-4 text-brand-700" />
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-800 group-hover:text-brand-800 transition-colors">
              And More
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
