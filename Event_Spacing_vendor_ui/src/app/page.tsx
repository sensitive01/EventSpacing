"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  TrendingUp,
  IndianRupee,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  PlusCircle,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  vendorVenuesList,
  vendorLeadsList,
  currentVendorProfile,
  mockCalendarDates,
} from "@/data/mockVendorData";

export default function VendorDashboardPage() {
  const activeVenues = vendorVenuesList.filter((v) => v.status === "live");
  const underReviewVenue = vendorVenuesList.find((v) => v.status === "under_review");

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2b0d38] via-[#431050] to-[#1b0724] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Performance Hub</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Welcome back, {currentVendorProfile.ownerName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              You have <strong className="text-gold-300">3 new inquiries</strong> today for upcoming wedding dates. Keep your calendar dates updated to increase booking conversion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/venues/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-bold text-xs shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-brand-950" />
              <span>Add Another Venue</span>
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-gold-300" />
              <span>Manage Availability</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-24 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Verification Alert Banner if any venue under review */}
      {underReviewVenue && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Verification in Progress: &ldquo;{underReviewVenue.name}&rdquo;
              </p>
              <p className="text-[11px] text-amber-700">
                Submitted 18 hours ago. Our admin operations team is verifying the floor plans and municipal NOC documents.
              </p>
            </div>
          </div>
          <Link
            href="/venues"
            className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0 self-start sm:self-auto"
          >
            Track Status &rarr;
          </Link>
        </div>
      )}

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Venues</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{activeVenues.length}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% active operational capacity
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inquiries This Month</span>
            <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">71</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% vs last month
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirmed Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">18</div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Avg conversion: <strong className="text-brand-900">68%</strong>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">₹8,25,000</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Next payout in 3 days
            </p>
          </div>
        </div>
      </div>

      {/* 4. Two Column Section: Recent Leads & Calendar Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Recent Inquiries */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">Recent Customer Inquiries</h2>
              <p className="text-xs text-gray-500">Customer requests directly routed to your property coordinators</p>
            </div>
            <Link
              href="/leads"
              className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center gap-1"
            >
              View All (5) &rarr;
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {vendorLeadsList.slice(0, 4).map((lead) => {
              const statusColors = {
                new: "bg-emerald-100 text-emerald-800 border-emerald-200",
                contacted: "bg-blue-100 text-blue-800 border-blue-200",
                visited: "bg-purple-100 text-purple-800 border-purple-200",
                booked: "bg-gold-100 text-gold-900 border-gold-300 font-bold",
                declined: "bg-gray-100 text-gray-600 border-gray-200",
              }[lead.status];

              return (
                <div key={lead.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{lead.customerName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors} uppercase`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>🏛️ {lead.venueName}</span>
                      <span>📅 {lead.eventDate} ({lead.eventType})</span>
                      <span>👥 {lead.guestCount} Guests</span>
                      <span>💰 Budget: {lead.budget}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Call customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="WhatsApp customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <Link
                      href="/leads"
                      className="px-3 py-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Upcoming Booked Dates Preview */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-soft space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">Upcoming Bookings</h2>
              <p className="text-xs text-gray-500">Confirmed dates on your calendar</p>
            </div>
            <Link href="/calendar" className="text-xs font-bold text-brand-800 hover:text-brand-950">
              Calendar &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {mockCalendarDates
              .filter((d) => d.status === "booked")
              .slice(0, 4)
              .map((b) => (
                <div key={b.date} className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold leading-none text-gold-400">
                      {new Date(b.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-sm font-bold leading-none mt-0.5">
                      {new Date(b.date).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{b.bookedBy}</p>
                    <p className="text-[11px] text-gray-500 flex items-center justify-between mt-0.5">
                      <span>Booking #{b.bookingRef}</span>
                      <span className="text-emerald-700 font-semibold">Confirmed</span>
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/calendar"
              className="w-full py-2.5 rounded-xl border border-dashed border-brand-300 text-brand-800 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-brand-50 transition-colors"
            >
              <span>Block Maintenance or Holiday Dates</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
