"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Gift,
  Loader2,
  Share2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";

export default function VendorReferAndEarnPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyInput, setApplyInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadReferrals = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("es_vendor_token") : null;
    if (!token) {
      router.replace("/signin");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.referrals.getMe();
      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        router.replace("/signin");
        return;
      }
      setFeedback({ type: "error", text: err?.message || "Could not load referral data." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleCopy = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!data?.referralCode) return;
    const msg = `List your event venue or service on Event Spacing Partner Hub! Use my partner referral code ${data.referralCode} and get ₹${data.refereeBonus} bonus credits.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">
            Partner Growth Program
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Vendor Refer &amp; Earn
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Invite fellow venue owners, caterers, decorators, or photographers to Event Spacing and earn ₹{data?.referrerBonus?.toLocaleString() || "1,000"} per signup!
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-[#1f0528] text-white flex items-center gap-3 shrink-0 shadow-md">
          <Wallet className="w-5 h-5 text-gold-400" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gold-300 font-bold block">
              Partner Bonus Balance
            </span>
            <span className="font-serif text-xl font-extrabold">
              ₹{(data?.referralCredits || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-5">
              <div className="flex items-center gap-2 text-brand-950">
                <Gift className="w-5 h-5 text-gold-600" />
                <h2 className="font-serif text-xl font-bold">Your Partner Invite Code</h2>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf7fb] border-2 border-dashed border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono text-2xl font-extrabold tracking-widest text-[#380c48]">
                  {data?.referralCode || "—"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-gold-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-100">
                  <span className="font-bold text-gray-900 block">₹{data?.referrerBonus || 1000}</span>
                  <span className="text-[11px] text-gray-500">Your reward per partner</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-100">
                  <span className="font-bold text-gray-900 block">₹{data?.refereeBonus || 500}</span>
                  <span className="text-[11px] text-gray-500">Partner welcome bonus</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-100">
                  <span className="font-bold text-gray-900 block">{data?.totalReferred || 0}</span>
                  <span className="text-[11px] text-gray-500">Total partners joined</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-4">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                Apply a Referral Code
              </h2>
              <p className="text-xs text-gray-500">
                Were you referred by another vendor or host? Redeem their code to unlock ₹{data?.refereeBonus || 500} credits.
              </p>

              {data?.hasAppliedReferral ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Code Already Redeemed</span>
                  </div>
                  {data.referredBy && (
                    <p className="mt-1">
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
                    placeholder="Enter referral code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-brand-900"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold text-xs cursor-pointer disabled:opacity-60"
                  >
                    {isApplying ? "Applying..." : "Apply Referral Code"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-3">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-800" />
              <span>Referred Partners &amp; Hosts ({data?.referredUsers?.length || 0})</span>
            </h3>
            {!data?.referredUsers || data.referredUsers.length === 0 ? (
              <p className="text-xs text-gray-500 py-3">
                No partners joined with your code yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {data.referredUsers.map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {u.name} {u.businessName ? `(${u.businessName})` : ""}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Role: {u.role} • Joined {new Date(u.joinedAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      +₹{u.rewardEarned?.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

