"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Smartphone,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    venueName: string;
    spaceName: string;
    packageTitle: string;
    eventDate: string;
    timeSlot: string;
    guestCount: number;
    totalAmount: number;
    advanceAmount: number;
    balanceDue: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  };
  onPaymentSuccess: (paymentData: {
    transactionId: string;
    paymentMethod: string;
    amountPaid: number;
  }) => Promise<void> | void;
}

type PaymentTab = "upi" | "card" | "netbanking";

export function PaymentGatewayModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState(bookingDetails.customerName || "");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [txnRef, setTxnRef] = useState("");

  // Countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(899);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const handlePay = async () => {
    setIsProcessing(true);
    const newTxnRef = `TXN_${activeTab.toUpperCase()}_${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    setTxnRef(newTxnRef);

    setProcessingStep("Connecting to Banking Switch...");
    await new Promise((r) => setTimeout(r, 700));

    setProcessingStep("Verifying 3D Secure Authorization...");
    await new Promise((r) => setTimeout(r, 900));

    setProcessingStep("Advance Token Payment Approved!");
    await new Promise((r) => setTimeout(r, 500));

    setIsProcessing(false);
    setPaymentDone(true);

    try {
      await onPaymentSuccess({
        transactionId: newTxnRef,
        paymentMethod:
          activeTab === "upi"
            ? `UPI (${selectedUpiApp.toUpperCase()})`
            : activeTab === "card"
            ? "Credit / Debit Card"
            : `NetBanking (${selectedBank})`,
        amountPaid: bookingDetails.advanceAmount,
      });
    } catch (err) {
      console.error("Booking reservation failed after payment:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1f0528] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5a83b] text-[#1f0528] uppercase tracking-wider">
              Fast Checkout
            </span>
            <div className="flex items-center gap-1 text-[11px] text-gray-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted Payment</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                Event Spacing Secure Gateway
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Reserving <strong>{bookingDetails.venueName}</strong> • {bookingDetails.eventDate}
              </p>
            </div>

            <div className="text-left sm:text-right bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-gray-300 uppercase font-bold block">
                Advance Deposit (30%)
              </span>
              <span className="font-serif text-2xl font-extrabold text-[#f3cf7a]">
                ₹{bookingDetails.advanceAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-300 border-t border-white/10 pt-2.5">
            <span>
              Total Package: <strong>₹{bookingDetails.totalAmount.toLocaleString()}</strong> (Balance ₹{bookingDetails.balanceDue.toLocaleString()} at check-in)
            </span>
            <span className="text-gold-300 font-mono font-semibold">
              Session expires in: {formattedTime}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {paymentDone ? (
          <div className="p-8 sm:p-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">
              Advance Token Received!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Your advance payment of <strong>₹{bookingDetails.advanceAmount.toLocaleString()}</strong> has been verified.
              Locking date slot and generating your digital tax invoice...
            </p>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 inline-block text-xs font-mono text-gray-700">
              Ref ID: <strong>{txnRef}</strong>
            </div>
            <div className="pt-2">
              <div className="w-6 h-6 border-2 border-[#380c48] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        ) : isProcessing ? (
          <div className="p-12 text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#380c48] flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Authorizing Transaction
              </h3>
              <p className="text-xs text-purple-700 font-semibold animate-pulse">
                {processingStep}
              </p>
              <p className="text-[11px] text-gray-400">
                Please do not close or refresh this window.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Payment Method Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upi"
                    ? "bg-white text-[#380c48] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "card"
                    ? "bg-white text-[#380c48] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "netbanking"
                    ? "bg-white text-[#380c48] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Building className="w-4 h-4 text-amber-600" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* TAB 1: UPI */}
            {activeTab === "upi" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  {/* Dynamic QR Code Simulation */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-purple-200 shadow-sm text-center">
                    <div className="relative w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center border-2 border-dashed border-[#380c48]/30">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#380c48]">
                        <rect width="100" height="100" fill="#fff" />
                        {/* Finder patterns */}
                        <rect x="5" y="5" width="28" height="28" fill="#380c48" rx="4" />
                        <rect x="9" y="9" width="20" height="20" fill="#fff" rx="2" />
                        <rect x="13" y="13" width="12" height="12" fill="#380c48" rx="2" />

                        <rect x="67" y="5" width="28" height="28" fill="#380c48" rx="4" />
                        <rect x="71" y="9" width="20" height="20" fill="#fff" rx="2" />
                        <rect x="75" y="13" width="12" height="12" fill="#380c48" rx="2" />

                        <rect x="5" y="67" width="28" height="28" fill="#380c48" rx="4" />
                        <rect x="9" y="71" width="20" height="20" fill="#fff" rx="2" />
                        <rect x="13" y="75" width="12" height="12" fill="#380c48" rx="2" />

                        {/* Simulated data matrix dots */}
                        <circle cx="45" cy="15" r="3" fill="#380c48" />
                        <circle cx="55" cy="20" r="3" fill="#380c48" />
                        <circle cx="42" cy="30" r="3" fill="#380c48" />
                        <circle cx="58" cy="35" r="3" fill="#380c48" />
                        <circle cx="20" cy="45" r="3" fill="#380c48" />
                        <circle cx="35" cy="50" r="3" fill="#380c48" />
                        <circle cx="50" cy="50" r="4" fill="#e5a83b" />
                        <circle cx="65" cy="50" r="3" fill="#380c48" />
                        <circle cx="80" cy="45" r="3" fill="#380c48" />
                        <circle cx="45" cy="65" r="3" fill="#380c48" />
                        <circle cx="55" cy="75" r="3" fill="#380c48" />
                        <circle cx="42" cy="85" r="3" fill="#380c48" />
                        <circle cx="68" cy="70" r="3" fill="#380c48" />
                        <circle cx="85" cy="80" r="3" fill="#380c48" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 mt-2">
                      Scan with Any UPI App
                    </span>
                    <span className="text-[10px] text-gray-400">
                      GPay &bull; PhonePe &bull; Paytm &bull; BHIM
                    </span>
                  </div>

                  {/* Quick App Select */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-700 block">
                      Or Select Installed UPI App:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "gpay", name: "Google Pay", badge: "Fast" },
                        { id: "phonepe", name: "PhonePe", badge: "Popular" },
                        { id: "paytm", name: "Paytm UPI", badge: "Instant" },
                        { id: "bhim", name: "BHIM / Cred", badge: "Zero Fee" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedUpiApp === app.id
                              ? "border-[#380c48] bg-purple-50 ring-1 ring-[#380c48]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-gray-800 block">
                              {app.name}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {app.badge}
                            </span>
                          </div>
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              selectedUpiApp === app.id ? "text-[#380c48]" : "text-transparent"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Enter UPI VPA / ID:
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. mobile@upi or name@okaxis"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CARDS */}
            {activeTab === "card" && (
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4532 8900 1234 5678"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-mono"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-blue-700">VISA</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-amber-700">MC</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-emerald-700">RuPay</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name as printed on card"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {activeTab === "netbanking" && (
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700 block">
                  Select Popular Bank:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "HDFC", name: "HDFC Bank" },
                    { code: "ICICI", name: "ICICI Bank" },
                    { code: "SBI", name: "State Bank" },
                    { code: "AXIS", name: "Axis Bank" },
                    { code: "KOTAK", name: "Kotak Bank" },
                    { code: "BOB", name: "Bank of Baroda" },
                  ].map((bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setSelectedBank(bank.code)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedBank === bank.code
                          ? "border-[#380c48] bg-purple-50 ring-1 ring-[#380c48] text-[#380c48] font-bold"
                          : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 font-medium"
                      } text-xs`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Other Banks
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#380c48]"
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                    <option value="CANARA">Canara Bank</option>
                    <option value="INDUSIND">IndusInd Bank</option>
                    <option value="UNION">Union Bank of India</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="YES">Yes Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* Refund & Security Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Event Spacing Guarantee:</strong> 85% refundable if cancelled 14+ days prior. Your advance deposit is protected in an escrow settlement account until check-in.
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-[#380c48] hover:bg-[#521369] text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-gold-400" />
              <span>
                Pay ₹{bookingDetails.advanceAmount.toLocaleString()} Advance &amp; Confirm Slot
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

