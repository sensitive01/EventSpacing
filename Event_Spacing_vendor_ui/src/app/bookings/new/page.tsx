"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
  Store,
} from "lucide-react";
import { api } from "@/lib/api";

const TIME_SLOTS = [
  "Full Day (8 AM - 11 PM)",
  "Morning Slot (8 AM - 3 PM)",
  "Evening Slot (4 PM - 11 PM)",
] as const;

const EVENT_OCCASIONS = [
  "Marriage / Wedding",
  "Reception",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Corporate Meetings",
  "Conferences",
  "Family Functions",
  "Other Custom Events",
];

export default function VendorNewWalkInBookingPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  const [bookingType, setBookingType] = useState<"venue" | "service">("venue");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedSpaceName, setSelectedSpaceName] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [eventCategory, setEventCategory] = useState("Marriage / Wedding");
  const [eventDate, setEventDate] = useState(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState<(typeof TIME_SLOTS)[number]>("Full Day (8 AM - 11 PM)");
  const [guestCount, setGuestCount] = useState("200");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash / Offline Advance");
  const [advancePaid, setAdvancePaid] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdRef, setCreatedRef] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadListings = async () => {
      setIsLoadingListings(true);
      try {
        const [vRes, sRes] = await Promise.allSettled([
          api.vendor.getVenues(),
          api.vendor.getServices(),
        ]);

        if (!mounted) return;
        const vList =
          vRes.status === "fulfilled" && Array.isArray(vRes.value?.data)
            ? vRes.value.data
            : [];
        const sList =
          sRes.status === "fulfilled" && Array.isArray(sRes.value?.data)
            ? sRes.value.data
            : [];

        setVenues(vList);
        setServices(sList);

        if (vList.length > 0) {
          setBookingType("venue");
          setSelectedVenueId(vList[0]._id || vList[0].id);
          setSelectedSpaceName(vList[0].spaces?.[0]?.name || "Main Banquet Hall");
        } else if (sList.length > 0) {
          setBookingType("service");
          setSelectedServiceId(sList[0]._id || sList[0].id);
        }
      } finally {
        if (mounted) setIsLoadingListings(false);
      }
    };

    loadListings();
    return () => {
      mounted = false;
    };
  }, []);

  const activeVenue = useMemo(
    () => venues.find((v) => (v._id || v.id) === selectedVenueId) || null,
    [venues, selectedVenueId]
  );

  const activeService = useMemo(
    () => services.find((s) => (s._id || s.id) === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  const estimatedTotal = useMemo(() => {
    const guests = Math.max(1, parseInt(guestCount || "100", 10) || 100);
    if (bookingType === "service" && activeService) {
      const unit = (activeService.priceUnit || "").toLowerCase();
      return unit.includes("plate") || unit.includes("person")
        ? (activeService.startingPrice || 0) * guests
        : activeService.startingPrice || 0;
    }
    return activeVenue?.pricing?.pricePerDay || 0;
  }, [bookingType, activeVenue, activeService, guestCount]);

  const defaultAdvance = Math.round(estimatedTotal * 0.3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Customer name and 10-digit phone number are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.vendor.createBooking({
        bookingType,
        venueId: bookingType === "venue" ? selectedVenueId : undefined,
        vendorServiceId: bookingType === "service" ? selectedServiceId : undefined,
        selectedSpaceName:
          bookingType === "venue"
            ? selectedSpaceName || activeVenue?.spaces?.[0]?.name || "Main Banquet Hall"
            : activeService?.category,
        packageTitle:
          bookingType === "venue"
            ? "Walk-In Direct Venue Booking"
            : `${activeService?.category || "Service"} Walk-In Booking`,
        eventCategory,
        eventDate,
        timeSlot,
        guestCount: Math.max(1, parseInt(guestCount || "100", 10) || 100),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod,
        advancePaid: advancePaid !== "" ? Number(advancePaid) : undefined,
        specialRequests: specialRequests.trim() || undefined,
      });

      setCreatedRef(res?.data?.bookingRef || "Confirmed");
      setTimeout(() => {
        router.push("/bookings");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not create walk-in booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#faf7fb] min-h-screen pb-20">
      <div className="bg-[#1f0528] text-white py-7 px-4 sm:px-8 border-b border-[#380c48]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bookings</span>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              New Walk-In / Offline Booking
            </h1>
            <p className="text-xs text-gray-300">
              Record a direct customer booking so your availability calendar locks automatically and prevents online double-bookings.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        {isLoadingListings ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#380c48] mx-auto" />
          </div>
        ) : venues.length === 0 && services.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-4">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Add a Venue or Service First
            </h2>
            <p className="text-xs text-gray-500">
              You need at least one active venue or marketplace service before recording walk-in reservations.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/venues/new"
                className="px-4 py-2 rounded-xl bg-[#380c48] text-white text-xs font-bold"
              >
                + Add Venue
              </Link>
              <Link
                href="/services/new"
                className="px-4 py-2 rounded-xl bg-gold-500 text-brand-950 text-xs font-bold"
              >
                + Add Service
              </Link>
            </div>
          </div>
        ) : createdRef ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-emerald-950">
              Walk-In Booking {createdRef} Confirmed!
            </h2>
            <p className="text-xs text-emerald-800">
              Slot locked on your Availability Calendar. Redirecting to Booking Management...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-6 text-xs"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Booking Target Type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={venues.length === 0}
                onClick={() => setBookingType("venue")}
                className={`p-3.5 rounded-2xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-40 ${
                  bookingType === "venue"
                    ? "bg-[#380c48] text-white border-[#380c48]"
                    : "bg-[#faf7fb] text-gray-700 border-gray-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Venue Booking ({venues.length})</span>
              </button>

              <button
                type="button"
                disabled={services.length === 0}
                onClick={() => setBookingType("service")}
                className={`p-3.5 rounded-2xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-40 ${
                  bookingType === "service"
                    ? "bg-[#380c48] text-white border-[#380c48]"
                    : "bg-[#faf7fb] text-gray-700 border-gray-200"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Service Booking ({services.length})</span>
              </button>
            </div>

            {/* Listing & Space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookingType === "venue" ? (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Select Venue *</label>
                    <select
                      value={selectedVenueId}
                      onChange={(e) => {
                        const vid = e.target.value;
                        setSelectedVenueId(vid);
                        const v = venues.find((x) => (x._id || x.id) === vid);
                        setSelectedSpaceName(v?.spaces?.[0]?.name || "Main Banquet Hall");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                    >
                      {venues.map((v) => (
                        <option key={v._id || v.id} value={v._id || v.id}>
                          {v.name} (₹{(v.pricing?.pricePerDay || 0).toLocaleString()}/day)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Hall / Space</label>
                    <select
                      value={selectedSpaceName}
                      onChange={(e) => setSelectedSpaceName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                    >
                      {activeVenue?.spaces && activeVenue.spaces.length > 0 ? (
                        activeVenue.spaces.map((sp: any) => (
                          <option key={sp.name} value={sp.name}>
                            {sp.name}
                          </option>
                        ))
                      ) : (
                        <option value="Main Banquet Hall">Main Banquet Hall</option>
                      )}
                    </select>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Select Marketplace Service *
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                  >
                    {services.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.businessName} — {s.category} (₹{(s.startingPrice || 0).toLocaleString()} {s.priceUnit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Time Slot *</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Occasion *</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                >
                  {EVENT_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Expected Guests *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Suresh Shetty"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9845012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>
            </div>

            {/* Payment & Advance */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Offline Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                >
                  <option value="Cash / Offline Advance">Cash / Offline Advance</option>
                  <option value="Direct Desk UPI">Direct Desk UPI</option>
                  <option value="Bank NEFT / IMPS">Bank NEFT / IMPS</option>
                  <option value="Card Terminal (POS)">Card Terminal (POS)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Advance Collected (INR) — Default: ₹{defaultAdvance.toLocaleString("en-IN")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  placeholder={String(defaultAdvance)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Notes / Terms (Optional)</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Walk-in family booking, stage decor included"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#380c48] block">
                  Estimated Total Tariff: ₹{estimatedTotal.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-gray-600">
                  Booking status will be marked <strong>Confirmed</strong> immediately.
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#380c48] hover:bg-[#521369] text-white font-bold shadow-md cursor-pointer disabled:opacity-60"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>{isSubmitting ? "Locking Slot..." : "Confirm Walk-In Booking"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

