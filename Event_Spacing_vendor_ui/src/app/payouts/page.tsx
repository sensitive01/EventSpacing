"use client";

import React from "react";
import {
  Wallet,
  IndianRupee,
  ArrowUpRight,
  Download,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { mockPayouts, currentVendorProfile } from "@/data/mockVendorData";

export default function VendorPayoutsPage() {
  const totalGross = mockPayouts.reduce((acc, p) => acc + p.grossAmount, 0);
  const totalCommission = mockPayouts.reduce((acc, p) => acc + p.platformFeeAmount, 0);
  const totalNet = mockPayouts.reduce((acc, p) => acc + p.netPayout, 0);

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Financial Overview</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Payouts & Settlement Ledger</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Automated direct bank disbursements for verified venue bookings and security deposits.
          </p>
        </div>

        {/* Bank Account Verification Pill */}
        <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-soft flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-900 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">{currentVendorProfile.bankDetails.bankName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-gray-500">A/C: •••• {currentVendorProfile.bankDetails.accountNumber.slice(-4)} (IFSC: {currentVendorProfile.bankDetails.ifscCode})</span>
          </div>
        </div>
      </div>

      {/* 2. Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Booking Value</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">₹{totalGross.toLocaleString()}</div>
          <p className="text-[11px] text-gray-500 mt-1">Total revenue from customer reservations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Commission (10%)</span>
          <div className="text-2xl font-bold text-brand-900 mt-2">₹{totalCommission.toLocaleString()}</div>
          <p className="text-[11px] text-gray-500 mt-1">Transparent 10% marketing & payment fee</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Disbursed</span>
          <div className="text-2xl font-bold text-emerald-700 mt-2">₹{(288000).toLocaleString()}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Credited to HDFC account
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming Settlement</span>
          <div className="text-2xl font-bold text-gold-700 mt-2">₹{(274500).toLocaleString()}</div>
          <p className="text-[11px] text-gold-700 font-semibold mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Scheduled for Oct 26, 2026
          </p>
        </div>
      </div>

      {/* 3. Payout Transactions Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-lg font-bold text-gray-900">Settlement Transactions</h2>
            <p className="text-xs text-gray-500">Every booking payout itemized with bank transaction references</p>
          </div>

          <button
            onClick={() => alert("Simulating GST statement download for financial year 2026-27.")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                <th className="py-3 px-4 rounded-l-xl">Payout Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Booking & Venue</th>
                <th className="py-3 px-4 text-right">Gross</th>
                <th className="py-3 px-4 text-right">Platform Fee</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {mockPayouts.map((p) => {
                const isPaid = p.status === "paid";
                const isProcessing = p.status === "processing";

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-950">
                      {p.id}
                      {p.payoutReference && (
                        <span className="block text-[10px] font-normal text-gray-400 font-sans">
                          {p.payoutReference}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{p.transactionDate}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900 block">{p.customerName}</span>
                      <span className="text-[11px] text-gray-500">
                        {p.venueName} • <span className="font-mono text-gray-400">{p.bookingId}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-700">
                      ₹{p.grossAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-red-600 font-medium">
                      -₹{p.platformFeeAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-700 text-sm">
                      ₹{p.netPayout.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : isProcessing
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => alert(`Downloading tax invoice for ${p.id}`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-900 hover:bg-gray-100"
                        title="Download Tax Invoice PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
