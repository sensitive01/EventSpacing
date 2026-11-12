"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Lock,
  MapPin,
  ShoppingBag,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useBookingCart } from "@/context/CartContext";
import { PaymentGatewayModal } from "@/components/booking/PaymentGatewayModal";
import { api } from "@/lib/api";

export default function BookingCartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, totalAmount, advanceTotal, securityDepositTotal } =
    useBookingCart();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("es_auth_token") : null;
      setIsSignedIn(Boolean(token));

      const rawUser =
        typeof window !== "undefined" ? localStorage.getItem("es_user") : null;
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          if (u.name) setCustomerName((prev) => prev || u.name);
          if (u.phone) setCustomerPhone((prev) => prev || u.phone);
          if (u.email) setCustomerEmail((prev) => prev || u.email);
        } catch {}
      }
    };

    syncAuth();
    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isSignedIn) {
      router.push("/signin?redirect=/cart");
      return;
    }

    if (items.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.includes("@")) {
      setErrorMsg("Please fill valid contact name, 10-digit phone, and email.");
      return;
    }

    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (paymentData: {
    transactionId: string;
    paymentMethod: string;
    amountPaid: number;
    paymentGateway?: "razorpay" | "direct_upi";
    utrNumber?: string;
    paymentProofUrl?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await api.bookings.checkoutCart({
        items: items.map((i) => ({
          bookingType: i.bookingType,
          venueId: i.venueId,
          vendorServiceId: i.vendorServiceId,
          selectedSpaceName: i.selectedSpaceName,
          packageTitle: i.packageTitle,
          eventCategory: i.eventCategory,
          eventDate: i.eventDate,
          timeSlot: i.timeSlot,
          guestCount: i.guestCount,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        specialRequests: specialRequests.trim() || undefined,
        transactionId: paymentData.transactionId,
        paymentMethod: paymentData.paymentMethod,
        paymentGateway: paymentData.paymentGateway || "direct_upi",
        utrNumber: paymentData.utrNumber,
        paymentProofUrl: paymentData.paymentProofUrl,
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
      });

      setIsPaymentOpen(false);
      clearCart();
      const firstId = res?.data?.[0]?._id || res?.data?.[0]?.bookingRef;
      if (items.length === 1 && firstId) {
        router.push(`/my-bookings/${firstId}`);
      } else {
        router.push("/my-bookings");
      }
    } catch (err: any) {
      setIsPaymentOpen(false);
      if (err?.status === 401) {
        router.push("/signin?redirect=/cart");
        return;
      }
      setErrorMsg(err?.message || "Checkout failed. Please check slot availability and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const balanceTotal = Math.max(0, totalAmount - advanceTotal);

  return (
    <div className="w-full bg-[#fbf9fc] min-h-screen pb-20">
      {/* 1. Header */}
      <div className="bg-brand-950 text-white py-10 px-4 sm:px-8 border-b border-brand-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Multi-Booking Preview Cart</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Your Event Cart ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Review your selected venues and marketplace event services together, verify advance token deposits, and confirm in one single payment.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer self-start sm:self-auto"
            >
              Clear All Items
            </button>
          )}
        </div>
      </div>

      {/* 2. Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-soft max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#380c48] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Your Booking Preview Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Add a venue from Venues or event services (Caterers, Photographers, Mehendi, Decorators) from the Marketplace to preview combined pricing and book together.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/venues"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#380c48] hover:bg-[#521369] text-white text-xs font-bold"
              >
                <span>Browse Venues</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] text-xs font-bold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Marketplace Services</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-soft flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-[10px] font-bold uppercase tracking-wider text-[#380c48]">
                          {item.bookingType === "service" ? "Marketplace Service" : "Venue"} • {item.categoryLabel}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#380c48]" />
                        {item.locality}, {item.city}
                      </p>

                      <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          <strong>{item.eventDate}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#380c48]" />
                          {item.timeSlot}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#380c48]" />
                          {item.guestCount} Guests
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Package Total
                      </span>
                      <span className="font-serif text-lg font-bold text-gray-900">
                        ₹{item.totalAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold block">
                        Advance: ₹{item.advancePaid.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Combined Checkout Summary */}
            <form
              onSubmit={handleOpenCheckout}
              className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-5 sticky top-24"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 block">
                  Unified Checkout
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#380c48]">
                  Booking Summary
                </h2>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Event Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Coordination timing or setup requests..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Combined Package Valuation ({items.length} items)</span>
                  <span className="font-bold">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                {securityDepositTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Refundable Venue Security Deposit</span>
                    <span>₹{securityDepositTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Balance Payable at Event Date</span>
                  <span>₹{balanceTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-purple-200 flex justify-between items-center text-sm font-bold text-[#380c48]">
                  <span>Advance Deposit Due Now</span>
                  <span className="font-serif text-xl">
                    ₹{advanceTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {!isSignedIn ? (
                <Link
                  href="/signin?redirect=/cart"
                  className="w-full py-3.5 rounded-2xl bg-[#380c48] hover:bg-[#521369] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-gold-300" />
                  <span>Sign In to Confirm &amp; Pay ₹{advanceTotal.toLocaleString("en-IN")}</span>
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-[#380c48] hover:bg-[#521369] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Lock className="w-4 h-4 text-gold-300" />
                  <span>
                    {isSubmitting
                      ? "Confirming Reservations..."
                      : `Pay ₹${advanceTotal.toLocaleString("en-IN")} & Confirm Cart`}
                  </span>
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <PaymentGatewayModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          bookingDetails={{
            venueName: `${items.length} Event Item${items.length > 1 ? "s" : ""} (${items[0].title}${items.length > 1 ? ` + ${items.length - 1} more` : ""})`,
            spaceName: items.map((i) => i.selectedSpaceName).join(", "),
            packageTitle: "Consolidated Event Cart Checkout",
            eventDate: items[0].eventDate,
            timeSlot: items[0].timeSlot,
            guestCount: items[0].guestCount,
            totalAmount,
            advanceAmount: advanceTotal,
            balanceDue: balanceTotal,
            customerName,
            customerPhone,
            customerEmail,
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

