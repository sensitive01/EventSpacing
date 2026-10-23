"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  Users,
  TrendingUp,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  mockPlatformMetrics,
  mockApprovalQueue,
  mockTransactions,
} from "@/data/mockAdminData";

export default function AdminDashboardPage() {
  const pendingApprovals = mockApprovalQueue.filter((a) => a.status === "pending");

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c0828] via-[#2d0e3e] to-[#12051a] p-6 sm:p-8 border border-brand-800/60 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Mission Control</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Executive Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Across Bengaluru: <strong className="text-gold-300">{mockPlatformMetrics.totalVenuesLive} live venues</strong>, 84 verified vendor partners, and <strong className="text-amber-300">{pendingApprovals.length} venue applications</strong> awaiting compliance verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/approvals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-brand-950 font-bold text-xs shadow-lg transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-brand-950" />
              <span>Review Verification Queue ({pendingApprovals.length})</span>
            </Link>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors"
            >
              <Building2 className="w-4 h-4 text-gold-300" />
              <span>Venue Catalog</span>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Platform KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Venues</span>
            <div className="w-9 h-9 rounded-xl bg-brand-900/60 text-gold-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{mockPlatformMetrics.totalVenuesLive}</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12 added this month
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14061d] border border-amber-500/30 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Awaiting Verification</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-300">{pendingApprovals.length} Applications</div>
            <p className="text-[11px] text-gray-400 mt-1">
              Average review turnaround: <strong className="text-white">14.2 hrs</strong>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform GMV (MTD)</span>
            <div className="w-9 h-9 rounded-xl bg-brand-900/60 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">₹1.42 Cr</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs last cycle
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Commission</span>
            <div className="w-9 h-9 rounded-xl bg-brand-900/60 text-gold-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gold-400">₹14,25,000</div>
            <p className="text-[11px] text-gray-400 mt-1">
              Based on flat <strong className="text-white">10% commission</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Two Column Operations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Verification Review Queue Widget */}
        <div className="lg:col-span-7 bg-[#14061d] rounded-3xl p-6 border border-brand-900/60 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900/40">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white">Venue KYC Verification Backlog</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingApprovals.length} Action Needed
                </span>
              </div>
              <p className="text-xs text-gray-400">Inspect vendor submitted photos, capacities, and municipal NOCs</p>
            </div>
            <Link
              href="/approvals"
              className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1"
            >
              Open Queue &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-brand-950/70 border border-brand-900/60 hover:border-gold-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{item.venueName}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] bg-brand-900 text-gray-300 font-mono">
                      {item.venueType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Vendor: <strong className="text-gray-300">{item.vendorName}</strong> • {item.city} ({item.locality})
                  </p>
                  <p className="text-[11px] text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Submitted {item.submissionDate}
                  </p>
                </div>

                <Link
                  href="/approvals"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 text-xs font-bold shadow-xs hover:from-amber-600 hover:to-gold-600 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Approve</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Platform Transactions Feed */}
        <div className="lg:col-span-5 bg-[#14061d] rounded-3xl p-6 border border-brand-900/60 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900/40">
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Recent Transactions</h2>
              <p className="text-xs text-gray-400">Customer booking payments and escrow</p>
            </div>
            <Link href="/transactions" className="text-xs font-bold text-gold-400 hover:text-gold-300">
              Audit &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {mockTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-900/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{tx.customerName}</span>
                    <span className="text-[10px] font-mono text-gray-400">{tx.bookingRef}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{tx.venueName}</p>
                  <span className="text-[10px] text-gray-500">{tx.date}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-400 block">₹{tx.grossAmount.toLocaleString()}</span>
                  <span className="text-[10px] text-gold-400 font-medium">Fee: ₹{tx.commissionAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
