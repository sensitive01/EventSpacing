"use client";

/**
 * @file signin/page.tsx
 * @description Dedicated Sign In & Authentication page for Event Spacing. Supports Indian mobile OTP verification, email/password login, Google/Apple social sign-in, account type switching (Organizer vs Venue Partner), and registration toggle.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  Star,
  RefreshCw,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";

type AuthMode = "signin" | "signup";
type LoginMethod = "phone" | "email";
type UserRole = "organizer" | "partner";

/**
 * Sign In page component with dual authentication methods and responsive split-screen layout.
 *
 * @returns React JSX element
 */
export default function SignInPage() {
  const router = useRouter();

  // Mode and tab states
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [userRole, setUserRole] = useState<UserRole>("organizer");

  // Phone OTP Flow States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);

  // Email / Password Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
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
   *
   * @param index - Position in OTP array (0-5)
   * @param value - Entered digit character
   */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance to next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  /**
   * Handles backspace key navigation between OTP input boxes.
   *
   * @param index - Current index
   * @param e - Keyboard event
   */
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  /**
   * Sends or resends mock OTP code to the provided mobile number.
   *
   * @param e - Form or button click event
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
      setOtpDigits(["", "", "", "", "", ""]);
    }, 600);
  };

  /**
   * Verifies OTP code and simulates user sign-in.
   *
   * @param e - Form submission event
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
        router.push(userRole === "partner" ? "/list-your-venue" : "/venues");
      }, 1500);
    }, 800);
  };

  /**
   * Handles Email & Password submission.
   *
   * @param e - Form event
   */
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please provide both email address and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push(userRole === "partner" ? "/list-your-venue" : "/venues");
      }, 1500);
    }, 800);
  };

  /**
   * Fills demo credentials for quick preview.
   *
   * @param role - Target demo role
   */
  const fillDemoCredentials = (role: UserRole) => {
    setUserRole(role);
    setLoginMethod("email");
    setAuthMode("signin");
    if (role === "organizer") {
      setEmail("organizer.demo@eventspacing.com");
      setPassword("RoyalCelebration2026!");
    } else {
      setEmail("venue.manager@royalgrandeur.com");
      setPassword("PartnerAccess2026!");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9fc] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-12">
        {/* 1. Left Editorial Brand Showcase (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-[#380c48] via-[#2a0737] to-[#1a0322] text-white p-10 flex-col justify-between overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>India&apos;s Royal Venue Network</span>
            </div>
          </div>

          {/* Center Visual & Value Proposition */}
          <div className="relative z-10 my-8 space-y-6">
            <h2 className="font-serif text-3xl font-extrabold text-white leading-tight">
              Unlock Direct Owner Rates for 1,500+ Verified Event Spaces
            </h2>

            <p className="text-sm text-white/80 leading-relaxed font-light">
              One account gives you access to book banquet halls, garden lawns, conference auditoriums,
              and premier wedding caterers with 100% price transparency and zero hidden brokerage.
            </p>

            {/* Testimonial Quote */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-gold-400">
                <Star className="w-4 h-4 fill-gold-400" />
                <Star className="w-4 h-4 fill-gold-400" />
                <Star className="w-4 h-4 fill-gold-400" />
                <Star className="w-4 h-4 fill-gold-400" />
                <Star className="w-4 h-4 fill-gold-400" />
              </div>
              <p className="text-xs text-white/90 italic leading-relaxed">
                &ldquo;Event Spacing helped us lock our dream banquet hall in Indiranagar in less than 24 hours.
                Direct owner pricing saved our family over ₹1.5 Lakhs!&rdquo;
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-gold-300">
                <span>Ananya &amp; Rahul Sharma</span>
                <span className="text-white/40">•</span>
                <span className="text-white/70 font-normal">Bengaluru</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics */}
          <div className="relative z-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-serif text-xl font-bold text-gold-300">1,500+</div>
              <div className="text-[11px] text-white/70">Curated Venues</div>
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-gold-300">0%</div>
              <div className="text-[11px] text-white/70">Brokerage Fees</div>
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-gold-300">4.9 / 5</div>
              <div className="text-[11px] text-white/70">User Rating</div>
            </div>
          </div>
        </div>

        {/* 2. Right Interactive Authentication Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          {/* Mobile Top Brand Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
            <Logo size="md" />
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-[#380c48]"
            >
              Back to Home
            </Link>
          </div>

          <div>
            {/* Account Role Selector: Organizer vs Venue Partner */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Signing In As
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#fbf9fc] p-1.5 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setUserRole("organizer")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    userRole === "organizer"
                      ? "bg-[#380c48] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Event Organizer / Host</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserRole("partner")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    userRole === "partner"
                      ? "bg-[#380c48] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Venue Owner / Vendor</span>
                </button>
              </div>
            </div>

            {/* Header Title */}
            <div className="mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950 mb-1.5">
                {authMode === "signin"
                  ? userRole === "organizer"
                    ? "Welcome Back, Organizer"
                    : "Venue Partner Portal"
                  : userRole === "organizer"
                  ? "Create Your Host Account"
                  : "Register as a Venue Partner"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {authMode === "signin"
                  ? "Enter your credentials or verify via mobile OTP to continue."
                  : "Join thousands of planners and venues across Bengaluru."}
              </p>
            </div>

            {/* Authentication Method Tabs: Phone OTP vs Email */}
            <div className="flex items-center gap-4 border-b border-gray-100 mb-6 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("phone");
                  setErrorMessage("");
                }}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
                  loginMethod === "phone"
                    ? "border-[#380c48] text-[#380c48]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile OTP (India)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod("email");
                  setErrorMessage("");
                }}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
                  loginMethod === "email"
                    ? "border-[#380c48] text-[#380c48]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email &amp; Password</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Success Celebration Overlay */}
            {authSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-emerald-950">
                  Authentication Successful!
                </h3>
                <p className="text-xs text-emerald-800">
                  Redirecting to your {userRole === "partner" ? "Partner Dashboard" : "Event Portal"}...
                </p>
              </div>
            ) : loginMethod === "phone" ? (
              /* ================= Phone OTP Form Flow ================= */
              !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {authMode === "signup" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Vikramaditya Rao"
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Indian Mobile Number *
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-200 focus-within:border-[#380c48] bg-white overflow-hidden">
                      <div className="flex items-center gap-1 px-3 py-3 bg-gray-50 border-r border-gray-200 text-xs font-bold text-gray-700 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="98765 43210"
                        className="w-full text-xs px-3.5 py-3 focus:outline-none tracking-wider font-medium text-gray-900"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      We will send an instant 6-digit OTP via SMS / WhatsApp.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#380c48] hover:bg-[#2b0837] text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <span>{isLoading ? "Sending OTP..." : "Get Verification Code"}</span>
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex items-center justify-between text-xs text-gray-600 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                    <div>
                      <span>Code sent to </span>
                      <strong className="text-gray-900 font-bold">+91 {phoneNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs font-bold text-[#380c48] hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Timer */}
                  <div className="text-center text-xs text-gray-500">
                    {countdown > 0 ? (
                      <span>Resend OTP in <strong>{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-[#380c48] hover:underline flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend OTP Code</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <span>{isLoading ? "Verifying..." : "Verify & Sign In"}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )
            ) : (
              /* ================= Email & Password Form Flow ================= */
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Vikramaditya Rao"
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                      />
                    </div>

                    {userRole === "partner" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Venue or Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. The Grand Palace Banquet Hall"
                          className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs pl-3.5 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Password *</label>
                    {authMode === "signin" && (
                      <button
                        type="button"
                        onClick={() => alert("Password reset link sent to registered email.")}
                        className="text-[11px] font-bold text-[#380c48] hover:underline"
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
                      className="w-full text-xs pl-3.5 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
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
                      className="rounded border-gray-300 text-[#380c48] focus:ring-[#380c48]"
                    />
                    <span>Remember this device for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#380c48] hover:bg-[#2b0837] text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>
                    {isLoading
                      ? "Authenticating..."
                      : authMode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </button>
              </form>
            )}

            {/* Social Authentication Dividers */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-3 text-gray-400 font-semibold">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => {
                  setAuthSuccess(true);
                  setTimeout(() => router.push("/venues"), 1200);
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => {
                  setAuthSuccess(true);
                  setTimeout(() => router.push("/venues"), 1200);
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.83 1.13-1.99.99-3.16-1.02.05-2.22.68-2.92 1.5-.62.72-1.15 1.9-1.01 3.03 1.14.09 2.27-.55 2.94-1.37z" />
                </svg>
                <span>Apple ID</span>
              </button>
            </div>

            {/* Quick Demo Logins for Pair Reviewing */}
            <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-gray-400 font-medium">Quick Demo Accounts:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("organizer")}
                  className="px-2.5 py-1 rounded bg-purple-50 text-[#380c48] font-semibold text-[11px] hover:bg-purple-100 transition-colors"
                >
                  Demo Host
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("partner")}
                  className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 font-semibold text-[11px] hover:bg-amber-100 transition-colors"
                >
                  Demo Partner
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Switch Mode + Legal terms */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-xs text-gray-600">
              {authMode === "signin" ? (
                <>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setErrorMessage("");
                      setOtpSent(false);
                    }}
                    className="font-bold text-[#380c48] hover:text-gold-600 transition-colors"
                  >
                    Register Now
                  </button>
                </>
              ) : (
                <>
                  Already have an Event Spacing account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrorMessage("");
                      setOtpSent(false);
                    }}
                    className="font-bold text-[#380c48] hover:text-gold-600 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit SSL Bank-Grade Encryption • 100% Data Privacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
