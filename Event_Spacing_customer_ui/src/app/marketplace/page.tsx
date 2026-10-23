"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Filter,
  X,
  Send,
} from "lucide-react";
import {
  MOCK_MARKETPLACE_VENDORS,
  ALL_MARKETPLACE_CATEGORIES,
} from "@/data/mockCategories";
import { MarketplaceVendor } from "@/types/venue";

export default function VendorMarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [enquiringVendor, setEnquiringVendor] = useState<MarketplaceVendor | null>(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const filteredVendors = MOCK_MARKETPLACE_VENDORS.filter((vendor) => {
    const matchesCategory =
      selectedCategory === "All Categories" || vendor.category === selectedCategory;
    const matchesSearch =
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.locality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setEnquiringVendor(null);
    }, 2500);
  };

  return (
    <div className="w-full bg-[#fbf9fc] min-h-screen pb-20">
      {/* 1. Hero Header Banner */}
      <div className="relative bg-brand-950 text-white py-12 px-4 sm:px-8 border-b border-brand-900 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Event Services Ecosystem</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Vendor <span className="text-gold-400">Marketplace</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Hire top-rated independent caterers, decorators, wedding photographers, live DJs, and valet teams verified by Event Spacing.
          </p>
        </div>

        {/* Backdrop Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-brand-700/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. 21 Categories Horizontal Ribbon */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto no-scrollbar flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory("All Categories")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "All Categories"
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All 21 Services
          </button>

          {ALL_MARKETPLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? "bg-brand-900 text-white shadow-sm font-bold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search and Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor name, service category, or locality..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-900 focus:bg-white"
            />
          </div>

          <div className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Showing <strong className="text-brand-950">{filteredVendors.length}</strong> verified partners
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-card transition-shadow"
            >
              <div>
                {/* Photo & Category Badge */}
                <div className="relative h-48 w-full bg-gray-100">
                  <Image src={vendor.imageUrl} alt={vendor.businessName} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-900 text-gold-300 shadow-sm">
                      {vendor.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      {vendor.locality}, {vendor.city}
                    </span>
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs font-semibold">
                      <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      <span>{vendor.rating}</span>
                      <span className="text-gray-300 text-[10px]">({vendor.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif font-bold text-lg text-gray-900 line-clamp-1">
                        {vendor.businessName}
                      </h3>
                      {vendor.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">Lead Specialist: {vendor.ownerName}</p>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {vendor.description}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between text-xs">
                    <span className="text-gray-500 font-medium">Starting from</span>
                    <div className="text-right">
                      <span className="font-serif font-bold text-base text-brand-950">
                        ₹{vendor.startingPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500"> / {vendor.priceUnit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <a
                  href={`tel:${vendor.phone}`}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Call Vendor"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setEnquiringVendor(vendor);
                    setEnquirySuccess(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs shadow-xs transition-colors text-center"
                >
                  Request Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Enquiry Modal */}
      {enquiringVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setEnquiringVendor(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-brand-950">
                  Quote Request Sent to {enquiringVendor.businessName}!
                </h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  The partner coordinator will review your dates and reach out on WhatsApp/Phone with custom package pricing within 2 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                    Vendor Direct Quote
                  </span>
                  <h3 className="font-serif text-xl font-bold text-brand-950">
                    {enquiringVendor.businessName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Category: {enquiringVendor.category} • {enquiringVendor.locality}
                  </p>
                </div>

                <form onSubmit={handleEnquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shalini Roy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Event Date *</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Specific Requirements / Guest Count
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Need South Indian vegetarian catering for 400 guests with live chaat counter."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Request Free Price Quotation</span>
                    <Send className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
