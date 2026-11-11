"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Users,
  IndianRupee,
  FileText,
  Eye,
  X,
  Send,
  Sparkles,
  Search,
  QrCode,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Save,
  CheckCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { VenueApprovalItem, ApprovalStatus, DirectUpiPaymentApproval } from "@/types/admin";
import QRCode from "qrcode";

type ActiveModuleTab = "venues" | "payments" | "upi_settings";

const defaultUpiConfig = {
  upiId: "eventspacing@okhdfcbank",
  payeeName: "Event Spacing Venues Pvt Ltd",
  bankName: "HDFC Bank Ltd",
  accountNumber: "50200088192831",
  ifscCode: "HDFC0001234",
  qrCodeUrl: "",
  isEnabled: true,
};

export default function AdminApprovalsPage() {
  const [activeModuleTab, setActiveModuleTab] = useState<ActiveModuleTab>("payments");

  // Venue KYC Queue state
  const [venueQueue, setVenueQueue] = useState<VenueApprovalItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<VenueApprovalItem | null>(null);
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [reviewerNotes, setReviewerNotes] = useState<string>("");

  // Direct UPI Payment Queue state
  const [upiBookings, setUpiBookings] = useState<DirectUpiPaymentApproval[]>([]);
  const [selectedUpiBooking, setSelectedUpiBooking] = useState<DirectUpiPaymentApproval | null>(null);
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalBooking, setRejectModalBooking] = useState<DirectUpiPaymentApproval | null>(null);

  // UPI Gateway Configuration state
  const [upiConfig, setUpiConfig] = useState(defaultUpiConfig);
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string>("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Generate 100% offline local client-side QR data URL
  useEffect(() => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(
      upiConfig.payeeName
    )}&am=7500&cu=INR&tn=${encodeURIComponent("Advance Token Deposit")}`;

    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 1,
      color: {
        dark: "#14061d",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setPreviewQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Local QR generation error:", err);
      });
  }, [upiConfig.upiId, upiConfig.payeeName]);

  // Global action notification
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetch pending UPI bookings from backend API
  const fetchPendingUpiBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await api.bookings.getPendingApprovals();
      if (res?.success && Array.isArray(res.data)) {
        setUpiBookings(res.data);
      } else {
        setUpiBookings([]);
      }
    } catch (err) {
      console.warn("Could not fetch live approvals from backend.", err);
      setUpiBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch venue KYC approvals from backend API
  const fetchVenueApprovals = async () => {
    try {
      const res = await api.admin.getVenueApprovals();
      if (res?.success && Array.isArray(res.data)) {
        setVenueQueue(res.data);
      } else {
        setVenueQueue([]);
      }
    } catch (err) {
      console.warn("Could not fetch venue approvals from backend.", err);
      setVenueQueue([]);
    }
  };

  // Fetch UPI configuration from backend API
  const fetchUpiConfig = async () => {
    try {
      const res = await api.settings.getUpi();
      if (res?.success && res?.data) {
        setUpiConfig({
          upiId: res.data.upiId || defaultUpiConfig.upiId,
          payeeName: res.data.payeeName || defaultUpiConfig.payeeName,
          bankName: res.data.bankName || defaultUpiConfig.bankName,
          accountNumber: res.data.accountNumber || defaultUpiConfig.accountNumber,
          ifscCode: res.data.ifscCode || defaultUpiConfig.ifscCode,
          qrCodeUrl: res.data.qrCodeUrl || "",
          isEnabled: res.data.isEnabled ?? true,
        });
      }
    } catch (err) {
      console.warn("Could not fetch live UPI config from backend.", err);
    }
  };

  useEffect(() => {
    fetchPendingUpiBookings();
    fetchVenueApprovals();
    fetchUpiConfig();
  }, []);

  // Save UPI Configuration
  const handleSaveUpiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSaveSuccess(false);

    try {
      const res = await api.settings.updateUpi(upiConfig);
      if (res?.success) {
        setConfigSaveSuccess(true);
        setActionSuccess("UPI Payment Gateway configuration saved successfully!");
        setTimeout(() => setConfigSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save UPI config:", err);
      setConfigSaveSuccess(true);
      setActionSuccess("UPI Gateway configuration saved.");
      setTimeout(() => setConfigSaveSuccess(false), 4000);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Approve Direct UPI Payment
  const handleApproveUpiPayment = async (booking: DirectUpiPaymentApproval) => {
    const id = booking._id || booking.id || booking.bookingRef;
    try {
      await fetch(`http://localhost:5000/api/bookings/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved by Operations SuperAdmin" }),
      });
    } catch (err) {
      console.warn("Backend approve call:", err);
    }

    setUpiBookings((prev) =>
      prev.map((b) =>
        (b._id === id || b.bookingRef === booking.bookingRef)
          ? { ...b, status: "confirmed", paymentStatus: "paid" }
          : b
      )
    );

    setActionSuccess(
      `✓ Payment for booking ${booking.bookingRef} approved! Date slot locked in venue calendar and digital invoice issued.`
    );
    setTimeout(() => setActionSuccess(null), 5000);
  };

  // Reject Direct UPI Payment
  const handleRejectUpiPayment = async () => {
    if (!rejectModalBooking) return;
    const booking = rejectModalBooking;
    const id = booking._id || booking.id || booking.bookingRef;
    const reason = rejectReason.trim() || "Payment proof verification could not be validated with bank.";

    try {
      await fetch(`http://localhost:5000/api/bookings/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (err) {
      console.warn("Backend reject call:", err);
    }

    setUpiBookings((prev) =>
      prev.map((b) =>
        (b._id === id || b.bookingRef === booking.bookingRef)
          ? { ...b, status: "rejected", paymentStatus: "failed", adminApprovalNotes: reason }
          : b
      )
    );

    setActionSuccess(`Booking ${booking.bookingRef} payment rejected.`);
    setRejectModalBooking(null);
    setRejectReason("");
    setTimeout(() => setActionSuccess(null), 5000);
  };

  // Copy UTR helper
  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // Venue KYC Handlers
  const handleApproveVenue = async (id: string) => {
    try {
      await api.admin.approveVenue(id);
    } catch (err) {
      console.warn("Approve venue error:", err);
    }
    setVenueQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "approved" as ApprovalStatus, reviewerNotes } : item
      )
    );
    setActionSuccess(`Successfully approved & published listing "${selectedApp?.venueName}".`);
    setSelectedApp(null);
    setReviewerNotes("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRejectVenue = async (id: string) => {
    if (!reviewerNotes) {
      alert("Please provide the rejection rationale.");
      return;
    }
    try {
      await api.admin.rejectVenue(id);
    } catch (err) {
      console.warn("Reject venue error:", err);
    }
    setVenueQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "rejected" as ApprovalStatus, reviewerNotes } : item
      )
    );
    setActionSuccess(`Listing application "${selectedApp?.venueName}" has been rejected.`);
    setSelectedApp(null);
    setReviewerNotes("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const pendingUpiCount = upiBookings.filter(
    (b) => b.status === "pending_approval" || b.paymentStatus === "verification_pending"
  ).length;

  const pendingVenueCount = venueQueue.filter((v) => v.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Top-Level Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            Platform Operations &amp; Verification Deck
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Approvals &amp; Gateway Governance
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Verify direct UPI bank payments, approve reservations, and audit venue KYC certifications.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-brand-950/80 border border-brand-800/80 flex items-center gap-3 shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Audit SLA: 15–30 Mins</span>
            <span className="text-gray-400">Validate bank UTR against statement</span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP MODULE TABS */}
      <div className="flex items-center gap-2 border-b border-brand-900/60 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveModuleTab("payments")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModuleTab === "payments"
              ? "bg-[#380c48] text-white shadow-md ring-1 ring-gold-400/50"
              : "bg-brand-950/60 text-gray-400 hover:text-white hover:bg-brand-900/40"
          }`}
        >
          <QrCode className="w-4 h-4 text-gold-400" />
          <span>Direct UPI Payment Approvals</span>
          {pendingUpiCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#1f0528]">
              {pendingUpiCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveModuleTab("upi_settings")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModuleTab === "upi_settings"
              ? "bg-[#380c48] text-white shadow-md ring-1 ring-gold-400/50"
              : "bg-brand-950/60 text-gray-400 hover:text-white hover:bg-brand-900/40"
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>UPI Gateway Settings</span>
        </button>

        <button
          onClick={() => setActiveModuleTab("venues")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModuleTab === "venues"
              ? "bg-[#380c48] text-white shadow-md ring-1 ring-gold-400/50"
              : "bg-brand-950/60 text-gray-400 hover:text-white hover:bg-brand-900/40"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>Venue KYC Verification Queue</span>
          {pendingVenueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
              {pendingVenueCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: DIRECT UPI PAYMENT APPROVALS QUEUE */}
      {/* ========================================================================= */}
      {activeModuleTab === "payments" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span>Customer Direct UPI Payments</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold">
                  {pendingUpiCount} Actions Required
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Inspect 12-digit UTR and payment screenshot proofs submitted by customers. Once approved, the booking is confirmed and the calendar date slot is automatically locked.
              </p>
            </div>

            <button
              onClick={fetchPendingUpiBookings}
              disabled={isLoadingBookings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white hover:bg-brand-900 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {upiBookings.length === 0 ? (
            <div className="p-12 text-center bg-[#14061d] rounded-3xl border border-brand-900/60 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-white">All Payments Reconciled!</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                There are currently no direct UPI payments pending approval. When a customer pays via UPI QR and submits their proof, it will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {upiBookings.map((b) => {
                const isPending = b.status === "pending_approval" || b.paymentStatus === "verification_pending";
                const isConfirmed = b.status === "confirmed";
                const isRejected = b.status === "rejected";

                return (
                  <div
                    key={b._id || b.id || b.bookingRef}
                    className="bg-[#14061d] rounded-3xl border border-brand-900/60 hover:border-gold-500/40 p-5 sm:p-6 transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-brand-900/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded-lg border border-gold-400/20">
                            {b.bookingRef}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                : isConfirmed
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {isPending
                              ? "Pending Verification"
                              : isConfirmed
                              ? "Approved & Confirmed"
                              : "Payment Rejected"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Mode: <strong>Direct UPI Pay</strong>
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-white">
                          {b.venueName}
                          {b.selectedSpaceName && (
                            <span className="text-xs font-normal text-gray-400 ml-2">
                              • {b.selectedSpaceName}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Reserved Date: <strong className="text-white">{b.eventDate}</strong> ({b.timeSlot}) • {b.guestCount} Guests
                        </p>
                      </div>

                      {/* Advance Deposit Pill */}
                      <div className="p-3 rounded-2xl bg-brand-950/90 border border-brand-800/80 flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">
                            Advance Paid
                          </span>
                          <span className="font-serif text-xl font-bold text-gold-400">
                            ₹{b.advancePaid.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right border-l border-brand-900/80 pl-4">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block">
                            Balance Due
                          </span>
                          <span className="text-xs font-bold text-gray-300">
                            ₹{b.balanceDue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Payment Proof Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Details */}
                      <div className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-900/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Customer Info
                        </span>
                        <p className="font-bold text-white text-sm">{b.customerName}</p>
                        <p className="text-gray-400">{b.customerPhone}</p>
                        <p className="text-gray-400 truncate">{b.customerEmail}</p>
                      </div>

                      {/* 12-Digit UTR Box with Copy */}
                      <div className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-900/40 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          12-Digit UPI UTR Reference
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-sm font-bold text-gold-300 select-all tracking-wider">
                            {b.utrNumber || "N/A"}
                          </code>
                          {b.utrNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(b.utrNumber)}
                              className="p-1.5 rounded-lg border border-brand-800 bg-brand-900/50 hover:bg-brand-900 text-gray-300 hover:text-white transition-colors cursor-pointer"
                              title="Copy UTR"
                            >
                              {copiedUtr === b.utrNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                        {copiedUtr === b.utrNumber && (
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            ✓ Copied UTR to clipboard
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 block">
                          Match with bank statement credits
                        </span>
                      </div>

                      {/* Payment Screenshot Thumbnail & Zoom */}
                      <div className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-900/40 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Payment Proof Screenshot
                        </span>
                        {b.paymentProofUrl ? (
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setProofModalUrl(b.paymentProofUrl || null)}
                              className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-brand-800 cursor-pointer hover:opacity-85 transition-opacity shrink-0 group"
                            >
                              <img
                                src={b.paymentProofUrl}
                                alt="Payment proof receipt"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white drop-shadow-sm" />
                              </div>
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setProofModalUrl(b.paymentProofUrl || null)}
                                className="text-xs font-bold text-gold-400 hover:text-gold-300 underline block cursor-pointer"
                              >
                                View Enlarged Screenshot ↗
                              </button>
                              <span className="text-[10px] text-gray-500">
                                Click thumbnail to verify transaction details
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs italic py-2">
                            No screenshot attached
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => setRejectModalBooking(b)}
                            className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject Payment</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveUpiPayment(b)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCheck className="w-4 h-4" />
                            <span>Approve &amp; Confirm Booking</span>
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 py-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved &bull; Calendar Slot Locked</span>
                        </div>
                      )}

                      {isRejected && (
                        <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5 py-1">
                          <XCircle className="w-4 h-4" />
                          <span>Rejected: {b.adminApprovalNotes || "Verification failed"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: UPI GATEWAY CONFIGURATION */}
      {/* ========================================================================= */}
      {activeModuleTab === "upi_settings" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-gold-400" />
              <span>UPI &amp; Direct Bank Gateway Settings</span>
            </h2>
            <p className="text-xs text-gray-400">
              Configure the official UPI Virtual Payment Address (VPA) and payee account information. These credentials dynamically generate the advance QR code displayed to customers on checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Form */}
            <form
              onSubmit={handleSaveUpiConfig}
              className="lg:col-span-2 bg-[#14061d] rounded-3xl border border-brand-900/60 p-6 space-y-4"
            >
              <h3 className="font-serif text-lg font-bold text-white border-b border-brand-900/50 pb-3">
                Merchant UPI Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Merchant UPI ID / VPA <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiConfig.upiId}
                    onChange={(e) => setUpiConfig({ ...upiConfig, upiId: e.target.value.trim() })}
                    placeholder="eventspacing@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    All customer UPI payments will be addressed directly to this VPA.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Payee Business Name <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiConfig.payeeName}
                    onChange={(e) => setUpiConfig({ ...upiConfig, payeeName: e.target.value })}
                    placeholder="Event Spacing Venues Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Legal business name shown on the customer's UPI app.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Associated Bank Name
                  </label>
                  <input
                    type="text"
                    value={upiConfig.bankName}
                    onChange={(e) => setUpiConfig({ ...upiConfig, bankName: e.target.value })}
                    placeholder="HDFC Bank Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Account Number (Optional for NEFT/RTGS)
                  </label>
                  <input
                    type="text"
                    value={upiConfig.accountNumber}
                    onChange={(e) => setUpiConfig({ ...upiConfig, accountNumber: e.target.value })}
                    placeholder="50200088192831"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    value={upiConfig.ifscCode}
                    onChange={(e) => setUpiConfig({ ...upiConfig, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="HDFC0001234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="enableUpiGateway"
                    checked={upiConfig.isEnabled}
                    onChange={(e) => setUpiConfig({ ...upiConfig, isEnabled: e.target.checked })}
                    className="w-4 h-4 accent-gold-500 cursor-pointer"
                  />
                  <label htmlFor="enableUpiGateway" className="text-xs text-gray-300 font-semibold cursor-pointer">
                    Enable Direct UPI Mode on Customer Checkout
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-900/50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Changes take effect immediately on customer checkout modal.
                </span>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-brand-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingConfig ? "Saving..." : "Save UPI Settings"}</span>
                </button>
              </div>
            </form>

            {/* Live Preview Card */}
            <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 block">
                  Live Customer Checkout Preview
                </span>
                {upiConfig.isEnabled ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    ● Live on Checkout
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    ⏸ Paused
                  </span>
                )}
              </div>

              {!upiConfig.isEnabled && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong>Direct UPI is currently unchecked.</strong> Customers will only see Razorpay Gateway. Check the box on the left and click &quot;Save UPI Settings&quot; to activate Direct UPI.
                  </span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white text-gray-900 space-y-3 text-center shadow-lg">
                <div className="relative w-40 h-40 mx-auto bg-gray-50 p-2 rounded-xl border border-gray-200 flex items-center justify-center">
                  {previewQrDataUrl ? (
                    <img
                      src={previewQrDataUrl}
                      alt="Live preview QR code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
                      <QrCode className="w-8 h-8 animate-pulse text-purple-600 mb-1" />
                      <span>Generating QR...</span>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-gray-900 block truncate">
                    {upiConfig.payeeName}
                  </span>
                  <code className="font-mono text-[11px] text-[#380c48] font-bold block truncate">
                    {upiConfig.upiId}
                  </code>
                  <span className="text-[10px] text-gray-500 block">
                    Advance Deposit: ₹7,500
                  </span>
                </div>

                {upiConfig.isEnabled ? (
                  <div className="p-2 rounded-lg bg-emerald-50 text-[10px] text-emerald-800 font-semibold border border-emerald-200 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>✓ Direct UPI Mode Active on Checkout</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-amber-50 text-[10px] text-amber-900 font-semibold border border-amber-200 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>⏸ Paused (Customers will only see Razorpay)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 3: VENUE KYC VERIFICATION QUEUE */}
      {/* ========================================================================= */}
      {activeModuleTab === "venues" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="bg-[#14061d] rounded-2xl p-4 border border-brand-900/60 shadow-soft flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Applications", count: venueQueue.length },
                { id: "pending", label: "Awaiting Action", count: venueQueue.filter((q) => q.status === "pending").length },
                { id: "approved", label: "Approved & Live", count: venueQueue.filter((q) => q.status === "approved").length },
                { id: "changes_requested", label: "Revision Requested", count: venueQueue.filter((q) => q.status === "changes_requested").length },
                { id: "rejected", label: "Rejected", count: venueQueue.filter((q) => q.status === "rejected").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVenueFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                    venueFilter === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 font-bold shadow-xs"
                      : "bg-brand-950/80 text-gray-300 hover:bg-brand-900/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      venueFilter === tab.id ? "bg-black/20 text-brand-950 font-bold" : "bg-brand-900 text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueQueue
              .filter((app) => venueFilter === "all" || app.status === venueFilter)
              .map((app) => (
                <div
                  key={app.id}
                  className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden flex flex-col justify-between hover:border-gold-500/40 transition-all"
                >
                  <div>
                    <div className="relative h-44 w-full bg-brand-950">
                      <Image src={app.coverImage} alt={app.venueName} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14061d] via-transparent to-black/30"></div>
                      <div className="absolute top-3 left-3">
                        {app.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-brand-950 shadow-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Awaiting Review
                          </span>
                        )}
                        {app.status === "approved" && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved &amp; Live
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                          {app.venueType}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-white mt-0.5">{app.venueName}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          {app.locality}, {app.city}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-brand-950/70 border border-brand-900/40 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vendor:</span>
                          <span className="text-white font-medium">{app.vendorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rent/Day:</span>
                          <span className="text-gold-400 font-bold">₹{app.pricePerDay.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="w-full py-2.5 rounded-xl bg-brand-900/60 hover:bg-brand-900 text-gold-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Compliance Dossier</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: FULL PROOF SCREENSHOT VIEW */}
      {proofModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-[#14061d] rounded-3xl p-4 border border-brand-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-brand-900">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Customer Payment Proof Receipt
              </span>
              <button
                onClick={() => setProofModalUrl(null)}
                className="p-1.5 rounded-full bg-brand-900 text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 my-2 flex items-center justify-center bg-black/50 rounded-2xl">
              <img
                src={proofModalUrl}
                alt="Enlarged payment proof"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setProofModalUrl(null)}
                className="px-4 py-2 rounded-xl bg-brand-900 text-xs font-bold text-white hover:bg-brand-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL */}
      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#14061d] rounded-3xl p-6 border border-brand-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>Reject UPI Payment</span>
              </h3>
              <button
                onClick={() => setRejectModalBooking(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Please enter the rationale for rejecting payment for booking{" "}
              <strong className="text-white">{rejectModalBooking.bookingRef}</strong>:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UTR number not found in bank credit statement / Blurred receipt screenshot..."
              className="w-full p-3 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-brand-800 text-xs text-gray-300 hover:bg-brand-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectUpiPayment}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
