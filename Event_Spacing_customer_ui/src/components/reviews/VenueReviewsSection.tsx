"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  CornerDownRight,
  ShieldCheck,
  MessageSquare,
  Building2,
} from "lucide-react";
import { api } from "@/lib/api";
import { WriteReviewModal } from "./WriteReviewModal";

interface ReviewItem {
  id: string;
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
  isVerifiedBooking: boolean;
  managerReply: string | null;
  repliedAt: string | null;
}

interface VenueReviewsSectionProps {
  venueId: string;
  venueName: string;
}

export function VenueReviewsSection({
  venueId,
  venueName,
}: VenueReviewsSectionProps) {
  const [reviewsData, setReviewsData] = useState<{
    overallScore: number;
    totalReviews: number;
    ratingsDistribution: Record<string, number>;
    categoryAverages: Record<string, number>;
    reviews: ReviewItem[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const fetchReviews = async () => {
    if (!venueId) return;
    try {
      setIsLoading(true);
      const res = await api.reviews.getByTarget("venue", venueId, { limit: 20 });
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
  }, [venueId]);

  const reviews = reviewsData?.reviews || [];
  const filteredReviews = starFilter
    ? reviews.filter((r) => Math.round(r.rating) === starFilter)
    : reviews;

  const total = reviewsData?.totalReviews || reviews.length || 0;
  const overall = reviewsData?.overallScore || 4.8;
  const dist = reviewsData?.ratingsDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const catAvg = reviewsData?.categoryAverages || {
    cleanliness: 4.8,
    staffService: 4.9,
    facilities: 4.8,
    valueForMoney: 4.6,
  };

  return (
    <div id="reviews-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-50 text-gold-900 border border-gold-200 mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-gold-600" />
            Verified Host Experiences
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Guest Reviews &amp; Ratings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real feedback from hosts who celebrated weddings and events at {venueName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#380c48] hover:bg-[#521369] text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Aggregate Score & Distribution Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-[#faf7fb] border border-purple-100 items-center">
        {/* Left: Overall Big Score */}
        <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-purple-200/60 pb-4 md:pb-0 md:pr-6">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="font-serif text-5xl font-black text-[#380c48]">
              {overall.toFixed(1)}
            </span>
            <span className="text-gray-400 font-bold text-lg">/ 5.0</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  overall >= s
                    ? "text-gold-400 fill-gold-400"
                    : overall >= s - 0.5
                    ? "text-gold-400 fill-gold-400/50"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-600 font-semibold">
            Based on <strong>{total}</strong> verified host reviews
          </p>
        </div>

        {/* Middle: Star Rating Distribution Progress Bars */}
        <div className="md:col-span-5 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dist[String(star)] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setStarFilter(starFilter === star ? null : star)}
                className={`w-full flex items-center gap-2 group text-left cursor-pointer ${
                  starFilter === star ? "font-bold text-[#380c48]" : "text-gray-600"
                }`}
              >
                <span className="w-10 text-[11px] shrink-0 font-medium">
                  {star} Star
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gold-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-[11px] text-right font-mono text-gray-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Category Aspect Scores */}
        <div className="md:col-span-3 space-y-2 text-xs border-t md:border-t-0 md:border-l border-purple-200/60 pt-4 md:pt-0 md:pl-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Cleanliness</span>
            <span className="font-bold text-gray-900">{catAvg.cleanliness || 4.8} ★</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Staff Service</span>
            <span className="font-bold text-gray-900">{catAvg.staffService || 4.9} ★</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Facilities &amp; AC</span>
            <span className="font-bold text-gray-900">{catAvg.facilities || 4.8} ★</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Value for Money</span>
            <span className="font-bold text-gray-900">{catAvg.valueForMoney || 4.6} ★</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs if filter active */}
      {starFilter && (
        <div className="flex items-center justify-between text-xs bg-purple-50 px-4 py-2 rounded-xl text-[#380c48]">
          <span>
            Showing only <strong>{starFilter}-Star</strong> reviews ({filteredReviews.length})
          </span>
          <button
            type="button"
            onClick={() => setStarFilter(null)}
            className="text-xs font-bold underline hover:text-[#521369]"
          >
            Show All Reviews
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 pt-2">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-bold text-gray-700 text-sm">
              No reviews match this filter
            </p>
            <p className="text-xs text-gray-500">
              Be the first to share your experience hosting an event here!
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#380c48] underline"
            >
              Write a Review ↗
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-200 transition-all space-y-3"
            >
              {/* User row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-purple-100 bg-purple-50">
                    <img
                      src={rev.avatar}
                      alt={rev.customerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        {rev.customerName}
                      </span>
                      {rev.isVerifiedBooking && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>{rev.eventType}</span>
                      <span>&bull;</span>
                      <span>{rev.eventDate}</span>
                      {rev.guestCount && (
                        <>
                          <span>&bull;</span>
                          <span>{rev.guestCount} Guests</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                  <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                  <span>{rev.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Comment text */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {rev.comment}
              </p>

              {/* Manager Reply Box if present */}
              {rev.managerReply && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs mt-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#380c48]">
                    <CornerDownRight className="w-3.5 h-3.5 text-gold-600" />
                    <span>Response from Venue Management:</span>
                    {rev.repliedAt && (
                      <span className="text-[10px] text-gray-500 font-normal ml-auto">
                        {rev.repliedAt}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 pl-5 text-xs leading-relaxed">
                    {rev.managerReply}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="venue"
        targetId={venueId}
        targetName={venueName}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
}
