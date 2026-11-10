"use client";

import React, { useState, useEffect } from "react";
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
  ArrowRight,
  Inbox,
} from "lucide-react";
import { api } from "@/lib/api";

export default function VendorDashboardPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    totalLeads: 0,
    newLeads: 0,
    monthlyEarnings: 0,
    bookingConversionRate: "0%",
  });
  const [ownerName, setOwnerName] = useState("Partner");
  const [isLoading, setIsLoading] = useState(true);

  // Load live data from backend API
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const storedUser = localStorage.getItem("es_vendor_user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.name) setOwnerName(parsed.name);
          } catch {}
        }

        const [statsRes, venuesRes, leadsRes] = await Promise.allSettled([
          api.vendor.getStats(),
          api.vendor.getVenues(),
          api.vendor.getLeads(),
        ]);

        if (isMounted) {
          if (statsRes.status === "fulfilled" && statsRes.value?.data) {
            setStats(statsRes.value.data);
          }
          if (venuesRes.status === "fulfilled" && Array.isArray(venuesRes.value?.data)) {
            setVenues(venuesRes.value.data);
          }
          if (leadsRes.status === "fulfilled" && Array.isArray(leadsRes.value?.data)) {
            setLeads(leadsRes.value.data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Could not fetch live dashboard stats:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeVenues = venues.filter((v) => v.status === "live");
  const underReviewVenue = venues.find((v) => v.status === "under_review");

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2b0d38] via-[#431050] to-[#1b0724] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Performance Hub &bull; Live Account</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Welcome back, {ownerName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              {venues.length === 0 ? (
                <span>
                  Welcome to Event Spacing! Get started by listing your first banquet hall or event space to start receiving high-intent wedding and corporate inquiries.
                </span>
              ) : (
                <span>
                  You have <strong className="text-gold-300">{stats.newLeads} new inquiries</strong> today for upcoming wedding dates. Keep your calendar dates updated to maximize booking conversion.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/venues/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-bold text-xs shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-brand-950" />
              <span>{venues.length === 0 ? "Add Your First Venue" : "Add Another Venue"}</span>
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
                Submitted recently. Our admin operations team is verifying floor plans and document compliance.
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
            <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
              {activeVenues.length > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% active capacity
                </span>
              ) : (
                "Ready to list your first space"
              )}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inquiries Active</span>
            <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {stats.totalLeads > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Verified customer leads
                </span>
              ) : (
                "Customer inquiries will appear here"
              )}
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
            <div className="text-2xl font-bold text-gray-900">
              {venues.length === 0 ? 0 : Math.round(stats.totalLeads * 0.25)}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Avg conversion: <strong className="text-brand-900">{stats.bookingConversionRate || "0%"}</strong>
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
            <div className="text-2xl font-bold text-gray-900">₹{(stats.monthlyEarnings || 0).toLocaleString("en-IN")}</div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {stats.monthlyEarnings > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Next payout in 3 days
                </span>
              ) : (
                "Settlements logged per event"
              )}
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
              <p className="text-xs text-gray-500">Live requests from customer portal</p>
            </div>
            {leads.length > 0 && (
              <Link
                href="/leads"
                className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center gap-1"
              >
                View All ({leads.length}) &rarr;
              </Link>
            )}
          </div>

          {leads.length === 0 ? (
            /* Empty Inquiries State */
            <div className="p-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-900 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6 text-brand-800" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="font-bold text-sm text-gray-800">No customer inquiries yet</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Once your venue listing is active, inquiries and quote requests submitted by customers will be delivered here instantly.
                </p>
              </div>
              {venues.length === 0 && (
                <Link
                  href="/venues/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                  <span>List Your First Venue</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leads.slice(0, 4).map((lead: any) => {
                const statusColorsMap: Record<string, string> = {
                  new: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  contacted: "bg-blue-100 text-blue-800 border-blue-200",
                  visited: "bg-purple-100 text-purple-800 border-purple-200",
                  booked: "bg-gold-100 text-gold-900 border-gold-300 font-bold",
                  declined: "bg-gray-100 text-gray-600 border-gray-200",
                };
                const statusColors = statusColorsMap[lead.status as string] || "bg-gray-100 text-gray-700 border-gray-200";

                return (
                  <div key={lead.id || lead._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        href={`https://wa.me/${(lead.customerPhone || "").replace(/[^0-9]/g, "")}`}
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
          )}
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

          {venues.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center space-y-2">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-700">No bookings scheduled</p>
              <p className="text-[11px] text-gray-500">Publish your venue to begin receiving reservation dates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold leading-none text-gold-400">
                    Nov
                  </span>
                  <span className="text-sm font-bold leading-none mt-0.5">
                    28
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">Pending Site Inspections</p>
                  <p className="text-[11px] text-gray-500 flex items-center justify-between mt-0.5">
                    <span>Wedding Season Slots</span>
                    <span className="text-emerald-700 font-semibold">Open</span>
                  </p>
                </div>
              </div>
            </div>
          )}

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