"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Calendar,
  Clock,
  Lock,
  Users,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  MOCK_MARKETPLACE_VENDORS,
  ALL_MARKETPLACE_CATEGORIES,
  EVENT_CATEGORIES,
} from "@/data/mockCategories";
import { MarketplaceVendor } from "@/types/venue";
import { api } from "@/lib/api";
import { PaymentGatewayModal } from "@/components/booking/PaymentGatewayModal";
import { useBookingCart } from "@/context/CartContext";

type TimeSlotOption =
  | "Full Day (8 AM - 11 PM)"
  | "Morning Slot (8 AM - 3 PM)"
  | "Evening Slot (4 PM - 11 PM)";

const TIME_SLOTS: { value: TimeSlotOption; label: string; hours: string }[] = [
  { value: "Full Day (8 AM - 11 PM)", label: "Full Day", hours: "8 AM – 11 PM" },
  { value: "Morning Slot (8 AM - 3 PM)", label: "Morning Slot", hours: "8 AM – 3 PM" },
  { value: "Evening Slot (4 PM - 11 PM)", label: "Evening Slot", hours: "4 PM – 11 PM" },
];

export default function VendorMarketplacePage() {
  const router = useRouter();
  const { addItem: addCartItem } = useBookingCart();

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

  // Instant Service Booking modal state
  const [bookingVendor, setBookingVendor] = useState<MarketplaceVendor | null>(null);
  const [bookedSlots, setBookedSlots] = useState<{ date: string; timeSlot: string }[]>([]);
  const [bookDate, setBookDate] = useState("");
  const [bookTimeSlot, setBookTimeSlot] = useState<TimeSlotOption>("Full Day (8 AM - 11 PM)");
  const [bookOccasion, setBookOccasion] = useState("Marriage / Wedding");
  const [bookGuestCount, setBookGuestCount] = useState("150");
  const [bookName, setBookName] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Auth & Pre-fill user profile if logged in
  useEffect(() => {
    const syncProfile = () => {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("es_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.name) {
            setEnquiryName(u.name);
            setBookName(u.name);
          }
          if (u.phone) {
            setEnquiryPhone(u.phone);
            setBookPhone(u.phone);
          }
          if (u.email) {
            setEnquiryEmail(u.email);
            setBookEmail(u.email);
          }
        } catch {}
      }
    };

    syncProfile();
    window.addEventListener("auth-change", syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener("auth-change", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
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
        if (!isCancelled && Array.isArray(res?.data)) {
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

  // Open Booking Modal (require sign-in first) & load active booked slots for conflict prevention
  const openBookingModal = async (vendor: MarketplaceVendor) => {
    if (typeof window !== "undefined" && !localStorage.getItem("es_auth_token")) {
      router.push("/signin?redirect=/marketplace");
      return;
    }

    const vId = vendor.id || (vendor as any)._id;
    setBookingVendor(vendor);
    setBookingError("");
    setBookedSlots([]);
    setIsPaymentModalOpen(false);
    if (!bookDate) {
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setBookDate(nextWeek.toISOString().split("T")[0]);
    }

    try {
      const res = await api.vendors.getBookedSlots(vId);
      if (res?.success && Array.isArray(res.data)) {
        setBookedSlots(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch service booked slots:", err);
    }
  };

  const isSelectedSlotBooked = useMemo(() => {
    if (!bookDate) return false;
    return bookedSlots.some((s) => {
      if (s.date !== bookDate) return false;
      if (bookTimeSlot === "Full Day (8 AM - 11 PM)") return true;
      return s.timeSlot === "Full Day (8 AM - 11 PM)" || s.timeSlot === bookTimeSlot;
    });
  }, [bookedSlots, bookDate, bookTimeSlot]);

  const servicePricing = useMemo(() => {
    if (!bookingVendor) {
      return { total: 0, advance: 0, balance: 0, guestNum: 100, isPerPlate: false };
    }
    const unit = (bookingVendor.priceUnit || "").toLowerCase();
    const isPerPlate = unit.includes("plate") || unit.includes("person");
    const guestNum = Math.max(1, parseInt(bookGuestCount || "100", 10) || 100);
    const total = isPerPlate
      ? (bookingVendor.startingPrice || 0) * guestNum
      : bookingVendor.startingPrice || 0;
    const advance = Math.round(total * 0.3);
    const balance = total - advance;
    return { total, advance, balance, guestNum, isPerPlate };
  }, [bookingVendor, bookGuestCount]);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (typeof window !== "undefined" && !localStorage.getItem("es_auth_token")) {
      router.push("/signin?redirect=/marketplace");
      return;
    }

    if (!bookName.trim() || bookName.trim().length < 2) {
      setBookingError("Please enter your full name.");
      return;
    }
    if (!bookPhone.trim() || bookPhone.replace(/\D/g, "").length < 10) {
      setBookingError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!bookEmail.trim() || !bookEmail.includes("@")) {
      setBookingError("Please enter a valid email address.");
      return;
    }
    if (!bookDate) {
      setBookingError("Please select your event date.");
      return;
    }
    if (isSelectedSlotBooked) {
      setBookingError("This date and time slot is already reserved. Please pick another slot or date.");
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleBookingPaymentSuccess = async (paymentData: {
    transactionId: string;
    paymentMethod: string;
    amountPaid: number;
    paymentGateway?: "razorpay" | "direct_upi";
    utrNumber?: string;
    paymentProofUrl?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => {
    if (!bookingVendor) return;
    const vendorServiceId = bookingVendor.id || (bookingVendor as any)._id;

    try {
      const payload = {
        bookingType: "service",
        vendorServiceId,
        selectedSpaceName: bookingVendor.category,
        packageTitle: `${bookingVendor.category} Standard Package`,
        eventCategory: bookOccasion,
        eventDate: bookDate,
        timeSlot: bookTimeSlot,
        guestCount: servicePricing.guestNum,
        customerName: bookName.trim(),
        customerPhone: bookPhone.trim(),
        customerEmail: bookEmail.trim(),
        specialRequests: bookNotes.trim() || undefined,
        transactionId: paymentData.transactionId,
        paymentMethod: paymentData.paymentMethod,
        paymentGateway: paymentData.paymentGateway || "direct_upi",
        utrNumber: paymentData.utrNumber,
        paymentProofUrl: paymentData.paymentProofUrl,
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
      };

      const res = await api.bookings.create(payload);
      setIsPaymentModalOpen(false);
      setBookingVendor(null);
      if (res?.data?._id || res?.data?.bookingRef) {
        router.push(`/my-bookings/${res.data._id || res.data.bookingRef}`);
      } else {
        router.push("/my-bookings");
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setIsPaymentModalOpen(false);
        setBookingVendor(null);
        router.push("/signin?redirect=/marketplace");
        return;
      }
      setBookingError(err?.message || "Failed to create service booking. Please try again.");
      setIsPaymentModalOpen(false);
      try {
        const slotsRes = await api.vendors.getBookedSlots(vendorServiceId);
        if (slotsRes?.data) setBookedSlots(slotsRes.data);
      } catch {}
    }
  };

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
                <div className="p-5 pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Starting From
                      </span>
                      <span className="font-serif text-base font-bold text-brand-950">
                        ₹{vendor.startingPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500"> / {vendor.priceUnit}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      30% Token Lock
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openBookingModal(vendor)}
                      className="px-3 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-gold-400" />
                      <span>Book Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEnquiringVendor(vendor);
                        setEnquirySuccess(false);
                        setEnquiryError("");
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-brand-900 border border-gray-300 font-bold text-xs transition-all cursor-pointer"
                    >
                      Get Free Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      {enquiringVendor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto">
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
      {/* Book Marketplace Service Modal */}
      {bookingVendor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Branded Header */}
            <div className="bg-[#1f0528] text-white p-5 sm:p-6 shrink-0 relative">
              <button
                type="button"
                onClick={() => setBookingVendor(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close booking modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-10 space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#f3cf7a] tracking-wider">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Instant Service Reservation</span>
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Book {bookingVendor.businessName}
                </h3>
                <p className="text-xs text-purple-200">
                  {bookingVendor.category} &bull; {bookingVendor.locality}, {bookingVendor.city} &bull; ₹
                  {bookingVendor.startingPrice.toLocaleString()} / {bookingVendor.priceUnit}
                </p>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {bookingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-800" />
                      <span>Event Date *</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-800" />
                      <span>Event Occasion *</span>
                    </label>
                    <select
                      value={bookOccasion}
                      onChange={(e) => setBookOccasion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                    >
                      {EVENT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time Slot Pills with Conflict Badges */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-800" />
                    <span>Select Time Slot *</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const slotConflict =
                        Boolean(bookDate) &&
                        bookedSlots.some((s) => {
                          if (s.date !== bookDate) return false;
                          if (slot.value === "Full Day (8 AM - 11 PM)") return true;
                          return s.timeSlot === "Full Day (8 AM - 11 PM)" || s.timeSlot === slot.value;
                        });
                      const isActive = bookTimeSlot === slot.value;

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          disabled={slotConflict}
                          onClick={() => setBookTimeSlot(slot.value)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            slotConflict
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : isActive
                              ? "bg-brand-900 border-brand-900 text-white shadow-sm cursor-pointer"
                              : "bg-white border-gray-200 text-gray-700 hover:border-brand-700 cursor-pointer"
                          }`}
                        >
                          <span className="font-bold block text-[11px]">
                            {slotConflict ? "🔒 Booked" : slot.label}
                          </span>
                          <span
                            className={`text-[10px] block ${
                              isActive && !slotConflict ? "text-gold-300" : "text-gray-400"
                            }`}
                          >
                            {slot.hours}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-800" />
                      <span>
                        {servicePricing.isPerPlate ? "Expected Plates / Guests *" : "Expected Guest Count *"}
                      </span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={bookGuestCount}
                      onChange={(e) => setBookGuestCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="e.g. Bharath Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={bookEmail}
                      onChange={(e) => setBookEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Special Instructions / Deliverables (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookNotes}
                    onChange={(e) => setBookNotes(e.target.value)}
                    placeholder="e.g. Candid + traditional team from 9 AM, venue is Bk Hall"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900"
                  />
                </div>

                {/* Live Pricing Summary Card */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                  <div className="flex justify-between text-gray-700">
                    <span>
                      Service Package Total{" "}
                      {servicePricing.isPerPlate &&
                        `(${servicePricing.guestNum} × ₹${bookingVendor.startingPrice.toLocaleString()})`}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{servicePricing.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>70% Balance (Payable on Event Date)</span>
                    <span className="font-semibold">₹{servicePricing.balance.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200 flex justify-between items-center text-sm font-bold text-[#380c48]">
                    <span>30% Advance Deposit Due Now</span>
                    <span className="font-serif text-base">
                      ₹{servicePricing.advance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSelectedSlotBooked}
                    onClick={() => {
                      const vendorServiceId = bookingVendor.id || (bookingVendor as any)._id;
                      addCartItem({
                        bookingType: "service",
                        vendorServiceId,
                        title: bookingVendor.businessName,
                        categoryLabel: bookingVendor.category,
                        coverImage: bookingVendor.imageUrl,
                        locality: bookingVendor.locality,
                        city: bookingVendor.city || "Bengaluru",
                        selectedSpaceName: bookingVendor.category,
                        packageTitle: `${bookingVendor.category} Standard Package`,
                        eventCategory: bookOccasion,
                        eventDate: bookDate,
                        timeSlot: bookTimeSlot,
                        guestCount: servicePricing.guestNum,
                        totalAmount: servicePricing.total,
                        advancePaid: servicePricing.advance,
                        securityDeposit: 0,
                      });
                      setBookingVendor(null);
                      router.push("/cart");
                    }}
                    className="w-full py-3.5 rounded-2xl border-2 border-[#380c48] text-[#380c48] hover:bg-purple-50 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    + Add to Booking Cart
                  </button>

                  <button
                    type="submit"
                    disabled={isSelectedSlotBooked}
                    className="w-full py-3.5 rounded-2xl bg-[#380c48] hover:bg-[#521369] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 text-[#f3cf7a]" />
                    <span>
                      Pay ₹{servicePricing.advance.toLocaleString()} Now
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dual Payment Gateway Checkout Modal (Razorpay & Direct UPI Proof) */}
      {bookingVendor && (
        <PaymentGatewayModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          bookingDetails={{
            venueName: bookingVendor.businessName,
            spaceName: bookingVendor.category,
            packageTitle: `${bookingVendor.category} Standard Package`,
            eventDate: bookDate,
            timeSlot: bookTimeSlot,
            guestCount: servicePricing.guestNum,
            totalAmount: servicePricing.total,
            advanceAmount: servicePricing.advance,
            balanceDue: servicePricing.balance,
            customerName: bookName,
            customerPhone: bookPhone,
            customerEmail: bookEmail,
          }}
          onPaymentSuccess={handleBookingPaymentSuccess}
        />
      )}
    </div>
  );
}
