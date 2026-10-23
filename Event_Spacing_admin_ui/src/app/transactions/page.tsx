"use client";

import React from "react";
import { Receipt, IndianRupee, Download, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { mockTransactions, mockPlatformMetrics } from "@/data/mockAdminData";

export default function AdminTransactionsPage() {
  const totalGross = mockTransactions.reduce((acc, t) => acc + t.grossAmount, 0);
  const totalCommission = mockTransactions.reduce((acc, t) => acc + t.commissionAmount, 0);
  const totalNetVendor = mockTransactions.reduce((acc, t) => acc + t.netPayoutToVendor, 0);

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">Financial Governance</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Platform GMV & Commission Ledger</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Audit customer payments, 10% marketplace revenue retention, and vendor disbursements.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading full transactions audit log (CSV).")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-800 text-gold-300 text-xs font-semibold hover:bg-brand-900 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 shadow-soft">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transactions Processed</span>
          <div className="text-2xl font-bold text-white mt-2">₹{totalGross.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">Gross booking volume across platform</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 shadow-soft">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Marketplace Net Commission</span>
          <div className="text-2xl font-bold text-gold-400 mt-2">₹{totalCommission.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">Retained 10% platform facilitator fee</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 shadow-soft">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Vendor Settlements</span>
          <div className="text-2xl font-bold text-emerald-400 mt-2">₹{totalNetVendor.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Disbursed via Automated NEFT
          </p>
        </div>
      </div>

      {/* 3. Transactions Table */}
      <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/40">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer & Venue</th>
                <th className="py-3 px-4">Vendor Partner</th>
                <th className="py-3 px-4 text-right">Gross GMV</th>
                <th className="py-3 px-4 text-right">Fee (10%)</th>
                <th className="py-3 px-4 text-right">Vendor Net</th>
                <th className="py-3 px-4 text-center">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/40 text-xs">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-brand-950/50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-gold-400">
                    {tx.id}
                    <span className="block text-[10px] font-mono text-gray-500 font-normal">
                      {tx.bookingRef}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400 whitespace-nowrap">{tx.date}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-white block">{tx.customerName}</span>
                    <span className="text-[11px] text-gray-400">{tx.venueName}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{tx.vendorName}</td>
                  <td className="py-4 px-4 text-right font-medium text-white">
                    ₹{tx.grossAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-gold-400 font-bold">
                    +₹{tx.commissionAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-emerald-400">
                    ₹{tx.netPayoutToVendor.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.paymentStatus === "completed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {tx.paymentStatus === "completed" ? "Settled" : "In Escrow"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
