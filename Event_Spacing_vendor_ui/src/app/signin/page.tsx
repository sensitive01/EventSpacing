"use client";

/**
 * @file signin/page.tsx
 * @description Dedicated Partner Sign-In and Onboarding Portal for Event Spacing Venue Owners and Event Vendors.
 * Features Indian mobile OTP verification, Business Email & Password authentication, demo account switches, and fast onboarding registration.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Wallet,
  Star,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BadgePercent,
  Check,
} from "lucide-react";
import { currentVendorProfile } from "@/data/mockVendorData";

type AuthMode = "signin" | "register";
type LoginMethod = "phone" | "email";

export default function VendorSignInPage() {
  const router = useRouter();

  // Mode and tab states
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");

  // Phone OTP Flow States
  const [phoneNumber, setPhoneNumber] = useState("9845012345");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);

  // Email / Password Form States
  const [email, setEmail] = useState("partner@prestigevenues.com");
  const [password, setPassword] = useState("PrestigePartner2026!");
  const [fullName, setFullName] = useState("Vikramaditya Rao");
  const [businessName, setBusinessName] = useState("Prestige Hospitality & Banquets");
  const [gstNumber, setGstNumber] = useState("29AABCP1234F1Z8");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Submission / feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  /**
   * Handles individual OTP digit inputs with auto-advancing focus.
   */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance to next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`vendor-otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  /**
   * Handles backspace key navigation between OTP input boxes.
   */
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`vendor-otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  /**
   * Sends or resends mock OTP code to the provided mobile number.
   */
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (phoneNumber.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setCountdown(30);
      setOtpDigits(["4", "8", "1", "9", "2", "0"]); // pre-fill mock demo OTP for instant convenience
    }, 600);
  };

  /**
   * Verifies OTP code and simulates vendor sign-in.
   */
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join("");
    if (enteredCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }, 700);
  };

  /**
   * Handles Email & Password submission.
   */
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please provide your partner email address and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }, 700);
  };

  /**
   * Fills demo credentials for rapid testing and evaluation.
   */
  const fillDemoAccount = (accountType: "prestige" | "glasshouse") => {
    setAuthMode("signin");
    setLoginMethod("email");
    setErrorMessage("");
    if (accountType === "prestige") {
      setFullName("Vikramaditya Rao");
      setBusinessName("Prestige Hospitality & Banquets");
      setEmail("partner@prestigevenues.com");
      setPassword("PrestigePartner2026!");
      setPhoneNumber("9845012345");
    } else {
      setFullName("Suhasini Mehta");
      setBusinessName("Silver Oaks Glasshouse & Retreats");
      setEmail("suhasini@silveroaksretreats.in");
      setPassword("SilverOaksHost2026!");
      setPhoneNumber("9740066789");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7fb] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Cross-Portal Navigation Bar */}
      <div className="max-w-6xl mx-auto w-full mb-4 flex items-center justify-between text-xs text-gray-500">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-bold text-brand-900 hover:text-gold-600 transition-colors"
        >
          <div className="w-6 h-6 rounded-lg bg-brand-900 text-gold-400 flex items-center justify-center font-serif text-xs font-black">
            ES
          </div>
          <span className="font-serif text-sm font-bold text-brand-950">Event Spacing</span>
          <span className="text-[11px] font-sans font-medium text-gold-600 bg-gold-100/70 px-2 py-0.5 rounded-full">
            Partner Hub
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 hover:text-brand-900 transition-colors"
          >
            <span>Customer Discovery</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
          <span className="hidden sm:block text-gray-300">•</span>
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gold-700 font-medium hover:underline"
          >
            <span>Admin Control Deck</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="max-w-6xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-brand-900/10 grid grid-cols-1 lg:grid-cols-12">
        {/* 1. Left Editorial Brand & Partner Benefits Showcase */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-[#21092c] via-[#2d0d3a] to-[#16041f] text-white p-10 flex-col justify-between overflow-hidden">
          {/* Subtle Lighting Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-500 to-amber-300 flex items-center justify-center text-brand-950 font-bold shadow-lg">
                <Sparkles className="w-5 h-5 text-brand-950" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-wide text-white block leading-tight">
                  Event Spacing
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">
                  Vendor &amp; Host Hub
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Venue Partner Network</span>
            </div>
          </div>

          {/* Center Value Proposition */}
          <div className="relative z-10 my-6 space-y-6">
            <h2 className="font-serif text-3xl font-extrabold text-white leading-tight">
              Grow Your Venue Bookings with Direct Host Leads
            </h2>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-300 shrink-0 mt-0.5">
                  <BadgePercent className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">0% Brokerage on Direct Booking Leads</h4>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Connect directly with wedding families, corporate planners, and event organizers without middlemen fees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-300 shrink-0 mt-0.5">
                  <CalendarDays className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Calendar &amp; Multi-Hall Slot Manager</h4>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Instantly toggle morning vs evening slots, mark peak wedding muhurtham dates, and sync schedules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-300 shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant UPI &amp; Escrow Payout Settlements</h4>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Receive automated 30% advance deposits directly to your registered bank account upon booking confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-1 text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold-400" />
                ))}
              </div>
              <p className="text-xs text-white/90 italic leading-relaxed">
                &ldquo;Event Spacing transformed our banquet occupancy. We generated over 42 qualified leads for wedding receptions in just the first two months!&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="font-bold text-gold-300">Vikramaditya Rao</span>
                <span className="text-[11px] text-white/60">The Royal Crystal Palace</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics */}
          <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-serif text-lg font-bold text-gold-300">₹14.2M+</div>
              <div className="text-[10px] text-white/70">Processed GMV</div>
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-gold-300">148+</div>
              <div className="text-[10px] text-white/70">Live Venues</div>
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-gold-300">99.4%</div>
              <div className="text-[10px] text-white/70">On-Time Payouts</div>
            </div>
          </div>
        </div>

        {/* 2. Right Interactive Authentication Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Switch Mode Header: Sign In vs Register Venue */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 block">
                  Vendor Partner Access
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">
                  {authMode === "signin" ? "Sign In to Vendor Hub" : "Register Your Event Venue"}
                </h1>
              </div>

              <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMessage("");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    authMode === "signin"
                      ? "bg-brand-900 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMessage("");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    authMode === "register"
                      ? "bg-brand-900 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Subtitle description */}
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {authMode === "signin"
                ? "Enter your registered Indian mobile number or official business email to access your listings, leads, and earnings."
                : "Join Bengaluru's premier event space network. Complete KYC once and start receiving customer inquiries."}
            </p>

            {/* Authentication Method Tabs: Mobile OTP vs Email & Password */}
            <div className="flex items-center gap-6 border-b border-gray-100 mb-6 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("phone");
                  setErrorMessage("");
                }}
                className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                  loginMethod === "phone"
                    ? "border-brand-900 text-brand-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <Phone className="w-4 h-4 text-gold-600" />
                <span>Mobile OTP (India +91)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod("email");
                  setErrorMessage("");
                }}
                className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                  loginMethod === "email"
                    ? "border-brand-900 text-brand-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <Mail className="w-4 h-4 text-gold-600" />
                <span>Partner Email &amp; Password</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <span className="font-bold">•</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Celebration Overlay */}
            {authSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-emerald-950">
                  Welcome to Your Partner Hub!
                </h3>
                <p className="text-xs text-emerald-800">
                  Authenticated successfully as{" "}
                  <strong className="text-emerald-950">{fullName}</strong> ({businessName}). Loading your dashboard...
                </p>
                <div className="w-48 h-1.5 bg-emerald-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            ) : loginMethod === "phone" ? (
              /* ================= Phone OTP Form Flow ================= */
              !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {authMode === "register" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Owner / Manager Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Vikramaditya Rao"
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Venue or Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Prestige Banquets & Palace"
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Registered Mobile Number *
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-200 focus-within:border-brand-900 bg-white overflow-hidden shadow-xs">
                      <div className="flex items-center gap-1.5 px-3.5 py-3 bg-gray-50 border-r border-gray-200 text-xs font-bold text-gray-700 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="98450 12345"
                        className="w-full text-xs px-3.5 py-3 focus:outline-none tracking-wider font-semibold text-gray-900"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      We will send an instant 6-digit authentication code via SMS and WhatsApp.
                    </p>
                  </div>

                  {authMode === "register" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        GSTIN / PAN (Optional during signup)
                      </label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="29AABCP1234F1Z8"
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white uppercase font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2b0d38] hover:bg-[#1f0729] text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <span>{isLoading ? "Dispatching OTP..." : "Get One-Time Verification Code"}</span>
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex items-center justify-between text-xs text-gray-600 bg-brand-50 p-3.5 rounded-xl border border-brand-200">
                    <div>
                      <span>Verification code sent to </span>
                      <strong className="text-brand-950 font-bold">+91 {phoneNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs font-bold text-brand-900 hover:text-gold-600 underline"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2.5 text-center">
                      Enter 6-Digit Partner Security Code
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`vendor-otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 focus:ring-2 focus:ring-brand-200 transition-all text-brand-950 bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Timer */}
                  <div className="text-center text-xs text-gray-500">
                    {countdown > 0 ? (
                      <span>Resend code in <strong className="text-brand-900 font-bold">{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-brand-900 hover:text-gold-600 flex items-center gap-1.5 mx-auto transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend OTP Code</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#d49b2c] hover:bg-[#be811f] text-brand-950 font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <span>{isLoading ? "Verifying..." : "Verify & Access Vendor Hub"}</span>
                    <CheckCircle2 className="w-4 h-4 text-brand-950" />
                  </button>
                </form>
              )
            ) : (
              /* ================= Email & Password Form Flow ================= */
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === "register" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Owner / Manager Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Vikramaditya Rao"
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Venue or Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Prestige Hospitality"
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registered Business Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="partner@prestigevenues.com"
                      className="w-full text-xs pl-3.5 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Security Password *</label>
                    {authMode === "signin" && (
                      <button
                        type="button"
                        onClick={() => alert("Password reset link dispatched to your registered email.")}
                        className="text-[11px] font-bold text-brand-900 hover:text-gold-600 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs pl-3.5 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 absolute right-3.5 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-brand-900 focus:ring-brand-900"
                    />
                    <span>Keep me logged in on this computer</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2b0d38] hover:bg-[#1f0729] text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>
                    {isLoading
                      ? "Authenticating..."
                      : authMode === "signin"
                      ? "Sign In to Vendor Hub"
                      : "Create Partner Account"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </button>
              </form>
            )}

            {/* Quick Demo Accounts for Immediate Review */}
            <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500 font-semibold">1-Click Demo Partner Accounts:</span>
                <span className="text-[10px] text-gray-400">Click to prefill credentials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("prestige")}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/60 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-brand-950">Vikramaditya Rao</p>
                    <p className="text-[10px] text-brand-700">Prestige Hospitality (Indiranagar)</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-600" />
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("glasshouse")}
                  className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-amber-950">Suhasini Mehta</p>
                    <p className="text-[10px] text-amber-800">Silver Oaks Glasshouse (Whitefield)</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Compliance Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Looking for venue discovery instead?</span>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="text-brand-900 font-bold hover:underline inline-flex items-center gap-1"
              >
                Go to Customer Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-2 border-t border-gray-50">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>GST Compliant &amp; Bank Escrow Protected</span>
              </span>
              <span>256-Bit SSL Encrypted Partner Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
