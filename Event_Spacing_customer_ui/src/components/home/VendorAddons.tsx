"use client";

/**
 * @file VendorAddons.tsx
 * @description Vendor services add-on section showcasing decor, catering, photography, etc.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { VENDOR_ADDONS } from "@/data/mockCategories";
import { api } from "@/lib/api";

interface AddonCardItem {
  id: string;
  title: string;
  marketplaceCategory: string;
  imageUrl: string;
  startingPrice?: string;
}

const DEFAULT_ADDON_CARDS: AddonCardItem[] = [
  {
    id: "add-decor",
    title: "Event Decoration",
    marketplaceCategory: "Decorators",
    imageUrl: VENDOR_ADDONS[0]?.imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "add-catering",
    title: "Catering Services",
    marketplaceCategory: "Caterers",
    imageUrl: VENDOR_ADDONS[1]?.imageUrl || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "add-photo",
    title: "Photography & Videography",
    marketplaceCategory: "Photographers",
    imageUrl: VENDOR_ADDONS[2]?.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "add-entertainment",
    title: "Entertainment (MC, DJ, Live Band)",
    marketplaceCategory: "DJs",
    imageUrl: VENDOR_ADDONS[3]?.imageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "add-planning",
    title: "Event Planning",
    marketplaceCategory: "Event Planners",
    imageUrl: VENDOR_ADDONS[4]?.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "add-makeup",
    title: "Bridal Makeup & Styling",
    marketplaceCategory: "Makeup Artists",
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80",
  },
];

/**
 * VendorAddons component displaying trusted vendor service cards linked dynamically to Marketplace.
 *
 * @returns React JSX element
 */
export const VendorAddons: React.FC = () => {
  const [addons, setAddons] = useState<AddonCardItem[]>(DEFAULT_ADDON_CARDS);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState<number>(21);

  useEffect(() => {
    let isCancelled = false;

    const loadDynamicAddons = async () => {
      try {
        const [catRes, vendorRes] = await Promise.allSettled([
          api.categories.getAll(),
          api.vendors.getAll(),
        ]);

        const vendorCategories: any[] =
          catRes.status === "fulfilled" && Array.isArray(catRes.value?.data?.vendorCategories)
            ? catRes.value.data.vendorCategories
            : [];

        const liveVendors: any[] =
          vendorRes.status === "fulfilled" && Array.isArray(vendorRes.value?.data)
            ? vendorRes.value.data
            : [];

        if (!isCancelled) {
          if (vendorCategories.length > 0) {
            setTotalCategoriesCount(vendorCategories.length);
          }

          // Enrich cards with real starting prices and images from live MongoDB services
          const enriched = DEFAULT_ADDON_CARDS.map((card) => {
            const matching = liveVendors.filter(
              (v) =>
                (v.category || "").toLowerCase() === card.marketplaceCategory.toLowerCase()
            );
            if (matching.length === 0) return card;

            const priced = matching
              .filter((v) => typeof v.startingPrice === "number" && v.startingPrice > 0)
              .sort((a, b) => a.startingPrice - b.startingPrice);

            const lowest = priced[0];
            return {
              ...card,
              imageUrl: lowest?.imageUrl || matching[0]?.imageUrl || card.imageUrl,
              startingPrice: lowest
                ? `₹${new Intl.NumberFormat("en-IN").format(lowest.startingPrice)}${
                    lowest.priceUnit ? ` / ${lowest.priceUnit.replace(/^per\s+/i, "")}` : ""
                  }`
                : undefined,
            };
          });

          setAddons(enriched);
        }
      } catch {
        // Retain default cards if backend is unreachable
      }
    };

    loadDynamicAddons();
    return () => {
      isCancelled = true;
    };
  }, []);

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
            href="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-800 text-brand-850 hover:bg-brand-900 hover:text-white font-semibold text-xs sm:text-sm transition-all self-start sm:self-auto shadow-sm"
          >
            <span>View All Vendors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Grid Service Cards + "And More" */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {addons.map((addon) => (
            <Link
              key={addon.id}
              href={`/marketplace?category=${encodeURIComponent(addon.marketplaceCategory)}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-gold-400/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col cursor-pointer"
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
                {addon.startingPrice ? (
                  <span className="text-[11px] font-semibold text-gold-600 mt-1 block">
                    From {addon.startingPrice}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-brand-700 mt-1 block">
                    Explore Vendors →
                  </span>
                )}
              </div>
            </Link>
          ))}

          {/* And More Card */}
          <Link
            href="/marketplace"
            className="group bg-brand-50 hover:bg-brand-100/70 rounded-2xl border border-brand-100 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 shadow-soft hover:shadow-card"
          >
            <div className="w-12 h-12 rounded-full bg-brand-800 text-gold-400 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-brand-900">
              And More
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">
              {totalCategoriesCount}+ Categories
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
