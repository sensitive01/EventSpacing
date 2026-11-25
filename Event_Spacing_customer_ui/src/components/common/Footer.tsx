"use client";

/**
 * @file Footer.tsx
 * @description Master site footer matching the exact Event Spacing royal brand design with full logo emblem, brand-colored social badges, official app store buttons, and authentic payment trust badges.
 */

import React from "react";
import Link from "next/link";

/**
 * Royal Lotus Crown & Banner Ribbon Logo Emblem for Event Spacing.
 * Recreates the exact gold-bordered royal crest from the reference design.
 */
const RoyalFooterLogo: React.FC = () => {
  return (
    <Link href="/" className="inline-block group" title="Event Spacing Home">
      <div className="flex flex-col items-start select-none">
        <svg
          viewBox="0 0 160 85"
          className="w-36 h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Lotus Petals / Crown */}
          {/* Center Main Petal */}
          <path
            d="M80 8C83 18 89 26 80 34C71 26 77 18 80 8Z"
            fill="url(#goldGradient)"
            stroke="#f5c469"
            strokeWidth="0.8"
          />
          {/* Inner purple glow */}
          <path
            d="M80 12C81.8 19 85.5 24 80 29C74.5 24 78.2 19 80 12Z"
            fill="#5a136b"
          />

          {/* Left Petals */}
          <path
            d="M71 14C78 20 78 28 68 33C64 24 67 17 71 14Z"
            fill="url(#goldGradient)"
            stroke="#f5c469"
            strokeWidth="0.8"
          />
          <path
            d="M71 17C76 21 76 26 69 29C66 23 68 18 71 17Z"
            fill="#7a1c8f"
          />

          <path
            d="M62 21C68 25 66 31 58 34C55 27 58 23 62 21Z"
            fill="url(#goldGradient)"
            stroke="#f5c469"
            strokeWidth="0.8"
          />

          {/* Right Petals */}
          <path
            d="M89 14C82 20 82 28 92 33C96 24 93 17 89 14Z"
            fill="url(#goldGradient)"
            stroke="#f5c469"
            strokeWidth="0.8"
          />
          <path
            d="M89 17C84 21 84 26 91 29C94 23 92 18 89 17Z"
            fill="#7a1c8f"
          />

          <path
            d="M98 21C92 25 94 31 102 34C105 27 102 23 98 21Z"
            fill="url(#goldGradient)"
            stroke="#f5c469"
            strokeWidth="0.8"
          />

          {/* Crown Base Jewels / Dots */}
          <circle cx="80" cy="33" r="2" fill="#ffd57a" />
          <circle cx="71" cy="34" r="1.5" fill="#ffd57a" />
          <circle cx="89" cy="34" r="1.5" fill="#ffd57a" />
          <circle cx="63" cy="35" r="1.2" fill="#ffd57a" />
          <circle cx="97" cy="35" r="1.2" fill="#ffd57a" />

          {/* Main Arched Purple Banner Ribbon */}
          {/* Ribbon Ends Left */}
          <path
            d="M22 47L14 38L28 36L22 47Z"
            fill="#340b43"
            stroke="#e5b14f"
            strokeWidth="0.8"
          />
          <path
            d="M24 53L12 47L22 47L24 53Z"
            fill="#23062d"
            stroke="#c08e30"
            strokeWidth="0.8"
          />

          {/* Ribbon Ends Right */}
          <path
            d="M138 47L146 38L132 36L138 47Z"
            fill="#340b43"
            stroke="#e5b14f"
            strokeWidth="0.8"
          />
          <path
            d="M136 53L148 47L138 47L136 53Z"
            fill="#23062d"
            stroke="#c08e30"
            strokeWidth="0.8"
          />

          {/* Main Center Banner Body */}
          <path
            d="M20 45C50 38 110 38 140 45L134 60C108 54 52 54 26 60L20 45Z"
            fill="url(#bannerGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
          />

          {/* Banner Inner Border */}
          <path
            d="M23 46C51 40 109 40 137 46L132 58C107 53 53 53 28 58L23 46Z"
            stroke="#f5d68b"
            strokeWidth="0.6"
            strokeDasharray="2 1"
          />

          {/* "EVENT" Text in Banner */}
          <text
            x="80"
            y="54"
            fill="#ffffff"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fontFamily="serif"
            letterSpacing="2.5"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
          >
            EVENT
          </text>

          {/* Lower Golden Scroll / Ribbon for "Spacing" */}
          <path
            d="M42 61C65 58 95 58 118 61C112 68 102 70 80 70C58 70 48 68 42 61Z"
            fill="#f7e0a3"
            stroke="#c08e30"
            strokeWidth="0.8"
          />

          {/* "Spacing" Text */}
          <text
            x="80"
            y="67"
            fill="#3a0d4c"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            letterSpacing="1"
          >
            Spacing
          </text>

          {/* Bottom Flourish / Star */}
          <polygon
            points="80,72 81.5,75 85,75.5 82.5,77.5 83,81 80,79 77,81 77.5,77.5 75,75.5 78.5,75"
            fill="#e5b14f"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#faeed9" />
              <stop offset="50%" stopColor="#e5b14f" />
              <stop offset="100%" stopColor="#b37820" />
            </linearGradient>
            <linearGradient id="bannerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a136b" />
              <stop offset="50%" stopColor="#3d0b4a" />
              <stop offset="100%" stopColor="#25052e" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </Link>
  );
};

/**
 * Global Footer component reflecting the exact 5-column layout, authentic social badges, app download pills, and payment badges.
 *
 * @returns React JSX element
 */
export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1e0a29] text-white/80 border-t border-purple-950/60 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10 border-b border-white/10 items-start">
          {/* Column 1: Royal Emblem, Description & Brand-Colored Social Buttons */}
          <div className="space-y-4 lg:pr-2">
            <RoyalFooterLogo />
            <p className="text-xs text-white/70 leading-relaxed max-w-xs">
              Your one-stop platform to find and book event spaces and services
              for weddings, corporate events, parties, get-togethers and more.
            </p>

            {/* Authentic Brand-Colored Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {/* Facebook (Classic Blue) */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#1877F2] hover:opacity-90 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram (Radiant Gradient) */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube (Red) */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#FF0000] hover:opacity-90 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn (Blue) */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#0A66C2] hover:opacity-90 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* X / Twitter (Black/Dark) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#000000] border border-white/20 hover:opacity-90 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="X"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-gold-400 transition-colors">
                  Venues
                </Link>
              </li>
              <li>
                <Link href="/#vendors" className="hover:text-gold-400 transition-colors">
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-gold-400 transition-colors">
                  Corporate
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Vendors */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wide">
              For Vendors
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/list-your-venue" className="hover:text-gold-400 transition-colors">
                  List Your Venue
                </Link>
              </li>
              <li>
                <Link href="/list-your-venue" className="hover:text-gold-400 transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-gold-400 transition-colors"
                >
                  Vendor / Partner Login
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-gold-400 transition-colors">
                  Partner with Us
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-gold-400 transition-colors">
                  Vendor Guidelines
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-gold-400 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wide">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/#faq" className="hover:text-gold-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-gold-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-gold-400 transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/#terms" className="hover:text-gold-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/#privacy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/#refund" className="hover:text-gold-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Download Our App */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wide">
              Download Our App
            </h4>
            <p className="text-[11px] text-white/60">
              Book venues on the go!
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Google Play Official Badge */}
              <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-black/90 border border-white/20 hover:border-gold-400/80 cursor-pointer transition-all shadow-sm w-[172px] group">
                {/* 4-Color Play Triangle Icon */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#00D2FF" d="M3.61 1.814L13.793 12 3.61 22.186a1.75 1.75 0 0 1-.61-1.35V3.164c0-.53.23-.998.61-1.35z" />
                  <path fill="#00F076" d="M17.204 8.589L13.793 12 3.61 1.814c.426-.342 1.03-.426 1.62-.09l11.974 6.865z" />
                  <path fill="#FFD500" d="M20.386 10.414c1.052.603 1.052 2.569 0 3.172l-3.182 1.825L13.793 12l3.411-3.411 3.182 1.825z" />
                  <path fill="#FF3A44" d="M17.204 15.411L5.23 22.276c-.59.336-1.194.252-1.62-.09L13.793 12l3.411 3.411z" />
                </svg>
                <div className="text-left">
                  <div className="text-[8px] uppercase tracking-wider text-white/70 font-semibold leading-tight">
                    GET IT ON
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide leading-tight">
                    Google Play
                  </div>
                </div>
              </div>

              {/* Apple App Store Official Badge */}
              <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-black/90 border border-white/20 hover:border-gold-400/80 cursor-pointer transition-all shadow-sm w-[172px] group">
                {/* Apple Silhouette Icon */}
                <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.68-.83 1.14-1.98 1.01-3.13-.98.04-2.17.65-2.87 1.48-.62.72-1.17 1.89-1.02 3.01 1.09.08 2.2-.53 2.88-1.36z" />
                </svg>
                <div className="text-left">
                  <div className="text-[8px] uppercase tracking-wider text-white/70 font-semibold leading-tight">
                    Download on the
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide leading-tight">
                    App Store
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright on Left | Secure Payment Pills on Right */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          {/* Copyright */}
          <div className="text-white/70 text-xs">
            © 2026 Event Spacing. All Rights Reserved.
          </div>

          {/* Secure Payments Strip with Exact Authentic Logos */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs text-white/70 mr-1.5 font-medium">
              Secure Payments:
            </span>

            {/* 1. Razorpay */}
            <div className="h-6 px-2.5 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="flex items-center gap-0.5 text-[#0c2340] font-black italic text-[11px] tracking-tight">
                <svg className="w-3 h-3.5 fill-[#0770e3]" viewBox="0 0 24 24">
                  <path d="M22.436 0l-11.91 7.773-3.79 9.387 4.793-3.129 1.77-4.383 6.33-4.133-2.074 8.799-6.33 4.133-7.225 4.717 16.436-10.728 2-12.436z" />
                </svg>
                <span className="text-[#0770e3]">Razor</span>
                <span>pay</span>
              </span>
            </div>

            {/* 2. VISA */}
            <div className="h-6 px-2.5 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="text-[#1a1f71] font-black italic text-xs tracking-wider">
                VISA
              </span>
            </div>

            {/* 3. Mastercard */}
            <div className="h-6 px-2.5 bg-white rounded flex items-center justify-center shadow-xs">
              <div className="flex items-center -space-x-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#eb001b]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] mix-blend-multiply opacity-90" />
              </div>
            </div>

            {/* 4. RuPay */}
            <div className="h-6 px-2.5 bg-white rounded flex items-center justify-center shadow-xs">
              <div className="flex items-center gap-0.5 text-xs font-black tracking-tight">
                <span className="text-[#00488f]">Ru</span>
                <span className="text-[#f37021]">Pay</span>
                <span className="w-1.5 h-1.5 bg-[#43a047] transform rotate-45 ml-0.5" />
              </div>
            </div>

            {/* 5. UPI */}
            <div className="h-6 px-2.5 bg-white rounded flex items-center justify-center shadow-xs">
              <div className="flex items-center gap-1 text-[11px] font-black tracking-wider text-[#1e293b]">
                <div className="flex flex-col -space-y-1">
                  <span className="w-2 h-1 bg-[#43a047] rounded-xs transform -skew-x-12" />
                  <span className="w-2 h-1 bg-[#ea580c] rounded-xs transform -skew-x-12" />
                </div>
                <span>UPI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
