"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Users,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  Building2,
  AlertCircle,
} from "lucide-react";
import { vendorLeadsList as initialLeads } from "@/data/mockVendorData";
import { VendorLead, LeadStatus } from "@/types/vendor";

export default function VendorLeadsPage() {
  const [leads, setLeads] = useState<VendorLead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<VendorLead | null>(null);

  const statusColors: Record<LeadStatus, { bg: string; text: string; border: string }> = {
    new: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    contacted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    visited: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    booked: { bg: "bg-gold-50", text: "text-gold-800", border: "border-gold-300" },
    declined: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, updatedAt: "Just now" } : l))
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesTab = activeTab === "all" || lead.status === activeTab;
    const matchesSearch =
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.customerPhone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Inquiry Management</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Leads & Inquiries</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time customer inquiries forwarded directly from the Event Spacing customer marketplace.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-3 shrink-0">
          <Sparkles className="w-5 h-5 text-gold-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-brand-950 block">High Response Rate</span>
            <span className="text-gray-500">Respond within 2 hours for 3x booking conversion</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Inquiries", count: leads.length },
            { id: "new", label: "New Leads", count: leads.filter((l) => l.status === "new").length },
            { id: "contacted", label: "Contacted", count: leads.filter((l) => l.status === "contacted").length },
            { id: "visited", label: "Site Visit", count: leads.filter((l) => l.status === "visited").length },
            { id: "booked", label: "Booked", count: leads.filter((l) => l.status === "booked").length },
            { id: "declined", label: "Declined", count: leads.filter((l) => l.status === "declined").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-brand-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, venue..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-800 focus:bg-white"
          />
        </div>
      </div>

      {/* 3. Leads List */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-soft">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-gray-700">No leads found</h3>
            <p className="text-xs text-gray-500 mt-1">Try switching tabs or resetting your search filter.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const statusStyle = statusColors[lead.status];

            return (
              <div
                key={lead.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900">
                        {lead.customerName}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {lead.status}
                      </span>
                      <span className="text-[11px] text-gray-400">• Received {lead.createdAt}</span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-brand-800" />
                      <span className="font-medium text-gray-800">{lead.venueName}</span>
                    </div>
                  </div>

                  {/* Contact CTAs */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>{lead.customerPhone}</span>
                    </a>

                    <a
                      href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`mailto:${lead.customerEmail}`}
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      title={lead.customerEmail}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Event Type</span>
                    <span className="font-semibold text-gray-900">{lead.eventType}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Target Date</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-600" />
                      {lead.eventDate}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Guest Count</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-800" />
                      {lead.guestCount} Guests
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Budget</span>
                    <span className="font-bold text-brand-900 flex items-center gap-0.5">
                      {lead.budget}
                    </span>
                  </div>
                </div>

                {/* Special Requests note */}
                {lead.specialRequests && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Customer Requirements: </strong>
                      <span>{lead.specialRequests}</span>
                    </div>
                  </div>
                )}

                {/* Pipeline Status Selector Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-500">Pipeline Status:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-800 cursor-pointer shadow-2xs"
                    >
                      <option value="new">🟢 New Inquiry</option>
                      <option value="contacted">🔵 Contacted Customer</option>
                      <option value="visited">🟣 Site Visit Scheduled</option>
                      <option value="booked">⭐ Confirmed Booking</option>
                      <option value="declined">⚪ Declined / Lost</option>
                    </select>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    Last updated: {lead.updatedAt}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
