"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  CornerDownRight,
  Send,
  Filter,
  ShieldCheck,
  Building2,
  Clock,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

interface ReviewItem {
  id: string;
  venueId: string;
  venueName: string;
  customerName: string;
  avatar: string;
  rating: number;
  eventType: string;
  guestCount: number;
  eventDate: string;
  createdAt: string;
  comment: string;
  ratingsBreakdown: {
    cleanliness: number;
    staff: number;
    facilities: number;
    valueForMoney: number;
  };
  managerReply: string | null;
  repliedAt: string | null;
}

export default function VendorReviewsPage() {
  const [reviewsData, setReviewsData] = useState<{
    overallScore: number;
    totalReviews: number;
    ratingsDistribution: Record<string, number>;
    categoryAverages: Record<string, number>;
    reviews: ReviewItem[];
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<"all" | "5" | "4" | "pending" | "replied">("all");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.vendor.getReviews();
      if (res?.data) {
        setReviewsData(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyInputs[reviewId];
    if (!text || !text.trim()) return;

    try {
      setSubmittingReply(reviewId);
      await api.vendor.replyReview(reviewId, text.trim());
      // Update local state
      if (reviewsData) {
        const updated = reviewsData.reviews.map((r) => {
          if (r.id === reviewId) {
            return {
              ...r,
              managerReply: text.trim(),
              repliedAt: new Date().toISOString().split("T")[0],
            };
          }
          return r;
        });
        setReviewsData({ ...reviewsData, reviews: updated });
      }
      setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err: any) {
      alert(err?.message || "Failed to submit reply.");
    } finally {
      setSubmittingReply(null);
    }
  };

  const reviewsList = reviewsData?.reviews || [];

  const filteredReviews = reviewsList.filter((r) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "5") return r.rating >= 4.9;
    if (activeFilter === "4") return r.rating >= 4.0 && r.rating < 4.9;
    if (activeFilter === "replied") return !!r.managerReply;
    if (activeFilter === "pending") return !r.managerReply;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">
          Reputation & Feedback
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
          Customer Reviews & Ratings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Track guest satisfaction, monitor facility ratings, and publish official owner replies.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-900" />
          <p className="text-xs">Loading customer reviews...</p>
        </div>
      ) : (
        <>
          {/* 2. Rating Analytics Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Score Big Card */}
            <div className="flex items-center gap-5 md:border-r md:border-gray-100 md:pr-6">
              <div className="w-20 h-20 rounded-3xl bg-brand-900 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                <span className="font-serif text-3xl font-bold text-gold-400 leading-none">
                  {reviewsData?.overallScore || 4.8}
                </span>
                <span className="text-[10px] text-gray-300 font-semibold mt-1">out of 5</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Exceptional Experience
                </h3>
                <p className="text-xs text-gray-500">
                  Based on {reviewsData?.totalReviews || 0} verified customer reviews
                </p>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2.5 md:border-r md:border-gray-100 md:pr-6">
              <span className="text-xs font-bold text-gray-700 block">Facility Rating Scores</span>
              {[
                { label: "Cleanliness & Hygiene", score: reviewsData?.categoryAverages?.cleanliness || 4.8 },
                { label: "Staff Hospitality", score: reviewsData?.categoryAverages?.staffService || 4.8 },
                { label: "Acoustics & Facilities", score: reviewsData?.categoryAverages?.facilities || 4.8 },
                { label: "Value for Money", score: reviewsData?.categoryAverages?.valueForMoney || 4.6 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full"
                        style={{ width: `${(item.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-800 w-6 text-right">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Response Rate Trust Metric */}
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Partner Trust</span>
              </div>
              <p className="text-xs text-gray-600">
                Venues that reply within 24 hours receive <strong>35% higher inquiries</strong> from couples and wedding planners.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>Response Rate:</span>
                <span className="font-bold text-brand-900">100%</span>
              </div>
            </div>
          </div>

          {/* 3. Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", label: `All Reviews (${reviewsList.length})` },
              { id: "5", label: "5 Stars Only" },
              { id: "4", label: "4 Stars" },
              {
                id: "pending",
                label: `Needs Reply (${reviewsList.filter((r) => !r.managerReply).length})`,
              },
              {
                id: "replied",
                label: `Replied (${reviewsList.filter((r) => !!r.managerReply).length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === tab.id
                    ? "bg-brand-900 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const isReplying = submittingReply === review.id;
              const hasReply = !!review.managerReply;

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-soft space-y-4"
                >
                  {/* Review Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-brand-100 shrink-0">
                        <Image
                          src={review.avatar}
                          alt={review.customerName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900">{review.customerName}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Event</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span>{review.venueName}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span>{review.guestCount} Guests</span>
                          </span>
                          <span>•</span>
                          <span>{review.eventType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xl text-amber-800 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{review.rating}.0</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{review.createdAt}</span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    "{review.comment}"
                  </p>

                  {/* Rating Breakdown Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                      Cleanliness: <strong>{review.ratingsBreakdown.cleanliness}★</strong>
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                      Staff: <strong>{review.ratingsBreakdown.staff}★</strong>
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                      Facilities: <strong>{review.ratingsBreakdown.facilities}★</strong>
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                      Value: <strong>{review.ratingsBreakdown.valueForMoney}★</strong>
                    </span>
                  </div>

                  {/* Existing Manager Reply */}
                  {hasReply && (
                    <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-brand-950 flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-gold-600" />
                          <span>Venue Manager Response</span>
                        </span>
                        <span className="text-[10px] text-gray-400">{review.repliedAt}</span>
                      </div>
                      <p className="text-xs text-gray-700 pl-5 leading-relaxed">
                        {review.managerReply}
                      </p>
                    </div>
                  )}

                  {/* Reply Input Form (If No Reply Yet) */}
                  {!hasReply && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <label className="text-[11px] font-bold text-gray-700 block">
                        Respond publicly to {review.customerName}:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyInputs[review.id] || ""}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({ ...prev, [review.id]: e.target.value }))
                          }
                          placeholder="Thank the guest for their review and address any specific highlights..."
                          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleReplySubmit(review.id)}
                          disabled={isReplying || !(replyInputs[review.id] || "").trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                        >
                          {isReplying ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5 text-gold-400" />
                          )}
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

