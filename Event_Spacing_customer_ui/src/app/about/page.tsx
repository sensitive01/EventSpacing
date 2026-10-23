"use client";

/**
 * @file about/page.tsx
 * @description Dedicated About Us page for Event Spacing detailing our company story, royal hospitality mission, verified venue standards, leadership team, and pan-India vision.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  Building2,
  HeartHandshake,
  Clock,
  Compass,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";

/**
 * Core statistics highlighting Event Spacing's marketplace scale.
 */
const STATS = [
  { value: "1,500+", label: "Curated Venues", subtext: "Across Bengaluru & tier-1 cities" },
  { value: "50,000+", label: "Happy Celebrations", subtext: "Weddings, offsites & galas" },
  { value: "100%", label: "Physical Verification", subtext: "Strict 40-point quality audit" },
  { value: "4.9 / 5", label: "Organizer Rating", subtext: "From 12,000+ verified reviews" },
];

/**
 * Brand core values guiding Event Spacing's mission.
 */
const VALUES = [
  {
    icon: ShieldCheck,
    title: "Zero Brokerage & Transparency",
    description:
      "We believe celebratory planning shouldn't involve opaque markups. Organizers get direct venue owner prices with comprehensive itemized billing.",
  },
  {
    icon: Award,
    title: "The Royal Quality Standard",
    description:
      "Every banquet hall, lawn, and conference space listed on our platform is personally inspected for safety, backup power, hygienic catering, and acoustic fidelity.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Event Concierge",
    description:
      "Our hospitality specialists assist you with site visits, negotiations, vendor bundling, and day-of coordination at zero additional service charge.",
  },
  {
    icon: Sparkles,
    title: "Tech-Enabled Simplicity",
    description:
      "Real-time availability calendars, virtual 3D venue walkthroughs, and instant multi-vendor quotes designed for the modern planner.",
  },
];

/**
 * Leadership profiles behind the Event Spacing brand.
 */
const TEAM_MEMBERS = [
  {
    name: "Vikramaditya Rao",
    role: "Co-Founder & Chief Executive",
    bio: "Ex-Taj & Marriott luxury hospitality veteran with 15+ years orchestrating high-profile destination weddings and luxury corporate summits across South Asia.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    city: "Bengaluru, India",
  },
  {
    name: "Ananya Deshmukh",
    role: "Co-Founder & Head of Curation",
    bio: "Architect & spatial designer turned venue curator. Passionate about lighting acoustics, heritage restoration, and creating unforgettable spatial aesthetics.",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    city: "Bengaluru, India",
  },
  {
    name: "Siddharth Hegde",
    role: "VP of Venue Partnerships",
    bio: "Leads our ground inspection and vendor ecosystem across Karnataka, Maharashtra, and Telangana, onboarding 80+ elite spaces monthly.",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    city: "Bengaluru, India",
  },
  {
    name: "Pooja Krishnamurthy",
    role: "Head of Customer Experience",
    bio: "Oversees our 7-day concierge desk, ensuring every client inquiry transforms into a seamless, stress-free venue booking experience.",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    city: "Bengaluru, India",
  },
];

/**
 * The 4-step quality guarantee checklist applied to every venue.
 */
const QUALITY_PILLARS = [
  {
    step: "01",
    title: "In-Person Inspection",
    desc: "Our field team physically measures carpet area, checks air conditioning CFM, power backup kilowatts, and kitchen hygiene.",
  },
  {
    step: "02",
    title: "Verified Real Photography",
    desc: "No misleading wide-angle studio renders. We photograph genuine daylight and evening ambiance so what you see is what you get.",
  },
  {
    step: "03",
    title: "Direct Owner Rates",
    desc: "Locked-in tariff sheets guaranteed directly by venue management with GST invoice compliance and no hidden surcharge.",
  },
  {
    step: "04",
    title: "Emergency Contingency",
    desc: "If any operational issue arises, our concierge team steps in with immediate backup options and dedicated escalation support.",
  },
];

/**
 * Dedicated About Us Page Component.
 *
 * @returns React JSX element
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbf9fc] text-gray-900 pb-20">
      {/* 1. Page Header & Royal Hero Section */}
      <section className="relative bg-gradient-to-b from-[#380c48] via-[#2c093a] to-[#20052a] text-white pt-10 pb-20 sm:pb-28 px-4 sm:px-8 overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-medium text-white/70 mb-6">
            <Link href="/" className="hover:text-gold-300 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold-400 font-semibold">About Us</span>
          </nav>

          {/* Hero Content */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>The Event Spacing Story</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-6">
              Crafting Unforgettable Spaces for India&apos;s Greatest Celebrations
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed font-light mb-8">
              Born in Bengaluru, Event Spacing is on a mission to democratize luxury event discovery.
              We unite royal banquet halls, scenic garden lawns, and cutting-edge corporate convention
              centers with transparent pricing and zero middleman friction.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/venues"
                className="bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Explore Verified Venues</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/list-your-venue"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
              >
                List Your Venue With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Showcase Bar */}
      <section className="relative -mt-10 sm:-mt-14 max-w-6xl mx-auto px-4 sm:px-8 z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-100 last:border-0 pb-4 sm:pb-0"
            >
              <div className="font-serif text-2xl sm:text-4xl font-extrabold text-[#380c48] mb-1">
                {stat.value}
              </div>
              <div className="font-bold text-sm text-gray-900 mb-0.5">{stat.label}</div>
              <div className="text-xs text-gray-500 leading-tight">{stat.subtext}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Our Origin Story & Narrative */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Narrative Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#380c48]">
              <Compass className="w-4 h-4 text-gold-600" />
              <span>Who We Are</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-950 leading-snug">
              From a Frustrating Search to India&apos;s Most Trusted Spatial Marketplace
            </h2>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              In 2021, our founders set out to book a venue for a family wedding in Bengaluru.
              What should have been a joyful milestone turned into weeks of unanswered calls,
              hidden broker commissions, misleading photos from 2012, and opaque package rates.
            </p>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We knew there had to be a better way. We built <strong>Event Spacing</strong> to bring
              hospitality-grade standards to event discovery. Every venue on our portal is audited
              in person, photographed realistically, and priced directly with zero hidden markups.
            </p>

            <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">100% Curated &amp; Verified</h4>
                  <p className="text-xs text-gray-500">Every listing inspected by our field team</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Direct Owner Pricing</h4>
                  <p className="text-xs text-gray-500">Zero commission or unexpected brokerage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5]">
              <Image
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"
                alt="Luxury Grandeur Banquet Hall"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-1.5 text-gold-400 mb-1">
                  <Star className="w-4 h-4 fill-gold-400" />
                  <Star className="w-4 h-4 fill-gold-400" />
                  <Star className="w-4 h-4 fill-gold-400" />
                  <Star className="w-4 h-4 fill-gold-400" />
                  <Star className="w-4 h-4 fill-gold-400" />
                </div>
                <div className="text-sm font-bold">The Royal Grandeur, Indiranagar</div>
                <div className="text-xs text-white/80">One of 1,500+ verified partner spaces</div>
              </div>
            </div>

            {/* Overlapping Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-[200px] hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#380c48] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#380c48]">1,500+</div>
                  <div className="text-[11px] text-gray-500 font-medium">Spaces in Karnataka</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Guiding Principles & Core Values */}
      <section className="bg-white py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600 mb-2">
              <Award className="w-4 h-4" />
              <span>Our Core Principles</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950 mb-3">
              Built on Transparency, Trust &amp; Royal Care
            </h2>
            <p className="text-sm text-gray-600">
              We stand apart from generic listing directories by operating as a curated hospitality marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val) => {
              const IconComponent = val.icon;
              return (
                <div
                  key={val.title}
                  className="bg-[#fbf9fc] rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#380c48] text-gold-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">{val.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. The Event Spacing 40-Point Quality Guarantee */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#380c48] mb-2">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>The Event Spacing Seal</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950 mb-3">
            How Every Venue Earns Our Verification Badge
          </h2>
          <p className="text-sm text-gray-600">
            We reject over 35% of venues that apply to our platform. Only those that meet strict hygiene,
            safety, and management integrity benchmarks make the cut.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUALITY_PILLARS.map((item) => (
            <div
              key={item.step}
              className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-serif text-3xl font-extrabold text-gold-500/80 mb-3">
                {item.step}
              </div>
              <h4 className="font-bold text-base text-gray-900 mb-2">{item.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Meet the Leadership & Curators */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600 mb-2">
              <Users className="w-4 h-4" />
              <span>Leadership &amp; Curation</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950 mb-3">
              The Minds Behind the Experience
            </h2>
            <p className="text-sm text-gray-600">
              Passionate hospitality leaders, engineers, and spatial designers dedicated to transforming
              event planning across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="bg-[#fbf9fc] rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative aspect-[4/4.5] overflow-hidden bg-gray-100">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3 text-gold-400" />
                    <span>{member.city}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-[#380c48] transition-colors">
                    {member.name}
                  </h3>
                  <div className="text-xs font-semibold text-gold-600 mb-3">{member.role}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Royal CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 mt-20">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#380c48] via-[#4d115f] to-[#240b2e] text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-300">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Join India&apos;s Elite Event Community</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Ready to Discover Your Next Extraordinary Venue?
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
              Whether you are planning a dream royal wedding, a flagship tech summit, or listing your
              prime property, Event Spacing is here to make it seamless.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/venues"
                className="bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Browse All Venues
              </Link>
              <Link
                href="/corporate"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
              >
                Corporate Offsites &amp; Galas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
