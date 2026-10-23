"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  Download,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  CreditCard,
} from "lucide-react";
import { CustomerBooking } from "@/types/venue";

const MOCK_CUSTOMER_BOOKINGS: CustomerBooking[] = [
  {
    id: "BK-8821",
    bookingRef: "ES-BLR-2026-8821",
    venueId: "v-1",
    venueName: "The Royal Grandeur",
    venueCoverImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    locality: "Indiranagar",
    city: "Bengaluru",
    selectedSpaceName: "Grand Imperial Ballroom",
    packageTitle: "FREE VENUE with Royal Catering Plan (350 Pax)",
    eventCategory: "Marriage / Wedding",
    eventDate: "November 18, 2026",
    timeSlot: "Full Day (8 AM - 11 PM)",
    guestCount: 350,
    totalAmount: 402500,
    advancePaid: 120750,
    balanceDue: 281750,
    securityDeposit: 35000,
    status: "confirmed",
    cancellationPolicy: {
      refundableUntilDate: "November 04, 2026 (14 days prior)",
      refundPercentage: 85,
      termsSummary: "85% refund of advance deposit if cancelled 14+ days prior. 50% refund between 7-14 days. Non-refundable under 7 days.",
    },
    customerName: "Suniti & Raghav Rao",
    customerPhone: "+91 98450 12345",
    customerEmail: "raghav.rao@gmail.com",
    createdAt: "October 14, 2026",
  },
  {
    id: "BK-8711",
    bookingRef: "ES-BLR-2026-8711",
    venueId: "v-4",
    venueName: "Grand Palace Banquet",
    venueCoverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    locality: "Koramangala",
    city: "Bengaluru",
    selectedSpaceName: "Main AC Banquet Hall",
    packageTitle: "FREE HALL for Birthday (120 Pax)",
    eventCategory: "Birthday",
    eventDate: "October 12, 2026",
    timeSlot: "Evening Slot (4 PM - 11 PM)",
    guestCount: 120,
    totalAmount: 90000,
    advancePaid: 90000,
    balanceDue: 0,
    securityDeposit: 15000,
    status: "completed",
    cancellationPolicy: {
      refundableUntilDate: "October 01, 2026",
      refundPercentage: 90,
      termsSummary: "Completed event.",
    },
    customerName: "Suniti & Raghav Rao",
    customerPhone: "+91 98450 12345",
    customerEmail: "raghav.rao@gmail.com",
    createdAt: "September 25, 2026",
  },
];

export default function CustomerBookingsPage() {
  const [bookings] = useState<CustomerBooking[]>(MOCK_CUSTOMER_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);

  return (
    <div className="w-full bg-[#fbf9fc] min-h-screen pb-20">
      {/* 1. Header Banner */}
      <div className="bg-brand-950 text-white py-10 px-4 sm:px-8 border-b border-brand-900">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Reservation Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            My Event Bookings & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Track reservation status, download GST digital tax invoices, view slot timings, and inspect cancellation refund terms.
          </p>
        </div>
      </div>

      {/* 2. Bookings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "confirmed";
            const isCompleted = booking.status === "completed";

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
                        <span className="font-mono text-xs font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                          {booking.bookingRef}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {booking.status}
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
                    Free cancellation available until <strong className="text-gray-800">{booking.cancellationPolicy.refundableUntilDate}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        alert(
                          `Downloading digital invoice PDF for booking reference ${booking.bookingRef}. GSTIN: 29AABCP1234F1Z8.`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Invoice PDF</span>
                    </button>

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-5 py-2 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      View Booking Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Details & Cancellation Policy Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
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
                Reference: {selectedBooking.bookingRef}
              </p>
            </div>

            {/* Bill Breakdown */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wider block pb-1 border-b border-gray-200">
                Financial Summary & Invoicing
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
                <span>Cancellation & Refund Policy</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {selectedBooking.cancellationPolicy.termsSummary}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() =>
                  alert(`Invoice #${selectedBooking.bookingRef}.pdf is being downloaded.`)
                }
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md transition-colors"
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
