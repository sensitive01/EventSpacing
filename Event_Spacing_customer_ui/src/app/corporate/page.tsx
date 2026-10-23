"use client";

/**
 * @file corporate/page.tsx
 * @description Dedicated Corporate Event Solutions & Venues page for Event Spacing. Tailored for enterprise event planners, HR leads, and executive assistants planning conferences, offsites, annual days, and product launches.
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Building,
  Monitor,
  Wifi,
  FileCheck2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  Star,
  ArrowRight,
  ShieldAlert,
  Coffee,
  Mic,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";
import { MOCK_VENUES } from "@/data/mockVenues";

/**
 * Corporate event categories catered to by Event Spacing.
 */
const CORPORATE_EVENT_TYPES = [
  {
    title: "Conferences & Seminars",
    tagline: "Auditoriums & high-capacity convention halls",
    description: "Multi-track audio-visual stages, high-lumen projection, tiered seating, and dedicated speaker green rooms.",
    capacity: "100 - 2,500 Guests",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Annual Galas & Award Nights",
    tagline: "Grand ballrooms & banquet halls",
    description: "Opulent stages, banquet round-table dining, red carpet arrival, and dynamic lighting rigs for your team celebration.",
    capacity: "250 - 1,800 Guests",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Leadership Offsites & Retreats",
    tagline: "Scenic garden lawns & luxury resort spaces",
    description: "Team-building grounds, breakout zones, infinity poolside lawns, and comfortable overnight executive suites.",
    capacity: "30 - 350 Guests",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Product Launches & Expos",
    tagline: "High-ceiling experiential exhibition arenas",
    description: "Heavy freight access for vehicle or equipment showcases, brand arches, and ultra-high-speed internet for live streaming.",
    capacity: "500 - 3,000 Guests",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Executive Board Meetings",
    tagline: "Ultra-private executive boardrooms",
    description: "Acoustically soundproofed suites with 4K video conferencing, motorized presentation screens, and premium beverage service.",
    capacity: "10 - 45 Guests",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Mixers & Networking Evenings",
    tagline: "Rooftop lounges & open-air decks",
    description: "Panoramic city skylines, gourmet cocktail finger foods, ambient sound, and relaxed lounge furniture layouts.",
    capacity: "50 - 400 Guests",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * Enterprise perks provided exclusively to corporate clients.
 */
const ENTERPRISE_ADVANTAGES = [
  {
    icon: FileCheck2,
    title: "100% GST Invoicing & Compliance",
    description:
      "All bookings are eligible for full input tax credit (ITC) with consolidated enterprise billing, vendor agreements, and formal purchase orders.",
  },
  {
    icon: Users,
    title: "Dedicated Account Concierge",
    description:
      "A senior hospitality coordinator manages your venue shortlisting, recce visits, vendor negotiations, and on-site oversight.",
  },
  {
    icon: Wifi,
    title: "Enterprise Tech Infrastructure",
    description:
      "High-speed leased line internet, dual power backup systems, live-streaming integration, and certified audio-visual sound engineers.",
  },
  {
    icon: Coffee,
    title: "Curated Executive Catering",
    description:
      "Tailored multi-cuisine dining options including continental breakfast buffets, live cooking counters, and executive high-tea arrangements.",
  },
];

/**
 * Frequently asked questions for corporate procurement teams.
 */
const CORPORATE_FAQS = [
  {
    question: "Can we receive consolidated GST invoices for all event expenses?",
    answer:
      "Yes. Event Spacing provides full GST-compliant invoices containing all mandatory company information, making input tax credit (ITC) filing seamless for your finance department.",
  },
  {
    question: "Do you offer flexible corporate payment terms or credit lines?",
    answer:
      "For verified enterprise clients and repeat corporate bookings, we offer standard Net-15 and Net-30 payment terms backed by formal corporate Purchase Orders (PO).",
  },
  {
    question: "Can we schedule site visits (recce) before making a deposit?",
    answer:
      "Absolutely. Our dedicated corporate concierge will accompany your team to inspect venue acoustics, parking capacity, breakout rooms, and kitchen hygiene.",
  },
  {
    question: "Are external tech and production vendors permitted on site?",
    answer:
      "Most of our corporate partner venues allow external production teams, stagefabricators, and branding vendors with zero royalty surcharges when booked through Event Spacing.",
  },
];

/**
 * Dedicated Corporate Event Discovery & Inquiry Page.
 *
 * @returns React JSX element
 */
export default function CorporatePage() {
  // Inquiry Form State
  const [formData, setFormData] = useState({
    companyName: "",
    workEmail: "",
    contactPerson: "",
    phone: "",
    eventType: "Annual Conference",
    estimatedGuests: "150-300",
    targetDate: "",
    localityPreference: "Bengaluru (Any Prime Area)",
    requirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter corporate-ready venues from mock data
  const corporateVenues = MOCK_VENUES.filter((venue) =>
    venue.eventTypes.some((et) =>
      ["Corporate Events", "Get Together", "Presentations"].includes(et)
    )
  ).slice(0, 3);

  /**
   * Handles corporate form input changes.
   *
   * @param e - Input change event
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Submits the corporate RFP inquiry.
   *
   * @param e - Form submission event
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#fbf9fc] text-gray-900 pb-20">
      {/* 1. Page Header & Enterprise Hero Section */}
      <section className="relative bg-gradient-to-b from-[#240b2e] via-[#380c48] to-[#1c0626] text-white pt-10 pb-20 sm:pb-28 px-4 sm:px-8 overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-medium text-white/70 mb-6">
            <Link href="/" className="hover:text-gold-300 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold-400 font-semibold">Corporate Events &amp; Offsites</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs font-bold uppercase tracking-wider mb-5">
                <Briefcase className="w-3.5 h-3.5 text-gold-400" />
                <span>Enterprise Event Solutions</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] mb-6">
                Where India&apos;s Leading Enterprises Gather, Innovate &amp; Celebrate
              </h1>

              <p className="text-base sm:text-lg text-white/80 leading-relaxed font-light mb-8 max-w-xl">
                Curated high-tech convention centres, executive boardrooms, and scenic offsite resorts.
                Complete with 100% GST invoicing, reliable high-speed connectivity, and dedicated event managers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#rfp-form"
                  className="bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Request Corporate Proposal (RFP)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/venues?type=Corporate"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
                >
                  Browse Corporate Venues
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-white/80 font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% GST ITC Compliant
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Brokerage Direct Rates
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Net-30 PO Terms for Enterprises
                </span>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-[4/3] sm:aspect-[4/3.5]">
                <Image
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80"
                  alt="Corporate Summit & Gala"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-block bg-[#e5a83b] text-[#240b2e] text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md mb-2">
                    Verified Enterprise Venue
                  </div>
                  <h3 className="font-serif text-lg font-bold">Summit Convention Centre</h3>
                  <div className="text-xs text-white/80 flex items-center gap-2 mt-1">
                    <span>Whitefield, Bengaluru</span>
                    <span>•</span>
                    <span>Up to 1,200 Pax</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Enterprise Client Trust Ribbon */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            Trusted by Event &amp; HR Leads from Top Tech &amp; Global Enterprises
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            {["Flipkart", "Infosys", "Wipro", "Razorpay", "Swiggy", "Titan", "PhonePe"].map((brand) => (
              <span
                key={brand}
                className="font-serif text-base sm:text-lg font-bold tracking-tight text-gray-800"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Corporate Event Formats & Spaces Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#380c48] mb-2">
            <Layers className="w-4 h-4 text-gold-600" />
            <span>Tailored Spatial Solutions</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950 mb-3">
            Every Corporate Format, Perfectly Accommodated
          </h2>
          <p className="text-sm text-gray-600">
            Whether you need an auditorium for 2,000 engineers or a private heritage villa for leadership strategy,
            find the exact layout your agenda demands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORPORATE_EVENT_TYPES.map((type) => (
            <div
              key={type.title}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  src={type.imageUrl}
                  alt={type.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#380c48] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {type.capacity}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 group-hover:text-[#380c48] transition-colors">
                    {type.title}
                  </h3>
                  <div className="text-xs font-semibold text-gold-600 mb-2">{type.tagline}</div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{type.description}</p>
                </div>

                <Link
                  href={`/venues?type=Corporate`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#380c48] hover:text-gold-600 transition-colors pt-2 border-t border-gray-100"
                >
                  <span>View Suitable Venues</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Enterprise Advantages */}
      <section className="bg-white py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>The Event Spacing Enterprise Edge</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950 mb-3">
              Designed for Enterprise Procurement &amp; Compliance
            </h2>
            <p className="text-sm text-gray-600">
              We eliminate the friction of booking venues for large corporations with centralized vendor onboarding,
              statutory compliance, and dedicated service management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ENTERPRISE_ADVANTAGES.map((adv) => {
              const IconComp = adv.icon;
              return (
                <div
                  key={adv.title}
                  className="bg-[#fbf9fc] rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#380c48] text-gold-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{adv.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Featured Corporate Venues Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#380c48] mb-1">
              Curated Spaces
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">
              Top Corporate Venues in Bengaluru
            </h2>
          </div>
          <Link
            href="/venues?type=Corporate"
            className="text-xs font-bold text-[#380c48] hover:text-gold-600 flex items-center gap-1 transition-colors"
          >
            <span>View All Corporate Venues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {corporateVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  src={venue.coverImage}
                  alt={venue.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 bg-[#380c48] text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  {venue.badge}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                  <span className="font-bold">{venue.rating}</span>
                  <span className="text-[10px] text-white/70">({venue.reviewCount})</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-[#380c48] transition-colors mb-1">
                    {venue.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                    <span>{venue.location.locality}, {venue.location.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Starting at</div>
                    <div className="font-extrabold text-[#380c48] text-sm">
                      ₹{venue.pricing.pricePerDay.toLocaleString("en-IN")}
                      <span className="text-[10px] text-gray-500 font-normal"> /day</span>
                    </div>
                  </div>
                  <a
                    href="#rfp-form"
                    className="bg-[#380c48] hover:bg-[#5a136b] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
                  >
                    Inquire
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Corporate RFP & Event Inquiry Form */}
      <section id="rfp-form" className="max-w-4xl mx-auto px-4 sm:px-8 py-10 scroll-mt-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-100">
          <div className="max-w-xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600 mb-2">
              <Mail className="w-4 h-4" />
              <span>Fast-Track Corporate Inquiries</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950 mb-2">
              Submit an RFP / Venue Request
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Our enterprise hospitality manager will curate 3 tailored venue options and provide complete
              quotations within 4 business hours.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-emerald-950">
                Corporate Inquiry Received!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.contactPerson}</strong>. Our corporate concierge desk has received
                your request for <strong>{formData.companyName}</strong>. A dedicated manager will reach out to
                <strong> {formData.workEmail}</strong> shortly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="inline-block mt-4 bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-900 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Technologies India Pvt Ltd"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. rahul@company.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="e.g. Anjali Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                  >
                    <option value="Annual Conference">Annual Conference</option>
                    <option value="Team Offsite / Retreat">Team Offsite / Retreat</option>
                    <option value="Award Gala / Annual Night">Award Gala / Annual Night</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Executive Board Meeting">Executive Board Meeting</option>
                    <option value="Networking Cocktail Mixer">Networking Cocktail Mixer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estimated Guests
                  </label>
                  <select
                    name="estimatedGuests"
                    value={formData.estimatedGuests}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                  >
                    <option value="20-50">20 - 50 Guests</option>
                    <option value="50-150">50 - 150 Guests</option>
                    <option value="150-300">150 - 300 Guests</option>
                    <option value="300-800">300 - 800 Guests</option>
                    <option value="800+">800+ Mega Convention</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Target Date / Month
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Specific Requirements / Agenda Notes
                </label>
                <textarea
                  rows={3}
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="e.g. Need 2 breakout rooms, projector screen, cocktail dinner, GST invoice required."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#380c48] hover:bg-[#2b0837] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Corporate RFP"}</span>
                <Send className="w-4 h-4 text-gold-400" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 7. Corporate FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950 mb-2">
            Frequently Asked Corporate Questions
          </h2>
          <p className="text-xs text-gray-600">
            Everything your finance, legal, and HR teams need to know about booking with us.
          </p>
        </div>

        <div className="space-y-4">
          {CORPORATE_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs"
            >
              <h3 className="font-bold text-sm text-gray-900 mb-1.5 flex items-start gap-2">
                <span className="text-gold-600 font-extrabold">Q.</span>
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-gray-600 pl-5 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
