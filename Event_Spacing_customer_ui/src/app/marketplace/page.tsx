"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import {
  MOCK_MARKETPLACE_VENDORS,
  ALL_MARKETPLACE_CATEGORIES,
} from "@/data/mockCategories";
import { MarketplaceVendor } from "@/types/venue";
import { api } from "@/lib/api";

export default function VendorMarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enquiry modal state
  const [enquiringVendor, setEnquiringVendor] = useState<MarketplaceVendor | null>(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryDate, setEnquiryDate] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("es_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.name) setEnquiryName(u.name);
          if (u.phone) setEnquiryPhone(u.phone);
          if (u.email) setEnquiryEmail(u.email);
        } catch {}
      }
    }
  }, []);

  // Fetch vendors from backend API
  useEffect(() => {
    let isCancelled = false;

    const fetchVendors = async () => {
      setIsLoading(true);
      const params: any = {};
      if (selectedCategory !== "All Categories") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      try {
        const res = await api.vendors.getAll(params);
        if (!isCancelled && res.data && res.data.length > 0) {
          const mapped = res.data.map((v: any) => ({
            ...v,
            id: v.id || v._id,
          }));
          setVendors(mapped);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend vendors API not reachable, falling back to mock:", err);
      }

      if (!isCancelled) {
        const filtered = MOCK_MARKETPLACE_VENDORS.filter((vendor) => {
          const matchesCategory =
            selectedCategory === "All Categories" || vendor.category === selectedCategory;
          const matchesSearch =
            vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.locality.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        setVendors(filtered);
        setIsLoading(false);
      }
    };

    fetchVendors();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, searchQuery]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiringVendor) return;
    setIsEnquiring(true);
    setEnquiryError("");

    try {
      const vendorId = enquiringVendor.id || (enquiringVendor as any)._id;
      await api.vendors.inquire(vendorId, {
        name: enquiryName,
        phone: enquiryPhone,
        email: enquiryEmail || "customer@eventspacing.com",
        eventDate: enquiryDate,
        message: enquiryMessage,
      });
      setIsEnquiring(false);
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquirySuccess(false);
        setEnquiringVendor(null);
      }, 3000);
    } catch (err: any) {
      setIsEnquiring(false);
      setEnquiryError(err.message || "Failed to submit quote request. Please try again.");
    }
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
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-light">
            Book verified caterers, candid wedding photographers, bridal makeup artists, DJs, florists, and production crews across Bengaluru at guaranteed owner prices with zero commissions.
          </p>
        </div>
      </div>

      {/* 2. Category Chips Ribbon */}
      <div className="bg-white border-b border-gray-200 sticky top-[69px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto no-scrollbar flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("All Categories")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "All Categories"
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            All Categories
          </button>
          {ALL_MARKETPLACE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category.name
                  ? "bg-brand-900 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search and Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor name, category, or locality..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
            />
          </div>

          <div className="text-xs font-medium text-gray-500 self-start sm:self-auto">
            Showing <strong className="text-gray-900">{vendors.length}</strong> verified vendor partners
          </div>
        </div>

        {/* Vendors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-soft animate-pulse space-y-4"
              >
                <div className="h-48 bg-gray-200 rounded-2xl w-full" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <Sparkles className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-gray-800">
              No vendors found in this category
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try choosing &ldquo;All Categories&rdquo; or adjusting your search term.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All Categories");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-brand-900 text-white font-semibold text-xs mt-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Vendor Cover Image */}
                  <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={vendor.imageUrl}
                      alt={vendor.businessName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-brand-950/80 backdrop-blur-md text-gold-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold-400/30">
                      {vendor.category}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm text-xs font-bold text-gray-900">
                      <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                      <span>{vendor.rating}</span>
                      <span className="text-gray-400 font-normal">({vendor.reviewCount})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mb-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Partner</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">
                        {vendor.businessName}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-800" />
                        <span>{vendor.locality}, {vendor.city}</span>
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {vendor.description}
                    </p>
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Starting From</span>
                    <span className="font-serif text-base font-bold text-brand-950">
                      ₹{vendor.startingPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-500"> / {vendor.priceUnit}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEnquiringVendor(vendor);
                      setEnquirySuccess(false);
                      setEnquiryError("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Get Free Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      {enquiringVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setEnquiringVendor(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
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
                  {enquiryError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                      {enquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
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
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Event Date *</label>
                      <input
                        type="date"
                        required
                        value={enquiryDate}
                        onChange={(e) => setEnquiryDate(e.target.value)}
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
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="e.g. Need South Indian vegetarian catering for 400 guests with live chaat counter."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isEnquiring}
                    className="w-full py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isEnquiring ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Request Free Price Quotation</span>
                        <Send className="w-4 h-4 text-gold-400" />
                      </>
                    )}
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
