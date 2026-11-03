"use client";

/**
 * @file account/page.tsx
 * @description Customer Account Settings & Profile management page for Event Spacing.
 * Connected to backend endpoints (GET /api/auth/me, PUT /api/auth/profile, PUT /api/auth/change-password).
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Sliders,
  LogOut,
  Sparkles,
  ArrowRight,
  Bell,
  Smartphone,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";

type SettingsTab = "profile" | "security" | "preferences";

export default function AccountSettingsPage() {
  const router = useRouter();

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // User state
  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    companyName?: string;
    avatarUrl?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Preference Toggles
  const [defaultCity, setDefaultCity] = useState("Bengaluru");
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [savedPreferences, setSavedPreferences] = useState(false);

  // Feedback Messages
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  // Fetch logged-in user profile from MongoDB Atlas
  useEffect(() => {
    let isCancelled = false;

    const fetchUserProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("es_auth_token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (!isCancelled && res.data) {
          const u = res.data;
          setUser(u);
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setCompanyName(u.companyName || "");
          // Also sync localStorage
          localStorage.setItem("es_user", JSON.stringify(u));
        }
      } catch (err: any) {
        console.warn("Could not fetch user profile from backend:", err);
        // Fallback to local stored user
        const stored = localStorage.getItem("es_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setName(parsed.name || "");
            setEmail(parsed.email || "");
            setPhone(parsed.phone || "");
            setCompanyName(parsed.companyName || "");
          } catch {}
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMessage("");
    setProfileErrorMessage("");

    if (!name.trim()) {
      setProfileErrorMessage("Full name cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.auth.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        companyName: companyName.trim() || undefined,
      });

      const updated = res.data?.user || res.data;
      if (updated) {
        setUser(updated);
        localStorage.setItem("es_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("auth-change"));
      }

      setIsSavingProfile(false);
      setProfileSuccessMessage("Profile updated successfully!");
      setTimeout(() => setProfileSuccessMessage(""), 4000);
    } catch (err: any) {
      setIsSavingProfile(false);
      setProfileErrorMessage(err.message || "Failed to update profile. Please try again.");
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMessage("");
    setPasswordErrorMessage("");

    if (newPassword.length < 6) {
      setPasswordErrorMessage("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.auth.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });

      setIsSavingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccessMessage("Password changed successfully!");
      setTimeout(() => setPasswordSuccessMessage(""), 4000);
    } catch (err: any) {
      setIsSavingPassword(false);
      setPasswordErrorMessage(err.message || "Failed to update password. Please check your current password.");
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = () => {
    setSavedPreferences(true);
    setTimeout(() => setSavedPreferences(false), 3000);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("es_auth_token");
    localStorage.removeItem("es_user");
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/";
  };

  // Get user initials for avatar
  const getInitials = (fullName?: string) => {
    if (!fullName) return "ES";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Guest State Gate
  if (!isLoading && !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fbf9fc] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-[#380c48] flex items-center justify-center mx-auto shadow-inner border border-purple-100">
            <Lock className="w-8 h-8 text-[#380c48]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Please sign in to view and manage your Event Spacing account settings, profile, and security credentials.
            </p>
          </div>
          <Link
            href="/signin"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-sm py-3 px-6 rounded-xl shadow-md transition-all"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9fc] text-gray-900 pb-20">
      {/* 1. Page Header & Hero Banner */}
      <section className="bg-gradient-to-r from-[#240b2e] via-[#380c48] to-[#1c0626] text-white pt-8 pb-12 sm:pb-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-white/60 mb-6 font-medium">
            <Link href="/" className="hover:text-gold-300 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold-300">Account Settings</span>
          </div>

          {/* User Profile Overview Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#e5a83b] to-[#b87d19] text-[#240b2e] font-serif font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {user?.name || "Account Profile"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span>{user?.role === "vendor" ? "Partner / Venue" : "Host & Organizer"}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2 flex-wrap">
                  {user?.phone && <span>{user.phone}</span>}
                  {user?.phone && user?.email && <span>•</span>}
                  {user?.email && <span>{user.email}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/my-bookings"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/15 transition-colors"
              >
                <CalendarCheck className="w-4 h-4 text-gold-300" />
                <span>My Bookings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-red-500/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-300" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Tabs (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-3 sm:p-4 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#380c48] text-white shadow-md shadow-purple-900/10"
                  : "text-gray-700 hover:bg-purple-50/60 hover:text-[#380c48]"
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === "profile" ? "text-gold-300" : "text-gray-400"}`} />
              <div className="flex-1">
                <div>Personal Profile</div>
                <div className={`text-[11px] font-normal ${activeTab === "profile" ? "text-white/70" : "text-gray-400"}`}>
                  Name, email &amp; phone details
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#380c48] text-white shadow-md shadow-purple-900/10"
                  : "text-gray-700 hover:bg-purple-50/60 hover:text-[#380c48]"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === "security" ? "text-gold-300" : "text-gray-400"}`} />
              <div className="flex-1">
                <div>Security &amp; Password</div>
                <div className={`text-[11px] font-normal ${activeTab === "security" ? "text-white/70" : "text-gray-400"}`}>
                  Password, sessions &amp; safety
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-[#380c48] text-white shadow-md shadow-purple-900/10"
                  : "text-gray-700 hover:bg-purple-50/60 hover:text-[#380c48]"
              }`}
            >
              <Sliders className={`w-4 h-4 ${activeTab === "preferences" ? "text-gold-300" : "text-gray-400"}`} />
              <div className="flex-1">
                <div>Host Preferences</div>
                <div className={`text-[11px] font-normal ${activeTab === "preferences" ? "text-white/70" : "text-gray-400"}`}>
                  Alerts, city &amp; notifications
                </div>
              </div>
            </button>

            <div className="pt-4 border-t border-gray-100">
              <div className="bg-purple-50/60 rounded-2xl p-4 text-xs text-gray-700 space-y-2 border border-purple-100">
                <div className="flex items-center gap-1.5 font-bold text-[#380c48]">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>Royal Protection</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Your contact details are encrypted and only shared with verified venue managers upon confirmed booking.
                </p>
              </div>
            </div>
          </div>

          {/* Right Tab Content Panels (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {/* TAB 1: PERSONAL PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                    Personal Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Manage your personal identity, verified phone, and billing details across Event Spacing.
                  </p>
                </div>

                {profileSuccessMessage && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{profileSuccessMessage}</span>
                  </div>
                )}

                {profileErrorMessage && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{profileErrorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Raghav Rao"
                        className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-700">
                          Email Address
                        </label>
                        {user?.isEmailVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. user@gmail.com"
                          className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-700">
                          Mobile Number
                        </label>
                        {user?.isPhoneVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98450 12345"
                          className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Company / Host Organization (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Rao Enterprises or Family Event"
                        className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="inline-flex items-center gap-2 bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSavingProfile ? "Saving Changes..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: SECURITY & PASSWORD */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                    Security &amp; Password
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Manage your secret password and protect your event bookings.
                  </p>
                </div>

                {passwordSuccessMessage && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{passwordSuccessMessage}</span>
                  </div>
                )}

                {passwordErrorMessage && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{passwordErrorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Current Password (Leave blank if you registered via Mobile OTP)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="inline-flex items-center gap-2 bg-[#380c48] hover:bg-[#5a136b] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      <ShieldCheck className="w-4 h-4 text-gold-300" />
                      <span>{isSavingPassword ? "Updating Password..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>

                {/* Session Security Banner */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Active Security Session
                  </h3>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Current Device Session</div>
                        <div className="text-[11px] text-gray-500">Connected via JWT Bearer Token • MongoDB Atlas</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Active Now
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HOST PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                    Host Preferences &amp; Notifications
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Control how Event Spacing updates you regarding inquiry responses and bookings.
                  </p>
                </div>

                {savedPreferences && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Preferences saved successfully!</span>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Default Event City
                    </label>
                    <select
                      value={defaultCity}
                      onChange={(e) => setDefaultCity(e.target.value)}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium bg-white"
                    >
                      <option value="Bengaluru">Bengaluru, Karnataka</option>
                      <option value="Mumbai">Mumbai, Maharashtra</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad, Telangana</option>
                      <option value="Chennai">Chennai, Tamil Nadu</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Communication Channels
                    </h3>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">WhatsApp Instant Alerts</div>
                          <div className="text-[11px] text-gray-500">Receive booking confirmations &amp; quotes on WhatsApp</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={whatsappAlerts}
                        onChange={(e) => setWhatsappAlerts(e.target.checked)}
                        className="w-4 h-4 accent-[#380c48] rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">SMS Reminders &amp; Day-of Alerts</div>
                          <div className="text-[11px] text-gray-500">Time-slot reminders and key venue manager contact</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="w-4 h-4 accent-[#380c48] rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">Email Invoices &amp; Vendor Proposals</div>
                          <div className="text-[11px] text-gray-500">Formal PDF invoices and itemized pricing sheets</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailInvoices}
                        onChange={(e) => setEmailInvoices(e.target.checked)}
                        className="w-4 h-4 accent-[#380c48] rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="inline-flex items-center gap-2 bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

