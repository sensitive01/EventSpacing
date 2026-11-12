"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Gift,
  Loader2,
  Share2,
  Sparkles,
  Users,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface ReferredFriend {
  id: string;
  name: string;
  role: string;
  businessName?: string;
  rewardEarned: number;
  joinedAt: string;
}

interface ReferralSummary {
  referralCode: string;
  referralCredits: number;
  referrerBonus: number;
  refereeBonus: number;
  totalReferred: number;
  hasAppliedReferral: boolean;
  referredBy?: { name: string; referralCode: string } | null;
  referredUsers: ReferredFriend[];
}

export default function CustomerReferAndEarnPage() {
  const router = useRouter();
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [copied, setCopied] = useState(false);

  const [applyInput, setApplyInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadReferrals = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("es_auth_token") : null;
    if (!token) {
      router.replace("/signin?redirect=/refer-and-earn");
      return;
    }
    setIsAuthorized(true);
    setIsLoading(true);
    try {
      const res = await api.referrals.getMe();
      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        router.replace("/signin?redirect=/refer-and-earn");
        return;
      }
      setFeedback({ type: "error", text: err?.message || "Could not load referral details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleCopyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = data?.referralCode
    ? `Book verified wedding halls & event services on Event Spacing with zero brokerage! Use my referral code ${data.referralCode} when registering and earn ₹${data.refereeBonus} bonus credits.`
    : "";

  const handleShareWhatsApp = () => {
    if (!shareText) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyInput.trim()) return;
    setIsApplying(true);
    setFeedback(null);
    try {
      const res = await api.referrals.applyCode(applyInput.trim().toUpperCase());
      setFeedback({ type: "success", text: res.message || "Referral code applied!" });
      setApplyInput("");
      await loadReferrals();
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Invalid referral code." });
    } finally {
      setIsApplying(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#fbf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#380c48]" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fbf9fc] min-h-screen pb-20">
      {/* 1. Hero Banner */}
      <section className="bg-brand-950 text-white py-12 px-4 sm:px-8 border-b border-brand-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>Event Spacing Rewards</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Refer Friends &amp; Earn ₹{data?.referrerBonus?.toLocaleString() || "1,000"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Share your personal invite code with friends planning weddings, birthdays, or corporate events. You earn ₹{data?.referrerBonus || 1000} and they get ₹{data?.refereeBonus || 500} welcome bonus credits!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 min-w-[230px] text-center space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gold-300 block">
              Your Wallet Credits
            </span>
            <div className="font-serif text-3xl font-extrabold text-white">
              ₹{(data?.referralCredits || 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-gray-300 block">
              {data?.totalReferred || 0} successful referral(s)
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-6 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#380c48] mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Share Code Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-soft space-y-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                  Your Unique Invite Code
                </span>
                <h2 className="font-serif text-xl font-bold text-gray-900">
                  Invite Hosts &amp; Event Planners
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbf9fc] border-2 border-dashed border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono text-2xl font-extrabold tracking-widest text-[#380c48]">
                  {data?.referralCode || "—"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#380c48] hover:bg-[#521369] text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-gold-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <Share2 className="w-4 h-4 text-[#380c48] mx-auto mb-1" />
                  <span className="font-bold text-gray-900 block">1. Share Code</span>
                  <span className="text-[11px] text-gray-500">Send via WhatsApp</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <Users className="w-4 h-4 text-[#380c48] mx-auto mb-1" />
                  <span className="font-bold text-gray-900 block">2. Friend Joins</span>
                  <span className="text-[11px] text-gray-500">Applies code on app</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <Wallet className="w-4 h-4 text-gold-600 mx-auto mb-1" />
                  <span className="font-bold text-gray-900 block">3. Both Earn</span>
                  <span className="text-[11px] text-gray-500">₹1,000 + ₹500 bonus</span>
                </div>
              </div>
            </div>

            {/* Apply Referral Code Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-soft space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Redeem Invite
                </span>
                <h2 className="font-serif text-xl font-bold text-gray-900">
                  Have a Referral Code?
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Enter a friend&apos;s Event Spacing code to claim ₹{data?.refereeBonus || 500} bonus credits.
                </p>
              </div>

              {data?.hasAppliedReferral ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Referral Code Redeemed</span>
                  </div>
                  {data.referredBy && (
                    <p className="text-emerald-800">
                      Referred by <strong>{data.referredBy.name}</strong> ({data.referredBy.referralCode})
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleApplyCode} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={applyInput}
                    onChange={(e) => setApplyInput(e.target.value.toUpperCase())}
                    placeholder="Enter referral code (e.g. ESBHA9A2C)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-[#380c48]"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="w-full py-3 rounded-xl bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-xs cursor-pointer transition-colors disabled:opacity-60"
                  >
                    {isApplying ? "Applying..." : `Apply Code & Claim ₹${data?.refereeBonus || 500}`}
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/venues"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#380c48] hover:underline"
                >
                  <span>Browse Venues to Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. Referred History */}
        {data && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-soft space-y-4">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Your Successful Referrals ({data.referredUsers.length})</span>
            </h3>

            {data.referredUsers.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">
                No referrals joined yet. Share your code above to start earning!
              </p>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {data.referredUsers.map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 block">{u.name}</span>
                      <span className="text-[11px] text-gray-400">
                        Joined {new Date(u.joinedAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      +₹{u.rewardEarned.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

