"use client";

/**
 * @file list-your-venue/page.tsx
 * @description Partner Onboarding Gateway page for Event Spacing.
 * Directs venue owners and banquet managers to the dedicated Vendor Partner Hub (:3001).
 */

import React from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  Users2,
  BadgeIndianRupee,
  Clock,
} from "lucide-react";

export default function ListYourVenueGatewayPage() {
  const vendorHubUrl =
    process.env.NEXT_PUBLIC_VENDOR_HUB_URL || "http://localhost:3001";

  const benefits = [
    {
      icon: <BadgeIndianRupee className="w-6 h-6 text-[#e5a83b]" />,
      title: "0% Initial Listing Fee",
      desc: "Join India's premier luxury event network with zero upfront setup fees or listing charges.",
    },
    {
      icon: <Users2 className="w-6 h-6 text-[#e5a83b]" />,
      title: "High-Budget Event Leads",
      desc: "Connect directly with corporate event organizers, luxury wedding planners, and verified clients.",
    },
    {
      icon: <CalendarCheck2 className="w-6 h-6 text-[#e5a83b]" />,
      title: "Live Slot & Calendar Control",
      desc: "Prevent double-bookings with full control over dates, morning/evening slots, and pricing packages.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#e5a83b]" />,
      title: "Guaranteed Advance Payouts",
      desc: "Receive prompt advance payments for confirmed reservations directly into your registered bank account.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#e5a83b]" />,
      title: "Search & Brand Visibility",
      desc: "Showcase your halls with high-res photos, 360° virtual tours, capacity filters, and catering menus.",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#e5a83b]" />,
      title: "24/7 Dedicated Support",
      desc: "Get personalized concierge assistance for onboarding your spaces, menus, and amenities.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Sign in to Vendor Hub",
      desc: "Create or log into your dedicated Vendor Partner account via OTP authentication.",
    },
    {
      step: "02",
      title: "Configure Venue & Spaces",
      desc: "Add your banquet spaces, guest capacity, pricing plans, amenities, and gallery photos.",
    },
    {
      step: "03",
      title: "Publish & Go Live",
      desc: "Admin verification completes within 24 hours. Start receiving booking requests and leads.",
    },
  ];

  return (
    <div className="w-full bg-[#fcfbfe] min-h-screen text-gray-900 pb-24">
      {/* 1. Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#240b2e] via-[#380c48] to-[#1a0522] text-white pt-14 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#e5a83b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#e5a83b]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Vendor Partner Network</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            List Your Venue with <span className="text-[#e5a83b]">Event Spacing</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-purple-100/90 leading-relaxed">
            Venues are listed, managed, and scheduled exclusively through our dedicated{" "}
            <strong className="text-white font-semibold">Vendor Partner Hub</strong>.
            Reach thousands of verified corporate clients and luxury hosts today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${vendorHubUrl}/signin`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              <span>Launch Vendor Partner Hub (Port 3001)</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="tel:+919876543210"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all"
            >
              <Phone className="w-4 h-4 text-[#e5a83b]" />
              <span>Call Partner Concierge</span>
            </a>
          </div>

          <p className="text-xs text-purple-200/70 pt-2">
            Already have a vendor account? Sign in directly on Port 3001 to manage your active listings.
          </p>
        </div>
      </section>

      {/* 2. Notice Box (Explaining Customer vs Vendor Separation) */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#380c48] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Role &amp; Security Isolation Notice
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Venue creation requires a verified Vendor account. If you are signed in as a Customer, please access the Partner Hub to register or log in as a Vendor operator.
              </p>
            </div>
          </div>
          <a
            href={`${vendorHubUrl}/signin`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#380c48] hover:bg-[#5a136b] text-white text-xs font-bold transition-colors"
          >
            <span>Open Vendor Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* 3. Partner Benefits Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold text-gold-600 tracking-wider">
            Why Host With Us
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Everything You Need to Scale Your Venue Business
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            From high-budget corporate retreats to destination weddings, Event Spacing gives you the tools to maximize your hall occupancy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50/80 flex items-center justify-center">
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base">{b.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 3-Step Simple Listing Flow */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-20">
        <div className="rounded-3xl bg-gradient-to-r from-purple-50 to-amber-50/40 p-8 sm:p-12 border border-purple-100/60">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold text-[#380c48] tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              How Listing Your Venue Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="space-y-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <span className="font-mono text-2xl font-black text-[#e5a83b]">
                  {s.step}
                </span>
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href={`${vendorHubUrl}/signin`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#380c48] hover:bg-[#5a136b] text-white font-bold text-sm shadow-md transition-all"
            >
              <span>Get Started on Vendor Partner Hub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. Concierge & Support Footer Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-16">
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dedicated venue onboarding assistance available 7 days a week</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="mailto:partners@eventspacing.com"
              className="hover:text-[#380c48] flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#e5a83b]" />
              <span>partners@eventspacing.com</span>
            </a>
            <span>•</span>
            <a
              href="tel:+919876543210"
              className="hover:text-[#380c48] flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#e5a83b]" />
              <span>+91 98765 43210</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
