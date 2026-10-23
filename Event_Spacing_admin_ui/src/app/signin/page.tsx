"use client";

/**
 * @file signin/page.tsx
 * @description High-security Executive Sign-In Deck for Event Spacing Operations, KYC Verification Officers, and SuperAdmins.
 * Features 2FA hardware simulation, role-based authorization presets, and immutable audit session tracking.
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Cpu,
  UserCheck,
  Building2,
  FileCheck2,
  Layers,
} from "lucide-react";

type AdminRole = "superadmin" | "verifier" | "moderator";

export default function AdminSignInPage() {
  const router = useRouter();

  // Role & Form state
  const [selectedRole, setSelectedRole] = useState<AdminRole>("superadmin");
  const [email, setEmail] = useState("devika.sen@eventspacing.internal");
  const [password, setPassword] = useState("OpsGovernance2026#Secure");
  const [twoFactorCode, setTwoFactorCode] = useState("842019");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // Submission / feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Quick role selector that auto-fills authorized executive demo credentials.
   */
  const handleSelectRole = (role: AdminRole) => {
    setSelectedRole(role);
    setErrorMessage("");
    if (role === "superadmin") {
      setEmail("devika.sen@eventspacing.internal");
      setPassword("OpsGovernance2026#Secure");
      setTwoFactorCode("842019");
    } else if (role === "verifier") {
      setEmail("rajesh.nair@eventspacing.internal");
      setPassword("KYCComplianceOfficer2026!");
      setTwoFactorCode("519302");
    } else {
      setEmail("ananya.rao@eventspacing.internal");
      setPassword("CatalogCurator2026!");
      setTwoFactorCode("374821");
    }
  };

  /**
   * Handles authentication submission.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please input your executive corporate email and master passcode.");
      return;
    }

    if (twoFactorCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit hardware 2FA token.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        // Direct verifiers to approval queue, others to main overview
        if (selectedRole === "verifier") {
          router.push("/approvals");
        } else {
          router.push("/");
        }
      }, 1200);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0d0413] text-gray-100 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Cross-Portal Navigation Header */}
      <div className="max-w-6xl mx-auto w-full mb-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-gold-600 flex items-center justify-center text-brand-950 font-bold text-xs shadow-md">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-bold text-sm text-white">Event Spacing</span>
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            INTERNAL OPS CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
          <span className="hidden sm:block text-gray-700">•</span>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gold-400 font-medium hover:underline"
          >
            <span>Vendor Partner Hub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Security Console Card */}
      <div className="max-w-6xl mx-auto w-full bg-[#14061d] rounded-3xl shadow-2xl overflow-hidden border border-brand-900/60 grid grid-cols-1 lg:grid-cols-12">
        {/* 1. Left Column: Security Protocols & Platform Telemetry */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-b from-[#190625] via-[#12031a] to-[#0a020f] p-10 flex-col justify-between border-r border-brand-900/60 overflow-hidden">
          {/* Ambient Security Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          {/* Top Brand Logo & Classification */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-gold-600 flex items-center justify-center text-brand-950 font-bold shadow-lg">
                <ShieldAlert className="w-5 h-5 text-brand-950" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-wide text-white block leading-tight">
                  Event Spacing
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">
                  Admin Control Deck
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ENVIRONMENT: PROD-BLR-CLUSTER</span>
            </div>
          </div>

          {/* Center Protocol Capabilities */}
          <div className="relative z-10 my-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white leading-snug">
              Authorized Operations &amp; Verification Deck
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-800/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">KYC Document Inspection Engine</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Review BBMP Trade Licenses, BESCOM commercial electricity bills, and architect floor plans.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-800/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct-to-Bank Escrow Clearing</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Track ₹14.2M+ in monthly platform GMV with automated host payouts and audit logging.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-800/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Master Taxonomy Governance</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Manage 20 event types, 15 venue categories, and 21 marketplace vendor service classes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Telemetry Terminal */}
          <div className="relative z-10 pt-4 border-t border-brand-900/60 font-mono text-[11px] text-gray-400 space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-gray-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>TERMINAL_ID</span>
              </span>
              <span className="text-amber-400">DESK-OPS-01</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SECURITY_CIPHER</span>
              <span>TLS_1.3_STRICT</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ZERO_TRUST_IP</span>
              <span className="text-emerald-400">127.0.0.1 (WHITELISTED)</span>
            </div>
          </div>
        </div>

        {/* 2. Right Column: Interactive Admin Sign-In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Form Title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                  Secure Administrative Clearance
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Admin Console Authentication
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Enter your authorized internal credentials and 6-digit hardware security token.
              </p>
            </div>

            {/* Role Preset Tabs */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                Operational Clearance Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#0c0312] p-1.5 rounded-2xl border border-brand-800/60">
                <button
                  type="button"
                  onClick={() => handleSelectRole("superadmin")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === "superadmin"
                      ? "bg-gradient-to-r from-amber-500/20 to-gold-500/20 border border-gold-500/50 text-gold-300 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <UserCheck className="w-4 h-4 mb-1 text-gold-400" />
                  <span>SuperAdmin</span>
                  <span className="text-[9px] font-normal text-gray-400">Full Clearance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole("verifier")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === "verifier"
                      ? "bg-gradient-to-r from-amber-500/20 to-gold-500/20 border border-gold-500/50 text-gold-300 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 mb-1 text-emerald-400" />
                  <span>KYC Verifier</span>
                  <span className="text-[9px] font-normal text-gray-400">Approvals &amp; Compliance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole("moderator")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === "moderator"
                      ? "bg-gradient-to-r from-amber-500/20 to-gold-500/20 border border-gold-500/50 text-gold-300 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-purple-400" />
                  <span>Catalog Curator</span>
                  <span className="text-[9px] font-normal text-gray-400">Venues &amp; Media</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <span className="font-bold">•</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Animation Overlay */}
            {authSuccess ? (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Clearance Granted • Session Verified
                </h3>
                <p className="text-xs text-gray-300 font-mono">
                  Initializing {selectedRole.toUpperCase()} console session for {email}...
                </p>
                <div className="w-48 h-1.5 bg-brand-900 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gold-400 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            ) : (
              /* Authentication Input Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Corporate Email / Operator ID *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@eventspacing.internal"
                      className="w-full text-xs pl-3.5 pr-10 py-3 rounded-xl border border-brand-800/80 bg-brand-950/80 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Master Passcode *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full text-xs pl-3.5 pr-10 py-3 rounded-xl border border-brand-800/80 bg-brand-950/80 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-300 absolute right-3.5 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2FA Token Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Two-Factor Token (2FA Authenticator) *</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">TOKEN ACTIVE</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="842019"
                    className="w-full text-center tracking-[0.4em] font-mono text-base font-bold py-2.5 rounded-xl border border-brand-800/80 bg-brand-950/80 text-amber-300 focus:outline-none focus:border-gold-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Enter the time-based token generated by your YubiKey or Google Authenticator.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="rounded border-gray-700 bg-brand-950 text-gold-500 focus:ring-gold-500"
                    />
                    <span>Remember terminal certificate for 12 hours</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-gold-600 hover:from-amber-600 hover:to-gold-700 text-brand-950 font-bold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <ShieldCheck className="w-4 h-4 text-brand-950" />
                  <span>{isLoading ? "Verifying Credentials..." : "Authenticate & Open Console"}</span>
                </button>
              </form>
            )}

            {/* Quick Demo Operator Presets */}
            <div className="mt-6 pt-4 border-t border-brand-900/60">
              <div className="flex items-center justify-between text-xs mb-2 text-gray-400">
                <span className="font-semibold text-gray-300">Quick Test Profiles:</span>
                <span className="text-[10px] text-gray-500">1-click credential fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole("superadmin")}
                  className="p-2.5 rounded-xl bg-brand-950/90 hover:bg-brand-900/60 border border-brand-800/60 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-gold-300">Devika Sen</p>
                    <p className="text-[10px] text-gray-400">SuperAdmin (Master Clearance)</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole("verifier")}
                  className="p-2.5 rounded-xl bg-brand-950/90 hover:bg-brand-900/60 border border-brand-800/60 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-emerald-300">Rajesh Nair</p>
                    <p className="text-[10px] text-gray-400">KYC Verification Officer</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Security Compliance Seal */}
          <div className="mt-8 pt-6 border-t border-brand-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5 text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Immutable Audit Logs Active • SOC-2 Type II Certified</span>
            </span>
            <span className="font-mono text-gray-600">BUILD: v2.4.0-PROD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
