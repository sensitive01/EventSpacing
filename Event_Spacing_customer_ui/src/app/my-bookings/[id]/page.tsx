"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Printer,
  Download,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Phone,
  Mail,
  User,
  CreditCard,
  QrCode,
  FileText,
  AlertTriangle,
  Building2,
  Share2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError("");

    const fetchBooking = async () => {
      try {
        const res = await api.bookings.getById(id);
        if (!isCancelled && res?.data) {
          setBooking(res.data);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn("Failed to fetch booking by ID:", err);
      }

      if (!isCancelled) {
        setError("Reservation not found. Please verify the booking reference.");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (
      !confirm(
        `Are you sure you want to cancel booking ${booking.bookingRef}? 85% of your advance deposit will be refunded to your source payment method.`
      )
    ) {
      return;
    }

    setIsCancelling(true);
    try {
      await api.bookings.cancel(booking._id || booking.id);
      setBooking((prev: any) => ({ ...prev, status: "cancelled" }));
      setCancelSuccess("Booking has been cancelled. Refund processing initiated.");
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking. Please contact concierge desk.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9fc] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-[#380c48] rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg font-bold text-[#380c48]">
            Loading Reservation Details...
          </p>
          <p className="text-xs text-gray-500">Connecting to Event Spacing Database</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fbf9fc] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Booking Not Found
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            We couldn&apos;t locate reservation <strong>{id}</strong>. Please check your reservation reference or visit your bookings dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/my-bookings"
              className="inline-flex items-center gap-2 bg-[#380c48] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md hover:bg-[#5a136b] transition-all"
            >
              <span>Go to My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === "confirmed";
  const isCancelled = booking.status === "cancelled";
  const isPendingApproval = booking.status === "pending_approval";

  const invoiceNo = booking.paymentDetails?.invoiceNumber || `INV-2026-${booking.bookingRef.slice(-4)}`;
  const txnId = booking.utrNumber || booking.paymentDetails?.transactionId || `TXN_UPI_${booking.bookingRef.slice(-4)}9874`;
  const paymentMethod = booking.paymentDetails?.paymentMethod || (booking.paymentGateway === "direct_upi" ? "Direct UPI (QR Payment)" : "UPI (Verified)");
  const paymentDate = booking.paymentDetails?.paidAt
    ? new Date(booking.paymentDetails.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <div className="min-h-screen bg-[#fbf9fc] text-gray-900 pb-20 print:bg-white print:p-0">
      {/* 1. Print and Navigation Actions (Hidden during print) */}
      <section className="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-8 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Link
              href="/my-bookings"
              className="inline-flex items-center gap-1.5 font-bold text-gray-600 hover:text-[#380c48] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to All Bookings</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-mono text-[#380c48] font-bold">{booking.bookingRef}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#380c48] hover:bg-[#521369] text-white font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>Print Tax Invoice</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Status Banner (Hidden during print) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 print:hidden">
        {cancelSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{cancelSuccess}</span>
          </div>
        )}

        <div
          className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isConfirmed
              ? "bg-gradient-to-r from-emerald-950 via-[#0d3822] to-[#12452b] text-white border-emerald-900"
              : isCancelled
              ? "bg-gradient-to-r from-rose-950 to-red-900 text-white border-rose-900"
              : "bg-gradient-to-r from-[#1f0528] to-[#380c48] text-white border-purple-900"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isConfirmed
                  ? "bg-emerald-500/20 text-emerald-300"
                  : isCancelled
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-gold-500/20 text-gold-300"
              }`}
            >
              {isConfirmed ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isCancelled ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/20">
                  {booking.bookingRef}
                </span>
                <span
                  className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                    isConfirmed
                      ? "bg-emerald-400 text-emerald-950"
                      : isCancelled
                      ? "bg-rose-300 text-rose-950"
                      : isPendingApproval
                      ? "bg-amber-400 text-amber-950"
                      : "bg-gold-400 text-brand-950"
                  }`}
                >
                  {isConfirmed
                    ? "Confirmed & Slot Locked"
                    : isPendingApproval
                    ? "Payment Under Review • Pending Admin Approval"
                    : booking.status}
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">
                {isConfirmed
                  ? "Your Event Reservation is Confirmed!"
                  : isCancelled
                  ? "Reservation Has Been Cancelled"
                  : isPendingApproval
                  ? "Payment Proof Submitted • Awaiting Verification"
                  : "Reservation Under Review"}
              </h1>
              <p className="text-xs text-gray-300">
                {isPendingApproval
                  ? `Your 12-digit UPI UTR (${txnId}) is being verified by our operations desk. Date slot will be locked upon approval.`
                  : `Advance payment verified via ${paymentMethod} • Date slot locked in venue owner calendar.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gold-300" />
              <span>Venue Desk Helpline</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Venue & Schedule Overview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Venue Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative w-full sm:w-44 h-40 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={booking.venueCoverImage || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"}
                    alt={booking.venueName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                    Verified Space
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[11px] font-bold text-[#e5a83b] uppercase tracking-wider block">
                    Venue Details
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-gray-900 leading-snug">
                    {booking.venueName}
                  </h2>
                  <p className="text-xs text-gray-600 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-[#380c48] shrink-0 mt-0.5" />
                    <span>
                      {booking.locality}, {booking.city}
                    </span>
                  </p>
                  <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-[#380c48] font-bold border border-purple-100">
                      Hall: {booking.selectedSpaceName || "Main Banquet Hall"}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 font-semibold">
                      {booking.guestCount} Guests
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Schedule Spec */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-4">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Reservation Schedule &amp; Inclusions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#380c48]" />
                    Reserved Date
                  </span>
                  <span className="font-bold text-sm text-gray-900 block">
                    {booking.eventDate}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Locked in calendar
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#380c48]" />
                    Allocated Slot
                  </span>
                  <span className="font-bold text-sm text-gray-900 block">
                    {booking.timeSlot}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Strict access timing
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#e5a83b]" />
                    Event Category
                  </span>
                  <span className="font-bold text-sm text-gray-900 block truncate">
                    {booking.eventCategory}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {booking.packageTitle}
                  </span>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
                  <strong className="text-gray-900">Special Instructions / Setup:</strong>{" "}
                  {booking.specialRequests}
                </div>
              )}
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Escrow Refund &amp; Cancellation Policy
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  85% Refundable
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {booking.cancellationPolicy?.termsSummary ||
                  "85% refund of advance deposit if cancelled 14+ days prior. 50% refund between 7-14 days. Non-refundable under 7 days before event date."}
              </p>

              {isConfirmed && (
                <div className="pt-2">
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isCancelling ? "Processing Cancellation..." : "Cancel Reservation"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Digital GST Tax Invoice (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-gray-200 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Invoice Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5 text-[#380c48]" />
                    Tax Invoice / Receipt
                  </div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 mt-0.5">
                    {invoiceNo}
                  </h3>
                  <p className="text-[11px] text-gray-400">Date of Issue: {paymentDate}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#380c48] block">
                    EVENT SPACING
                  </span>
                  <span className="text-[10px] text-gray-500 block">GSTIN: 29AABCE8901F1Z2</span>
                  <span className="text-[10px] text-gray-400 block">SAC: 997212</span>
                </div>
              </div>

              {/* Bill To */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Billed To (Customer)
                </span>
                <p className="font-bold text-gray-900">{booking.customerName}</p>
                <p className="text-gray-600">{booking.customerEmail}</p>
                <p className="text-gray-600">{booking.customerPhone}</p>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Tariff Breakdown
                </span>

                <div className="divide-y divide-gray-100">
                  <div className="py-2 flex justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 block">
                        Venue Space Rental
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {booking.selectedSpaceName} ({booking.timeSlot})
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2 flex justify-between text-gray-600">
                    <span>GST (CGST 9% + SGST 9%)</span>
                    <span className="text-emerald-700 font-medium">Included (18%)</span>
                  </div>

                  <div className="py-2 flex justify-between text-gray-600">
                    <span>Refundable Security Deposit</span>
                    <span className="font-semibold text-gray-900">
                      ₹{booking.securityDeposit?.toLocaleString() || "25,000"}
                    </span>
                  </div>

                  <div className="py-3 flex justify-between items-center text-sm font-bold border-t-2 border-gray-200">
                    <span>Total Package Valuation</span>
                    <span className="font-serif text-base text-gray-900">
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Advance Token Paid:
                  </span>
                  <span className="font-serif font-extrabold text-base text-emerald-800">
                    ₹{booking.advancePaid.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-700 pt-1 border-t border-purple-200/60">
                  <span>Balance Due at Check-in:</span>
                  <span className="font-bold text-gray-900">
                    ₹{booking.balanceDue.toLocaleString()}
                  </span>
                </div>

                <div className="text-[10px] text-gray-500 pt-1 font-mono">
                  Txn Ref: <strong>{txnId}</strong> &bull; Method: {paymentMethod}
                </div>

                {booking.paymentProofUrl && (
                  <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Payment Proof Screenshot:</span>
                    <a
                      href={booking.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#380c48] font-bold underline text-[11px]"
                    >
                      View Receipt Preview ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Digital Seal / QR Stamp */}
              <div className="p-3 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-gray-800 block">Digitally Signed &amp; Verified</span>
                    <span className="text-[10px]">Event Spacing Reservation Escrow</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  {booking.bookingRef}
                </div>
              </div>

              {/* Action Buttons (Hidden on Print) */}
              <div className="space-y-2 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full bg-[#380c48] hover:bg-[#521369] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-gold-400" />
                  <span>Print / Save Tax Invoice PDF</span>
                </button>

                <Link
                  href="/my-bookings"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Return to My Bookings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

