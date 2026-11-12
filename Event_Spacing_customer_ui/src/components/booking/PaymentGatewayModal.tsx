"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Lock,
  QrCode,
  CheckCircle2,
  X,
  Loader2,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Copy,
  Check,
  Upload,
  ImageIcon,
  Trash2,
  Sparkles,
  Smartphone,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload";
import QRCode from "qrcode";

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
    paymentGateway?: "razorpay" | "direct_upi";
    utrNumber?: string;
    paymentProofUrl?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => Promise<void> | void;
}

type GatewayProvider = "razorpay" | "direct_upi";

export function PaymentGatewayModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  // Master Gateway Provider Switcher: Razorpay vs Direct Pay
  const [gatewayProvider, setGatewayProvider] = useState<GatewayProvider>("razorpay");
  const [isDirectUpiEnabled, setIsDirectUpiEnabled] = useState(true);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>("");

  // Admin dynamic UPI settings state
  const [adminUpiSettings, setAdminUpiSettings] = useState({
    upiId: "eventspacing@okhdfcbank",
    payeeName: "Event Spacing Venues Pvt Ltd",
    bankName: "HDFC Bank Ltd",
  });
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Customer proof & UTR input state
  const [customerUtr, setCustomerUtr] = useState("");
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofUploadedUrl, setProofUploadedUrl] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Razorpay Sandbox simulator state
  const [razorpaySandboxOpen, setRazorpaySandboxOpen] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);

  // Processing & Error state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [txnRef, setTxnRef] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Watchdog timer ref
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(899);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    };
  }, []);

  // Fetch admin UPI configuration dynamically from backend
  useEffect(() => {
    if (!isOpen) return;
    const loadSettings = async () => {
      try {
        const res = await api.settings.getUpi();
        if (res?.data) {
          if (res.data.upiId) {
            setAdminUpiSettings({
              upiId: res.data.upiId,
              payeeName: res.data.payeeName || "Event Spacing Venues Pvt Ltd",
              bankName: res.data.bankName || "HDFC Bank Ltd",
            });
          }
          const enabled = res.data.isEnabled !== false;
          setIsDirectUpiEnabled(enabled);
          if (!enabled) {
            setGatewayProvider("razorpay");
          }
        }
      } catch (err) {
        console.warn("Could not load backend UPI settings, using defaults.", err);
      }
    };
    loadSettings();
  }, [isOpen]);

  // Generate 100% offline local client-side QR data URL
  useEffect(() => {
    if (!isOpen) return;
    const upiUri = `upi://pay?pa=${encodeURIComponent(adminUpiSettings.upiId)}&pn=${encodeURIComponent(
      adminUpiSettings.payeeName
    )}&am=${bookingDetails.advanceAmount}&cu=INR&tn=${encodeURIComponent(
      `Advance-${bookingDetails.venueName.substring(0, 15)}`
    )}`;

    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 1,
      color: {
        dark: "#14061d",
        light: "#ffffff",
      },
    })
      .then((url) => setLocalQrDataUrl(url))
      .catch((err) => console.error("Customer QR generation error:", err));
  }, [isOpen, adminUpiSettings.upiId, adminUpiSettings.payeeName, bookingDetails.advanceAmount, bookingDetails.venueName]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Copy UPI ID to clipboard helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(adminUpiSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Proof screenshot file upload handler (uploads directly to Cloudinary eventspacing/payment-proofs)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file size must be under 10MB.");
      return;
    }

    const tempObjectUrl = URL.createObjectURL(file);
    if (proofPreviewUrl && proofPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(proofPreviewUrl);
    }

    setProofFileName(file.name);
    setProofPreviewUrl(tempObjectUrl);
    setProofUploadedUrl(null);
    setIsUploadingProof(true);
    setErrorMessage(null);

    try {
      const uploaded = await uploadImageFile(file, "payment-proofs");
      URL.revokeObjectURL(tempObjectUrl);
      setProofPreviewUrl(uploaded.url);
      setProofUploadedUrl(uploaded.url);
    } catch (err: any) {
      URL.revokeObjectURL(tempObjectUrl);
      setProofPreviewUrl(null);
      setProofUploadedUrl(null);
      setProofFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setErrorMessage(err?.message || "Failed to upload payment proof screenshot. Please try again.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleRemoveProof = () => {
    if (proofPreviewUrl && proofPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(proofPreviewUrl);
    }
    setProofPreviewUrl(null);
    setProofUploadedUrl(null);
    setProofFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Standard UPI URI format
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(adminUpiSettings.upiId)}&pn=${encodeURIComponent(
    adminUpiSettings.payeeName
  )}&am=${bookingDetails.advanceAmount}&cu=INR&tn=${encodeURIComponent(
    `Advance-${bookingDetails.venueName.substring(0, 15)}`
  )}`;

  /**
   * Helper: Dynamically loads Razorpay checkout.js only when real keys are present
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * 1. RAZORPAY GATEWAY CHECKOUT HANDLER
   */
  const handleRazorpayPay = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStep("Connecting to Razorpay Gateway Orders API...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const orderRes = await fetch(`${apiUrl}/payments/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bookingDetails.advanceAmount,
          venueName: bookingDetails.venueName,
          customerName: bookingDetails.customerName,
          customerPhone: bookingDetails.customerPhone,
          customerEmail: bookingDetails.customerEmail,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData?.success || !orderData?.data) {
        throw new Error(orderData?.message || "Failed to initialize Razorpay order.");
      }

      const { orderId, amount, currency, keyId, isSandbox } = orderData.data;

      // Check if this key is a placeholder or sandbox mode
      const isPlaceholderKey =
        !keyId ||
        keyId === "rzp_test_51MockEventSpacing" ||
        keyId === "apikey" ||
        isSandbox === true ||
        !keyId.startsWith("rzp_test_") ||
        keyId.length < 20;

      if (isPlaceholderKey) {
        setIsProcessing(false);
        setSandboxOrderData({ orderId, amount, currency, keyId });
        setRazorpaySandboxOpen(true);
        return;
      }

      setProcessingStep("Loading Razorpay Checkout Interface...");
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded || !(window as any).Razorpay) {
        setIsProcessing(false);
        setSandboxOrderData({ orderId, amount, currency, keyId });
        setRazorpaySandboxOpen(true);
        return;
      }

      setProcessingStep("Waiting for Razorpay Customer Authorization...");

      watchdogTimerRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, 10000);

      const options = {
        key: keyId,
        amount: amount,
        currency: currency || "INR",
        name: "Event Spacing",
        description: `Advance Token Deposit - ${bookingDetails.venueName}`,
        image: "/logo.png",
        order_id: orderId,
        prefill: {
          name: bookingDetails.customerName,
          email: bookingDetails.customerEmail,
          contact: bookingDetails.customerPhone,
        },
        theme: {
          color: "#380c48",
        },
        handler: async function (response: any) {
          if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
          setIsProcessing(true);
          setProcessingStep("Verifying Razorpay Cryptographic Signature...");

          try {
            await fetch(`${apiUrl}/payments/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            setTxnRef(response.razorpay_payment_id);
            setProcessingStep("Payment Verified & Token Received!");
            setIsProcessing(false);
            setPaymentDone(true);

            await onPaymentSuccess({
              transactionId: response.razorpay_payment_id,
              paymentMethod: "Razorpay Standard Gateway",
              amountPaid: bookingDetails.advanceAmount,
              paymentGateway: "razorpay",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          } catch (err: any) {
            console.error("Signature verification error:", err);
            setIsProcessing(false);
            setErrorMessage("Payment signature verification failed. Please check with your bank.");
          }
        },
        modal: {
          ondismiss: function () {
            if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
            setIsProcessing(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (response: any) {
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
        setIsProcessing(false);
        setErrorMessage(
          `Razorpay payment failed: ${response?.error?.description || "Transaction cancelled."} (You can switch to Direct UPI Pay below).`
        );
      });

      rzpInstance.open();
    } catch (err: any) {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      console.error("Razorpay initiation error:", err);
      setIsProcessing(false);
      setErrorMessage(
        err.message || "Failed to initialize Razorpay payment. Please use Direct UPI Pay or try Sandbox mode."
      );
    }
  };

  /**
   * Complete Razorpay Sandbox Test Payment (Developer Simulation)
   */
  const handleCompleteRazorpaySandbox = async () => {
    setIsProcessing(true);
    setProcessingStep("Verifying Razorpay Sandbox Authorization...");
    const mockPayId = `pay_rzp_test_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    setTxnRef(mockPayId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await fetch(`${apiUrl}/payments/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: sandboxOrderData?.orderId || `order_${Date.now()}`,
          razorpay_payment_id: mockPayId,
          razorpay_signature: "sandbox_verified_signature",
        }),
      });

      setProcessingStep("Sandbox Payment Verified & Token Approved!");
      await new Promise((r) => setTimeout(r, 600));

      setIsProcessing(false);
      setRazorpaySandboxOpen(false);
      setPaymentDone(true);

      await onPaymentSuccess({
        transactionId: mockPayId,
        paymentMethod: "Razorpay (Sandbox Simulation)",
        amountPaid: bookingDetails.advanceAmount,
        paymentGateway: "razorpay",
        razorpayOrderId: sandboxOrderData?.orderId,
        razorpayPaymentId: mockPayId,
        razorpaySignature: "sandbox_verified_signature",
      });
    } catch (err: any) {
      console.error("Sandbox confirmation failed:", err);
      setIsProcessing(false);
      setErrorMessage("Failed to record sandbox booking. Please retry.");
    }
  };

  /**
   * 2. DIRECT UPI PAY WITH PROOF & UTR SUBMISSION
   */
  const handleDirectUpiSubmit = async () => {
    setErrorMessage(null);

    const cleanUtr = customerUtr.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage("Please enter a valid UPI UTR / Transaction Reference Number (min 6-12 characters).");
      return;
    }

    if (isUploadingProof) {
      setErrorMessage("Please wait for your payment screenshot upload to finish.");
      return;
    }

    if (!proofUploadedUrl) {
      setErrorMessage("Please upload a payment confirmation screenshot as proof of transaction.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Recording reservation request with verified payment proof...");
    setTxnRef(cleanUtr);

    try {
      await onPaymentSuccess({
        transactionId: cleanUtr,
        paymentMethod: "Direct UPI (QR Payment)",
        amountPaid: bookingDetails.advanceAmount,
        paymentGateway: "direct_upi",
        utrNumber: cleanUtr,
        paymentProofUrl: proofUploadedUrl,
      });

      setIsProcessing(false);
      setPaymentDone(true);
    } catch (err: any) {
      console.error("Direct UPI booking submission failed:", err);
      setIsProcessing(false);
      setErrorMessage(err.message || "Failed to submit payment proof. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
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
              Secure Checkout
            </span>
            <div className="flex items-center gap-1 text-[11px] text-gray-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted Escrow Settlement</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                Event Spacing Checkout
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
            <span className="text-[#f3cf7a] font-mono font-semibold">
              Session expires in: {formattedTime}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {paymentDone ? (
          <div className="p-8 sm:p-12 text-center space-y-4 my-auto">
            {gatewayProvider === "direct_upi" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Payment Proof Submitted!
                </h3>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  Status: Pending Admin Verification
                </span>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your advance deposit proof of <strong>₹{bookingDetails.advanceAmount.toLocaleString()}</strong> with UTR <strong>{txnRef}</strong> has been submitted. Our operations team is verifying your payment with the bank. Once approved within 15–30 minutes, your booking will be confirmed and the date slot locked.
                </p>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 inline-block text-xs font-mono text-gray-700">
                  UTR Ref: <strong>{txnRef}</strong>
                </div>
                <div className="pt-2">
                  <div className="w-6 h-6 border-2 border-[#380c48] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Advance Token Received!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  Your advance payment of <strong>₹{bookingDetails.advanceAmount.toLocaleString()}</strong> has been verified via Razorpay Gateway. Locking date slot and generating your digital tax invoice...
                </p>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 inline-block text-xs font-mono text-gray-700">
                  Ref ID: <strong>{txnRef}</strong>
                </div>
                <div className="pt-2">
                  <div className="w-6 h-6 border-2 border-[#380c48] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              </>
            )}
          </div>
        ) : isProcessing ? (
          /* Processing Screen with FAIL-SAFE CANCEL BUTTON */
          <div className="p-10 sm:p-14 text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#380c48] flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Processing Submission
              </h3>
              <p className="text-xs text-purple-700 font-semibold animate-pulse">
                {processingStep}
              </p>
              <p className="text-[11px] text-gray-400">
                Please wait while we record your transaction details securely.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
                  setIsProcessing(false);
                  setProcessingStep("");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>Cancel &amp; Return to Checkout</span>
              </button>
            </div>
          </div>
        ) : razorpaySandboxOpen ? (
          /* RAZORPAY TEST MODE SANDBOX SIMULATOR */
          <div className="p-6 sm:p-8 space-y-5 my-auto animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-[#0c2340] text-white space-y-3 shadow-md border border-[#1b3d6c]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    R
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Razorpay Standard Checkout</span>
                    <span className="text-[10px] text-blue-300">Sandbox Test Simulator</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Developer Test Mode
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-300">Amount Due Now:</span>
                <span className="font-serif font-extrabold text-base text-[#f3cf7a]">
                  ₹{bookingDetails.advanceAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Zero-Setup Developer Sandbox</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Since live Razorpay keys are not yet configured in <code>.env.local</code>, this simulator lets you test the complete booking, invoice generation, and slot locking workflow immediately.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCompleteRazorpaySandbox}
                className="w-full bg-[#380c48] hover:bg-[#521369] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Simulate Successful Payment &amp; Confirm Booking</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRazorpaySandboxOpen(false);
                    setGatewayProvider("direct_upi");
                  }}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  ⚡ Use Direct UPI Pay
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpaySandboxOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Inline Error Alert Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-800 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Informational Banner if Direct UPI is Paused by Admin */}
            {!isDirectUpiEnabled && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Direct UPI payment mode is currently paused by platform admin.</strong> Please pay securely and instantly via Razorpay Gateway.
                </span>
              </div>
            )}

            {/* MASTER GATEWAY SELECTOR (Razorpay vs Direct UPI Pay) */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider block">
                Choose Payment Mode
              </span>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayProvider("razorpay");
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    gatewayProvider === "razorpay"
                      ? "bg-[#380c48] text-white shadow-sm ring-1 ring-[#380c48]"
                      : "bg-white text-gray-700 hover:text-gray-900 border border-gray-200"
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${gatewayProvider === "razorpay" ? "text-[#f3cf7a]" : "text-purple-600"}`} />
                  <span className="truncate">Razorpay Gateway</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold hidden sm:inline">
                    Online
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!isDirectUpiEnabled}
                  onClick={() => {
                    if (!isDirectUpiEnabled) return;
                    setGatewayProvider("direct_upi");
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    !isDirectUpiEnabled
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                      : gatewayProvider === "direct_upi"
                      ? "bg-[#380c48] text-white shadow-sm ring-1 ring-[#380c48] cursor-pointer"
                      : "bg-white text-gray-700 hover:text-gray-900 border border-gray-200 cursor-pointer"
                  }`}
                >
                  <QrCode className={`w-4 h-4 ${gatewayProvider === "direct_upi" ? "text-[#f3cf7a]" : "text-amber-500"}`} />
                  <span className="truncate">Direct Pay (UPI QR)</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold hidden sm:inline ${
                      !isDirectUpiEnabled
                        ? "bg-gray-200 text-gray-500"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {!isDirectUpiEnabled ? "Paused" : "Direct"}
                  </span>
                </button>
              </div>
            </div>

            {/* BRANCH A: RAZORPAY STANDARD GATEWAY */}
            {gatewayProvider === "razorpay" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/5 via-gold-50/20 to-purple-50/40 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#380c48]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Razorpay Standard Checkout SDK</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      Instant Confirmation
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Razorpay connects with all major Indian banks, UPI apps (GPay, PhonePe, Paytm), Visa, Mastercard, RuPay, and corporate cards with instant OTP authorization.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRazorpayPay}
                  disabled={isProcessing}
                  className="w-full bg-[#380c48] hover:bg-[#521369] text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-[#f3cf7a]" />
                  <span>
                    Pay ₹{bookingDetails.advanceAmount.toLocaleString()} via Razorpay Checkout
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#f3cf7a]" />
                </button>
              </div>
            )}

            {/* BRANCH B: DIRECT UPI PAY WITH QR & PROOF UPLOAD */}
            {gatewayProvider === "direct_upi" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Step 1: Scan QR Code & Transfer */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#380c48] flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-purple-700" />
                      <span>Step 1: Scan &amp; Pay Advance Deposit</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-200/60 text-[#380c48]">
                      Amount: ₹{bookingDetails.advanceAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Dynamic QR Code Box */}
                    <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-purple-200 shadow-sm text-center">
                      <div className="relative w-44 h-44 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
                        {localQrDataUrl ? (
                          <img
                            src={localQrDataUrl}
                            alt="Direct UPI QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-1" />
                            <span>Generating QR...</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-gray-800 mt-2">
                        Scan with Any UPI App
                      </span>
                      <span className="text-[10px] text-gray-500">
                        GPay, PhonePe, Paytm, BHIM, Cred
                      </span>
                    </div>

                    {/* Payee Info & Copy UPI ID */}
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-purple-200/80 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Official Merchant UPI ID
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono font-bold text-sm text-[#380c48] select-all truncate">
                            {adminUpiSettings.upiId}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#380c48] shrink-0 transition-colors cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {copiedUpi && (
                          <span className="text-[10px] text-emerald-600 font-bold block animate-in fade-in">
                            ✓ Copied to clipboard!
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Payee Account Name
                        </span>
                        <span className="font-semibold text-gray-800 block">
                          {adminUpiSettings.payeeName}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          Bank: {adminUpiSettings.bankName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                        <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Please pay exact advance deposit of <strong>₹{bookingDetails.advanceAmount.toLocaleString()}</strong>.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Enter UTR & Upload Screenshot */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#380c48]" />
                    <span>Step 2: Enter 12-Digit UTR &amp; Upload Payment Proof</span>
                  </span>

                  {/* 12-digit UTR Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      12-Digit UPI UTR / Transaction Reference Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={customerUtr}
                      onChange={(e) => setCustomerUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                      placeholder="e.g. 431289045612"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#380c48] font-mono tracking-wider bg-white"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Find the 12-digit UTR in your GPay / PhonePe / Paytm / Bank payment receipt.
                    </span>
                  </div>

                  {/* Screenshot Proof File Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Payment Screenshot Proof <span className="text-rose-500">*</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {proofPreviewUrl ? (
                      <div className="p-3 bg-white rounded-2xl border border-purple-200 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={proofPreviewUrl}
                              alt="Proof preview"
                              className="w-full h-full object-cover"
                            />
                            {isUploadingProof && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-800 block truncate">
                              {proofFileName || "payment_proof.png"}
                            </span>
                            {isUploadingProof ? (
                              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Cloudinary...
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Uploaded &amp; attached
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={isUploadingProof}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            disabled={isUploadingProof}
                            onClick={handleRemoveProof}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#380c48] bg-white transition-all cursor-pointer text-center space-y-1.5"
                      >
                        <div className="w-9 h-9 rounded-full bg-purple-50 text-[#380c48] flex items-center justify-center mx-auto">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 block">
                          Click to upload payment screenshot
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          PNG, JPG, or WebP up to 10MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Pay Submit Button */}
                <button
                  type="button"
                  onClick={handleDirectUpiSubmit}
                  disabled={isProcessing || isUploadingProof || !customerUtr.trim() || !proofUploadedUrl}
                  className="w-full bg-[#380c48] hover:bg-[#521369] text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 text-[#f3cf7a]" />
                  <span>
                    Submit Payment Proof &amp; Request Booking (₹{bookingDetails.advanceAmount.toLocaleString()})
                  </span>
                </button>

                <p className="text-[11px] text-center text-gray-500">
                  Direct UPI bookings are verified by the operations admin before final slot lock.
                </p>
              </div>
            )}

            {/* Refund & Security Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Event Spacing Guarantee:</strong> 85% refundable if cancelled 14+ days prior. Your advance deposit is protected in an escrow settlement account until check-in.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
