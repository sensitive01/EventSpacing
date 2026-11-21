"use client";

import React, { useState } from "react";
import { Star, X, CheckCircle2, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "venue" | "service";
  targetId: string;
  targetName: string;
  bookingId?: string;
  onReviewSubmitted?: () => void;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  bookingId,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [eventType, setEventType] = useState("Marriage / Wedding");
  const [guestCount, setGuestCount] = useState("250");
  const [cleanliness, setCleanliness] = useState(5);
  const [staffService, setStaffService] = useState(5);
  const [facilities, setFacilities] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);

  const [reviewerName, setReviewerName] = useState("");
  const [reviewerPhone, setReviewerPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a few words about your experience.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.reviews.create({
        targetType,
        targetId,
        bookingId,
        rating,
        comment: comment.trim(),
        eventType,
        guestCount: parseInt(guestCount, 10) || 100,
        cleanliness,
        staffService,
        facilities,
        valueForMoney,
        name: reviewerName.trim() || undefined,
        phone: reviewerPhone.trim() || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onReviewSubmitted) onReviewSubmitted();
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">
              Review Published!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Thank you for sharing your experience at <strong>{targetName}</strong>. Your verified review helps future hosts make the right choice!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#380c48] border border-purple-200 mb-1.5 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-gold-500" />
                Verified Guest Feedback
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                Rate &amp; Review
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {targetName}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Overall Star Rating Selector */}
            <div className="p-4 rounded-2xl bg-[#faf7fb] border border-purple-100 text-center space-y-2">
              <span className="text-xs font-bold text-gray-700 block">
                Overall Experience Rating *
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${
                        (hoverRating || rating) >= star
                          ? "text-gold-400 fill-gold-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-gray-500 block">
                {rating === 5 && "⭐ Exceptional & Flawless"}
                {rating === 4 && "⭐ Very Good & Recommended"}
                {rating === 3 && "⭐ Satisfactory"}
                {rating === 2 && "⭐ Below Expectations"}
                {rating === 1 && "⭐ Needs Improvement"}
              </span>
            </div>

            {/* Event Occasion & Guest Count */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Event Occasion
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-[#380c48]"
                >
                  <option value="Marriage / Wedding">Marriage / Wedding</option>
                  <option value="Reception">Reception</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Corporate Summit">Corporate Summit</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Sangeet / Mehendi">Sangeet / Mehendi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Approx. Guests
                </label>
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="250"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 font-medium focus:outline-none focus:border-[#380c48]"
                />
              </div>
            </div>

            {/* Detailed Category Aspect Scores */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-500 block tracking-wider">
                Category Ratings (1 - 5 Stars)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Cleanliness:</span>
                  <select
                    value={cleanliness}
                    onChange={(e) => setCleanliness(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-800"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Staff Service:</span>
                  <select
                    value={staffService}
                    onChange={(e) => setStaffService(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-800"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Facilities &amp; AC:</span>
                  <select
                    value={facilities}
                    onChange={(e) => setFacilities(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-800"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Value for Money:</span>
                  <select
                    value={valueForMoney}
                    onChange={(e) => setValueForMoney(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-800"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Review Comment Box */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your Review &amp; Experience *
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about the ambiance, sound system, catering arrangements, parking, and how the management assisted during your event..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48] font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Author optional name */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Ramesh K."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  Contact Mobile
                </label>
                <input
                  type="tel"
                  value={reviewerPhone}
                  onChange={(e) => setReviewerPhone(e.target.value)}
                  placeholder="9845012345"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#380c48] hover:bg-[#521369] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold-300" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold-300" />
                  <span>Publish Verified Review</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
