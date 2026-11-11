"use client";

import React, { useState, useEffect } from "react";
import { Receipt, IndianRupee, Download, CheckCircle2, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getTransactions();
      if (res?.success && Array.isArray(res.data)) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalGross = transactions.reduce((acc, t) => acc + (t.grossAmount || 0), 0);
  const totalCommission = transactions.reduce((acc, t) => acc + (t.commissionAmount || 0), 0);
  const totalNetVendor = transactions.reduce((acc, t) => acc + (t.netPayoutToVendor || 0), 0);

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }
    const headers = "Transaction Ref,Booking Ref,Date,Customer,Venue,Gross GMV,Commission (10%),Vendor Net,Escrow Status\n";
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.bookingRef}","${t.date}","${t.customerName}","${t.venueName}",${t.grossAmount},${t.commissionAmount},${t.netPayoutToVendor},"${t.paymentStatus}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `event_spacing_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">Financial Governance</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Platform GMV &amp; Commission Ledger (Live)</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Audit customer payments, 10% marketplace revenue retention, and vendor disbursements from real bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-brand-950 border border-brand-800 text-gray-300 hover:text-white cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-800 text-gold-300 text-xs font-semibold hover:bg-brand-900 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
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
            <ShieldCheck className="w-3.5 h-3.5" /> Disbursed via Automated Settlement
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
                <th className="py-3 px-4">Customer &amp; Venue</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Gross GMV</th>
                <th className="py-3 px-4 text-right">Fee (10%)</th>
                <th className="py-3 px-4 text-right">Vendor Net</th>
                <th className="py-3 px-4 text-center">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/40 text-xs">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No transactions recorded in database.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id || tx.bookingRef} className="hover:bg-brand-950/50 transition-colors">
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
                    <td className="py-4 px-4 text-gray-300">
                      {tx.paymentGateway === "direct_upi" ? "Direct UPI Pay" : "Razorpay Gateway"}
                      {tx.utrNumber && (
                        <span className="block text-[10px] font-mono text-gray-500">
                          UTR: {tx.utrNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-white">
                      ₹{(tx.grossAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-gold-400 font-bold">
                      +₹{(tx.commissionAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-emerald-400">
                      ₹{(tx.netPayoutToVendor || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.paymentStatus === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : tx.paymentStatus === "escrow_held"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {tx.paymentStatus === "completed"
                          ? "Settled"
                          : tx.paymentStatus === "escrow_held"
                          ? "Escrow Held"
                          : "Refunded"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
