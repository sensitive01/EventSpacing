"use client";

/**
 * @file venues/[slug]/VenueDetailsClient.tsx
 * @description Dedicated Venue Details & Multi-Space Booking client component for Event Spacing.
 * Connected to backend endpoint GET /api/venues/:slugOrId and POST /api/venues/:id/inquire.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  Calendar,
  Heart,
  Share2,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Utensils,
  Music,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowRight,
  Send,
  Sliders,
  DollarSign,
  AlertCircle,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { MOCK_VENUES } from "@/data/mockVenues";
import { StarRating } from "@/components/common/StarRating";
import { Badge } from "@/components/common/Badge";

export default function VenueDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  // Data states
  const [venue, setVenue] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryDate, setInquiryDate] = useState("2026-12-15");
  const [inquiryEventType, setInquiryEventType] = useState("Marriage / Wedding");
  const [inquiryGuests, setInquiryGuests] = useState("300");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  // Auto-fill logged-in user details if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("es_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setInquiryName(u.name);
        if (u.email) setInquiryEmail(u.email);
        if (u.phone) setInquiryPhone(u.phone);
      }
    } catch {}
  }, []);

  // Fetch venue from MongoDB Atlas by slug or ID with fallback to mock data
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError("");

    const fetchVenue = async () => {
      try {
        const res = await api.venues.getBySlug(slug);
        if (!isCancelled && res?.data) {
          setVenue(res.data);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn("Backend venue fetch failed:", err);
      }

      if (!isCancelled) {
        setError("Venue not found or has been unlisted.");
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchVenue();
    }

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  // Handle Share link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Inquiry Submit
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    setInquiryError("");

    try {
      const venueId = venue?._id || venue?.id || slug;
      await api.venues.inquire(venueId, {
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        eventType: inquiryEventType,
        eventDate: inquiryDate,
        guestCount: parseInt(inquiryGuests, 10) || 100,
        message: inquiryMessage || `Inquiry for ${venue?.name}`,
      });

      setIsSubmittingInquiry(false);
      setInquirySuccess(true);
    } catch (err: any) {
      setIsSubmittingInquiry(false);
      setInquiryError(err.message || "Failed to submit inquiry. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9fc] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-[#380c48] rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg font-bold text-[#380c48]">
            Loading Venue Details...
          </p>
          <p className="text-xs text-gray-500">Connecting to MongoDB Atlas</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fbf9fc] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Venue Not Found
          </h1>
          <p className="text-xs text-gray-600">
            The event space you are looking for does not exist or may have been unlisted.
          </p>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 bg-[#380c48] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md hover:bg-[#5a136b] transition-all"
          >
            <span>Browse All Venues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages =
    venue.images && venue.images.length > 0
      ? venue.images
      : [venue.coverImage || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"];

  const hasFreeVenue =
    venue.pricing?.hasFreeVenueOption || venue.hasFreeVenueOption || venue.badge === "Free Venue Plan";

  const minCapacity = venue.capacity?.minGuests || venue.capacityMin || 100;
  const maxCapacity = venue.capacity?.maxGuests || venue.capacityMax || 800;
  const dayRent = venue.pricing?.pricePerDay || venue.rentalPricing?.standardDayRent || 150000;
  const vegPlate = venue.catering?.vegPlatePrice || venue.pricing?.freeVenuePlateStartingPrice || 950;
  const nonVegPlate = venue.catering?.nonVegPlatePrice || 1250;

  return (
    <div className="min-h-screen bg-[#fbf9fc] text-gray-900 pb-20">
      {/* 1. Breadcrumb Bar */}
      <section className="bg-white border-b border-gray-100 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#380c48] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/venues" className="hover:text-[#380c48] transition-colors">
              Venues
            </Link>
            <span>/</span>
            <span className="text-gray-400">{venue.location?.city || "Bengaluru"}</span>
            <span>/</span>
            <span className="font-bold text-[#380c48] truncate max-w-[200px] sm:max-w-xs">
              {venue.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#380c48] px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Copied Link!" : "Share"}</span>
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-gray-100 transition-colors"
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Hero Interactive Photo Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Large Showcase Photo (8 cols) */}
          <div className="lg:col-span-8 relative h-[360px] sm:h-[480px] rounded-3xl overflow-hidden bg-gray-900 shadow-md">
            <Image
              src={galleryImages[activeImageIndex] || galleryImages[0]}
              alt={venue.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badges on Top */}
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              {hasFreeVenue && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                  FREE VENUE (CATERING)
                </span>
              )}
              {venue.badge && <Badge variant={venue.badge} className="shadow-md" />}
            </div>

            {/* Gallery Navigation Controls */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter Pill */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
              Photo {activeImageIndex + 1} of {galleryImages.length}
            </div>
          </div>

          {/* Right Thumbnail Grid (4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 h-[360px] sm:h-[480px]">
            {galleryImages.slice(0, 4).map((imgUrl: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer bg-gray-100 border-2 transition-all shadow-sm ${
                  activeImageIndex === idx ? "border-[#e5a83b] ring-2 ring-gold-200" : "border-transparent opacity-85 hover:opacity-100"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${venue.name} preview ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 16vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Venue Master Header Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
                {venue.venueType || "Luxury Banquet Venue"}
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Partner
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {venue.name}
            </h1>

            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                <span>
                  {venue.location?.locality}, {venue.location?.city}
                </span>
              </div>
              <span>•</span>
              <StarRating rating={venue.rating || 4.8} reviewCount={venue.reviewCount || 120} />
            </div>
          </div>

          {/* Quick Pricing Pill */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div>
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Starting Rental</div>
              <div className="font-serif text-2xl font-bold text-[#380c48]">
                {hasFreeVenue ? (
                  <span className="text-emerald-700 font-extrabold">₹0 Special</span>
                ) : (
                  `₹${Number(dayRent).toLocaleString("en-IN")}`
                )}
                {!hasFreeVenue && <span className="text-xs font-normal text-gray-500"> / Day</span>}
              </div>
            </div>
            <a
              href="#inquire-section"
              className="bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              Request Quote
            </a>
          </div>
        </div>
      </section>

      {/* 4. Main Details & Sidebar Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Venue Comprehensive Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Users className="w-4 h-4 text-gold-600" />
                  <span>Capacity</span>
                </div>
                <div className="font-bold text-sm text-gray-900">
                  {minCapacity} – {maxCapacity} Pax
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Building2 className="w-4 h-4 text-gold-600" />
                  <span>Event Halls</span>
                </div>
                <div className="font-bold text-sm text-gray-900">
                  {venue.spaces?.length || 2} Dedicated Spaces
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Utensils className="w-4 h-4 text-gold-600" />
                  <span>Veg Plate</span>
                </div>
                <div className="font-bold text-sm text-gray-900">
                  ₹{Number(vegPlate).toLocaleString("en-IN")}/plate
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Clock className="w-4 h-4 text-gold-600" />
                  <span>Time Slot</span>
                </div>
                <div className="font-bold text-sm text-gray-900">
                  Full Day (8 AM - 11 PM)
                </div>
              </div>
            </div>

            {/* Special Free Venue Offer Banner (If applicable) */}
            {hasFreeVenue && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 -mr-10 -mt-10 w-44 h-44 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                    <span>Exclusive Platform Offer</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gold-300">
                    FREE VENUE Hall Rental with Catering Package
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
                    Book this venue for {venue.pricing?.freeVenueMinGuests || 250}+ guests with their signature in-house catering plan (starting at ₹{venue.pricing?.freeVenuePlateStartingPrice || 1150}/plate) and pay <strong>₹0 in hall rental fees</strong>!
                  </p>
                </div>
              </div>
            )}

            {/* Overview / Story */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                About {venue.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {venue.detailedDescription ||
                  venue.shortDescription ||
                  `${venue.name} is one of Bengaluru's premier celebration destinations, equipped with crystal chandeliers, acoustic wall paneling, expansive pre-function lobbies, and dedicated bride & groom suites. Perfect for weddings, corporate offsites, and milestone anniversary galas.`}
              </p>
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3 text-xs text-[#380c48]">
                <Info className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Full Address: </strong>
                  {venue.location?.fullAddress || `${venue.location?.locality}, Bengaluru, Karnataka 560038`}
                </span>
              </div>
            </div>

            {/* Multiple Spaces & Halls */}
            {venue.spaces && venue.spaces.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                    Available Spaces &amp; Halls
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Book an individual hall or combine multiple halls for multi-track ceremonies.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {venue.spaces.map((sp: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-gray-200/90 hover:border-[#380c48] transition-all bg-gray-50/40 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-base font-bold text-gray-900">
                          {sp.name}
                        </h4>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {sp.airConditioned ? "Central AC" : "Ventilated"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <strong>Seating: </strong> {sp.seatingCapacity || sp.capacityMin || 150} Guests
                        </div>
                        <div>
                          <strong>Floating: </strong> {sp.floatingCapacity || sp.capacityMax || 400} Guests
                        </div>
                        {sp.areaSqFt && (
                          <div>
                            <strong>Area: </strong> {sp.areaSqFt.toLocaleString("en-IN")} sq.ft.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                  Featured Amenities
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  All listed amenities are physically verified on-site by Event Spacing auditors.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(venue.amenities && venue.amenities.length > 0
                  ? venue.amenities
                  : [
                      "Central Air Conditioning",
                      "Bridal Dressing Rooms",
                      "Valet Parking Service",
                      "100% Generator Backup",
                      "Audio-Visual Rigging",
                      "Dedicated Dining Hall",
                      "In-House Catering Kitchen",
                      "Elevator & Wheelchair Access",
                      "Stage & Dynamic Lighting",
                    ]
                ).map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                Venue Policies &amp; House Rules
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-gold-600" /> Music &amp; DJ Policy
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Loud music and DJ performances allowed until 10:30 PM as per municipal regulations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-gold-600" /> Catering Policy
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    In-house catering team provides live multi-cuisine counters. Outside catering permitted upon special arrangement.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gold-600" /> Advance &amp; Security
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {venue.pricing?.advancePaymentPercent || 30}% advance booking deposit required to block dates. 100% refundable security deposit.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-600" /> Cancellation Terms
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    85% refund if cancelled 15+ days prior to event. 50% refund between 7-14 days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking & Direct Inquiry Sidebar (4 cols) */}
          <div id="inquire-section" className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-200/80 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-[#380c48] border border-purple-100 mb-2 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  Direct Owner Pricing
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Request a Site Visit or Quote
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Send your event details directly to the venue management desk. Zero broker markup.
                </p>
              </div>

              {inquirySuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-emerald-950">
                    Inquiry Sent Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    The venue coordinator has received your request for <strong>{venue.name}</strong> and will connect via WhatsApp/call within 2 hours.
                  </p>
                  <button
                    onClick={() => setInquirySuccess(false)}
                    className="text-xs font-bold text-emerald-900 underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {inquiryError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      {inquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Raghav Rao"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="e.g. 98450 12345"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="e.g. user@gmail.com"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={inquiryDate}
                        onChange={(e) => setInquiryDate(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Guest Count *
                      </label>
                      <input
                        type="number"
                        required
                        min="20"
                        value={inquiryGuests}
                        onChange={(e) => setInquiryGuests(e.target.value)}
                        placeholder="e.g. 300"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Event Category
                    </label>
                    <select
                      value={inquiryEventType}
                      onChange={(e) => setInquiryEventType(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium bg-white"
                    >
                      <option value="Marriage / Wedding">Marriage / Wedding</option>
                      <option value="Reception">Reception</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday">Birthday Party</option>
                      <option value="Corporate Meetings">Corporate Meeting / Conference</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Other Custom Events">Other Occasion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Catering preferences, room requirements, timing..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="w-full bg-[#380c48] hover:bg-[#5a136b] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4 text-gold-300" />
                    <span>{isSubmittingInquiry ? "Connecting with Owner..." : "Get Guaranteed Best Quote"}</span>
                  </button>
                </form>
              )}

              {/* Trust Badges */}
              <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Price Transparency &bull; Zero Platform Fee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span>Assisted Concierge Helpline: <strong>+91 98765 43210</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

