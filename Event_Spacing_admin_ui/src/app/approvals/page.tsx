"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Users,
  IndianRupee,
  FileText,
  Eye,
  X,
  Send,
  Sparkles,
  Search,
} from "lucide-react";
import { mockApprovalQueue as initialQueue } from "@/data/mockAdminData";
import { VenueApprovalItem, ApprovalStatus } from "@/types/admin";

export default function AdminApprovalsPage() {
  const [queue, setQueue] = useState<VenueApprovalItem[]>(initialQueue);
  const [selectedApp, setSelectedApp] = useState<VenueApprovalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [reviewerNotes, setReviewerNotes] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "approved" as ApprovalStatus, reviewerNotes } : item
      )
    );
    setActionSuccess(`Successfully approved & published listing "${selectedApp?.venueName}".`);
    setSelectedApp(null);
    setReviewerNotes("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRequestChanges = (id: string) => {
    if (!reviewerNotes) {
      alert("Please provide specific feedback/notes for the vendor so they know what to fix.");
      return;
    }
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "changes_requested" as ApprovalStatus, reviewerNotes } : item
      )
    );
    setActionSuccess(`Revisions requested for "${selectedApp?.venueName}". Notes sent to vendor.`);
    setSelectedApp(null);
    setReviewerNotes("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = (id: string) => {
    if (!reviewerNotes) {
      alert("Please provide the rejection rationale.");
      return;
    }
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "rejected" as ApprovalStatus, reviewerNotes } : item
      )
    );
    setActionSuccess(`Listing application "${selectedApp?.venueName}" has been rejected.`);
    setSelectedApp(null);
    setReviewerNotes("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredQueue = queue.filter((item) => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Compliance & Audit</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Venue KYC Verification Queue</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Review vendor declarations, verified floor layouts, and licensing prior to public listing.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-brand-950/80 border border-brand-800/80 flex items-center gap-3 shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Audit SLA: 24–48 Hours</span>
            <span className="text-gray-400">All venues must pass fire & health licensing</span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className="bg-[#14061d] rounded-2xl p-4 border border-brand-900/60 shadow-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Applications", count: queue.length },
            { id: "pending", label: "Awaiting Action", count: queue.filter((q) => q.status === "pending").length },
            { id: "approved", label: "Approved & Live", count: queue.filter((q) => q.status === "approved").length },
            { id: "changes_requested", label: "Revision Requested", count: queue.filter((q) => q.status === "changes_requested").length },
            { id: "rejected", label: "Rejected", count: queue.filter((q) => q.status === "rejected").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                filterStatus === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 font-bold shadow-xs"
                  : "bg-brand-950/80 text-gray-300 hover:bg-brand-900/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.id ? "bg-black/20 text-brand-950 font-bold" : "bg-brand-900 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQueue.map((app) => {
          const isPending = app.status === "pending";
          const isApproved = app.status === "approved";
          const isChanges = app.status === "changes_requested";
          const isRejected = app.status === "rejected";

          return (
            <div
              key={app.id}
              className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden flex flex-col justify-between hover:border-gold-500/40 transition-all"
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-44 w-full bg-brand-950">
                  <Image src={app.coverImage} alt={app.venueName} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14061d] via-transparent to-black/30"></div>

                  <div className="absolute top-3 left-3">
                    {isPending && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-brand-950 shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting Review
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved & Live
                      </span>
                    )}
                    {isChanges && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500 text-white shadow-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Changes Requested
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      {app.locality}, {app.city}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">{app.id}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-serif font-bold text-lg text-white leading-snug">{app.venueName}</h3>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>
                      Vendor: <strong className="text-gray-200">{app.vendorName}</strong>
                    </div>
                    <div>Phone: {app.vendorPhone}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-brand-950/80 border border-brand-900/40">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Capacity</span>
                      <span className="font-semibold text-gray-200">
                        {app.seatingCapacity} Seating / {app.floatingCapacity} Max
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-brand-950/80 border border-brand-900/40">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Daily Tariff</span>
                      <span className="font-semibold text-gold-400">₹{app.pricePerDay.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Documents count */}
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{app.documents.length} KYC / Municipal documents attached</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="w-full py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-gold-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Application Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Detailed Inspection & Action Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#14061d] border border-brand-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-brand-900/60">
              <div>
                <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">Application Review</span>
                <h2 className="font-serif text-2xl font-bold text-white">{selectedApp.venueName}</h2>
                <p className="text-xs text-gray-400">
                  {selectedApp.vendorName} • Submitted {selectedApp.submissionDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-900/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos Strip */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Submitted Media</span>
              <div className="grid grid-cols-2 gap-3">
                {selectedApp.photos.map((url, i) => (
                  <div key={i} className="relative h-32 rounded-xl overflow-hidden bg-brand-950">
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/60">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Locality</span>
                <span className="font-semibold text-white">{selectedApp.locality}, {selectedApp.city}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/60">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Guest Capacity</span>
                <span className="font-semibold text-white">{selectedApp.seatingCapacity} Seated ({selectedApp.floatingCapacity} Max)</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/60">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Daily Tariff</span>
                <span className="font-semibold text-gold-400">₹{selectedApp.pricePerDay.toLocaleString()}</span>
              </div>
            </div>

            {/* Verification Documents Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Verification Documents
              </span>
              <div className="space-y-2">
                {selectedApp.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-gold-400" />
                      <div>
                        <span className="font-semibold text-white block">{doc.type}</span>
                        <span className="text-[11px] font-mono text-gray-400">{doc.fileName}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === "verified"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {doc.status === "verified" ? "NOC Validated" : "Pending Verifier Check"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewer Notes Input */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                Audit Notes / Feedback Remarks for Vendor:
              </label>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="e.g. All documents verified. Approved for induction into Indiranagar category."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-brand-950 border border-brand-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleReject(selectedApp.id)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
              >
                Reject Application
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleRequestChanges(selectedApp.id)}
                  className="px-4 py-2.5 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold transition-colors"
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedApp.id)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-brand-950 font-bold text-xs shadow-lg transition-all"
                >
                  Approve & Publish Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
