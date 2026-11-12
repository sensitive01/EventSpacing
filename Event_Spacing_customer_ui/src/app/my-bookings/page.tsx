"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Download,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { CustomerBooking } from "@/types/venue";
import { api } from "@/lib/api";

export default function CustomerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    const redirectToLogin = () => {
      if (!isCancelled) {
        setIsAuthorized(false);
        router.replace("/signin?redirect=/my-bookings");
      }
    };

    const loadBookings = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("es_auth_token") : null;

      if (!token) {
        redirectToLogin();
        return;
      }

      setIsAuthorized(true);
      setIsLoading(true);

      try {
        const res = await api.bookings.getMyBookings();
        if (!isCancelled && res.data) {
          const mapped: CustomerBooking[] = res.data.map((b: any) => ({
            ...b,
            id: b.id || b._id,
          }));
          setBookings(mapped);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        if (err?.status === 401) {
          redirectToLogin();
          return;
        }
        console.warn("Could not fetch user bookings from API:", err);
      }

      if (!isCancelled) {
        setBookings([]);
        setIsLoading(false);
      }
    };

    const handleAuthSync = () => {
      if (typeof window !== "undefined" && !localStorage.getItem("es_auth_token")) {
        redirectToLogin();
      }
    };

    loadBookings();
    window.addEventListener("auth-change", handleAuthSync);
    window.addEventListener("storage", handleAuthSync);

    return () => {
      isCancelled = true;
      window.removeEventListener("auth-change", handleAuthSync);
      window.removeEventListener("storage", handleAuthSync);
    };
  }, [router]);

  const handleCancelBooking = async (booking: CustomerBooking) => {
    if (!confirm(`Are you sure you want to cancel booking ${booking.bookingRef}? Refund terms will apply.`)) {
      return;
    }

    setCancellingId(booking.id);
    setActionSuccess("");

    try {
      await api.bookings.cancel(booking.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
      );
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      }
      setActionSuccess(`Booking ${booking.bookingRef} has been cancelled successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking. Please contact support.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="w-full bg-[#fbf9fc] min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-900 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">
            Redirecting to Sign In...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fbf9fc] min-h-screen pb-20">
      {/* 1. Header Banner */}
      <div className="bg-brand-950 text-white py-10 px-4 sm:px-8 border-b border-brand-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Reservation Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              My Event Bookings &amp; Invoices
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Track reservation status, download GST digital tax invoices, view slot timings, and inspect cancellation refund terms.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      {/* 2. Bookings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft animate-pulse space-y-4"
              >
                <div className="h-20 bg-gray-200 rounded-2xl w-full" />
                <div className="h-12 bg-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
            <Sparkles className="w-12 h-12 text-gold-500 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-gray-900">
              No Active Reservations Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              You haven&apos;t booked any venues yet. Explore top-rated banquet halls, lawns, and conference venues across Bengaluru.
            </p>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-colors"
            >
              <span>Explore Verified Venues</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === "confirmed";
              const isCompleted = booking.status === "completed";
              const isCancelled = booking.status === "cancelled";

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft hover:shadow-card transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={booking.venueCoverImage}
                          alt={booking.venueName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/my-bookings/${booking.id || booking.bookingRef}`}
                            className="font-mono text-xs font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100 hover:bg-brand-100 transition-colors"
                          >
                            {booking.bookingRef}
                          </Link>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isCancelled
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : booking.status === "pending_approval"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {booking.status === "pending_approval" ? "Pending Admin Approval" : booking.status}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-xl text-gray-900">
                          {booking.venueName}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-800" />
                          {booking.locality}, {booking.city}
                          {booking.selectedSpaceName && ` • ${booking.selectedSpaceName}`}
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 pt-0.5">
                          ⭐ {booking.packageTitle}
                        </p>
                      </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="flex flex-wrap items-center lg:flex-col lg:items-end justify-between gap-2 shrink-0">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Package</span>
                        <span className="font-serif text-xl font-bold text-brand-950">
                          ₹{booking.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Advance: <strong className="text-emerald-700">₹{booking.advancePaid.toLocaleString()}</strong>
                        {booking.balanceDue > 0 && (
                          <span> (Due: ₹{booking.balanceDue.toLocaleString()})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Event Schedule Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs">
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gold-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Reserved Date</span>
                        <span className="font-semibold text-gray-900">{booking.eventDate}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-brand-800 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Allocated Slot</span>
                        <span className="font-semibold text-gray-900">{booking.timeSlot}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Security Deposit</span>
                        <span className="font-semibold text-gray-900">₹{booking.securityDeposit.toLocaleString()} (Refundable)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-500">
                      {isCancelled ? (
                        <span className="text-rose-600 font-semibold">Cancelled reservation</span>
                      ) : (
                        <span>
                          Free cancellation available until{" "}
                          <strong className="text-gray-800">{booking.cancellationPolicy?.refundableUntilDate || "14 days prior"}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/my-bookings/${booking.id || booking.bookingRef}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Invoice PDF</span>
                      </Link>

                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Cancel Booking"
                          )}
                        </button>
                      )}

                      <Link
                        href={`/my-bookings/${booking.id || booking.bookingRef}`}
                        className="px-5 py-2 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold shadow-sm transition-colors text-center inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Details & Cancellation Policy Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                Booking Master File
              </span>
              <h2 className="font-serif text-2xl font-bold text-brand-950">
                {selectedBooking.venueName}
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Reference: {selectedBooking.bookingRef} • Status:{" "}
                <span className="capitalize font-bold text-gray-800">{selectedBooking.status}</span>
              </p>
            </div>

            {/* Bill Breakdown */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wider block pb-1 border-b border-gray-200">
                Financial Summary &amp; Invoicing
              </span>
              <div className="flex justify-between text-gray-600">
                <span>Selected Package:</span>
                <span className="font-semibold text-gray-900">{selectedBooking.packageTitle}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Advance Paid:</span>
                <span className="font-bold text-emerald-700">₹{selectedBooking.advancePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Balance Payable at Check-in:</span>
                <span className="font-bold text-brand-950">₹{selectedBooking.balanceDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Refundable Security Deposit:</span>
                <span>₹{selectedBooking.securityDeposit.toLocaleString()}</span>
              </div>
            </div>

            {/* Cancellation & Refund Terms */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Cancellation &amp; Refund Policy</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {selectedBooking.cancellationPolicy?.termsSummary ||
                  "85% refund of advance deposit if cancelled 14+ days prior. Non-refundable under 7 days."}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              {selectedBooking.status === "confirmed" && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking)}
                  disabled={cancellingId === selectedBooking.id}
                  className="px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancellingId === selectedBooking.id ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}
              <button
                onClick={() =>
                  alert(`Invoice #${selectedBooking.bookingRef}.pdf is being downloaded.`)
                }
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gold-400" />
                <span>Download Invoice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
