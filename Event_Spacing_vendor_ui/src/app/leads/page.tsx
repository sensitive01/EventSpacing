"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Building2,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { LeadStatus, VendorLead } from "@/types/vendor";
import { api } from "@/lib/api";

type SortField = "createdAt" | "customerName" | "eventDate" | "guestCount" | "status";
type SortDirection = "asc" | "desc";

const STATUS_META: Record<
  LeadStatus,
  { label: string; badgeClass: string }
> = {
  new: {
    label: "New",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  contacted: {
    label: "Contacted",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  visited: {
    label: "Site Visit",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  booked: {
    label: "Booked",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  declined: {
    label: "Declined",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

const PIPELINE_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "🟢 New Inquiry" },
  { value: "contacted", label: "🔵 Contacted Customer" },
  { value: "visited", label: "🟣 Site Visit Scheduled" },
  { value: "booked", label: "⭐ Confirmed Booking" },
  { value: "declined", label: "⚪ Declined / Lost" },
];

export default function VendorLeadsPage() {
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters, sorting, pagination & view mode
  const [activeTab, setActiveTab] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Row interactions
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await api.vendor.getLeads();
      if (res?.data && Array.isArray(res.data)) {
        setLeads(res.data);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.warn("Could not fetch live leads:", err);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, venueFilter, searchQuery, pageSize]);

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    const prevLead = leads.find((l) => l.id === leadId);
    if (!prevLead) return;

    setUpdatingId(leadId);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l
      )
    );

    try {
      await api.vendor.updateLeadStatus(leadId, newStatus);
      showBanner(
        "success",
        `Updated ${prevLead.customerName}'s inquiry to "${STATUS_META[newStatus]?.label || newStatus}".`
      );
    } catch (err: any) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? prevLead : l)));
      showBanner("error", err?.message || "Failed to update pipeline status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyPhone = (phone: string, id: string) => {
    if (typeof window === "undefined" || !phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Distinct venue / service names for dropdown filter
  const listingOptions = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.venueName) set.add(l.venueName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [leads]);

  const counts = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      visited: leads.filter((l) => l.status === "visited").length,
      booked: leads.filter((l) => l.status === "booked").length,
      declined: leads.filter((l) => l.status === "declined").length,
    };
  }, [leads]);

  const filteredAndSortedLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = leads.filter((lead) => {
      const matchesTab = activeTab === "all" || lead.status === activeTab;
      const matchesVenue = venueFilter === "all" || lead.venueName === venueFilter;
      const matchesSearch =
        !q ||
        (lead.customerName || "").toLowerCase().includes(q) ||
        (lead.venueName || "").toLowerCase().includes(q) ||
        (lead.eventType || "").toLowerCase().includes(q) ||
        (lead.customerPhone || "").toLowerCase().includes(q) ||
        (lead.customerEmail || "").toLowerCase().includes(q) ||
        (lead.specialRequests || "").toLowerCase().includes(q);

      return matchesTab && matchesVenue && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "customerName":
          cmp = (a.customerName || "").localeCompare(b.customerName || "");
          break;
        case "eventDate":
          cmp = new Date(a.eventDate || 0).getTime() - new Date(b.eventDate || 0).getTime();
          break;
        case "guestCount":
          cmp = (a.guestCount || 0) - (b.guestCount || 0);
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "createdAt":
        default:
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [leads, activeTab, venueFilter, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLeads.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLeads = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSortedLeads.slice(start, start + pageSize);
  }, [filteredAndSortedLeads, safePage, pageSize]);

  const handleExportCsv = () => {
    if (filteredAndSortedLeads.length === 0) return;

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Venue / Service",
      "Event Type",
      "Target Date",
      "Guests",
      "Budget",
      "Pipeline Status",
      "Received Date",
      "Requirements",
    ].join(",");

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = filteredAndSortedLeads
      .map((l) =>
        [
          l.customerName,
          l.customerPhone,
          l.customerEmail,
          l.venueName,
          l.eventType,
          l.eventDate,
          l.guestCount,
          l.budget,
          l.status,
          l.createdAt?.slice(0, 10) || "",
          l.specialRequests || "",
        ]
          .map(escapeCsv)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `EventSpacing_Leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildWhatsAppLink = (lead: VendorLead) => {
    const digits = (lead.customerPhone || "").replace(/\D/g, "");
    const num = digits.length >= 10 ? digits.slice(-10) : digits;
    const msg = `Hello ${lead.customerName}, thank you for your inquiry on Event Spacing for ${lead.venueName} (${lead.eventDate}). Let's discuss your ${lead.eventType}!`;
    return `https://wa.me/91${num}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">
            Inquiry Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Leads &amp; Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time customer inquiries forwarded directly from the Event Spacing customer marketplace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {leads.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-brand-800" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchLeads}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
            title="Refresh inquiries"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <div className="p-3 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-3 shrink-0">
            <Sparkles className="w-5 h-5 text-gold-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-brand-950 block">High Response Rate</span>
              <span className="text-gray-500">Respond within 2 hours for 3x booking conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Summary KPI Row */}
      {leads.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className="text-left bg-white p-4 rounded-2xl border border-gray-200/80 shadow-soft hover:border-brand-300 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Inquiries
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-extrabold text-brand-950">
                {counts.total}
              </span>
              <MessageSquare className="w-4 h-4 text-brand-700" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className="text-left bg-white p-4 rounded-2xl border border-gray-200/80 shadow-soft hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              New Leads
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-extrabold text-emerald-700">
                {counts.new}
              </span>
              <span className="text-[11px] font-semibold text-gray-500">Awaiting reply</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contacted")}
            className="text-left bg-white p-4 rounded-2xl border border-gray-200/80 shadow-soft hover:border-blue-300 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              In Follow-Up
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-extrabold text-blue-700">
                {counts.contacted + counts.visited}
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                {counts.visited} site visits
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("booked")}
            className="text-left bg-white p-4 rounded-2xl border border-gray-200/80 shadow-soft hover:border-amber-300 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              Converted Bookings
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-extrabold text-amber-700">
                {counts.booked}
              </span>
              <span className="text-[11px] font-semibold text-gray-500">Won deals</span>
            </div>
          </button>
        </div>
      )}

      {/* 3. Filter, Search, Listing Dropdown & View Switcher Toolbar */}
      {leads.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-soft flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 xl:pb-0">
            {[
              { id: "all", label: "All Inquiries", count: counts.total },
              { id: "new", label: "New Leads", count: counts.new },
              { id: "contacted", label: "Contacted", count: counts.contacted },
              { id: "visited", label: "Site Visit", count: counts.visited },
              { id: "booked", label: "Booked", count: counts.booked },
              { id: "declined", label: "Declined", count: counts.declined },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
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

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer, phone, venue..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-800 focus:bg-white"
              />
            </div>

            {listingOptions.length > 1 && (
              <select
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-medium focus:outline-none focus:border-brand-800 cursor-pointer"
              >
                <option value="all">All Venues &amp; Services</option>
                {listingOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-medium focus:outline-none focus:border-brand-800 cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>

            <div className="flex items-center p-1 bg-gray-100 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-brand-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="DataTable View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-brand-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Content */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-900 border-t-gold-400 rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg font-bold text-gray-800">Loading Inquiries...</p>
          <p className="text-xs text-gray-400">Syncing live marketplace &amp; venue leads</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-soft p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-100 to-purple-50 border border-brand-200 text-brand-900 flex items-center justify-center mx-auto shadow-inner">
            <MessageSquare className="w-10 h-10 text-brand-800" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              No Inquiries Received Yet
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              When customers browse your venue or service listings on the Event Spacing customer marketplace and request a quote, their contact details and event specifications will appear here in real time.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/venues/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>List a Venue to Get Leads</span>
            </Link>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors"
            >
              <span>View My Venues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : filteredAndSortedLeads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-soft">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-gray-700">No leads match your filters</h3>
          <p className="text-xs text-gray-500 mt-1">
            Try switching pipeline tabs, selecting another listing, or clearing search.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setVenueFilter("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ========================================================================= */
        /* PRIMARY DATATABLE VIEW                                                    */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort("customerName")}
                      className="flex items-center gap-1 hover:text-gray-900 cursor-pointer uppercase"
                    >
                      <span>Customer &amp; Received</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Venue / Service &bull; Occasion</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort("eventDate")}
                      className="flex items-center gap-1 hover:text-gray-900 cursor-pointer uppercase"
                    >
                      <span>Target Date &bull; Guests</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Budget &amp; Notes</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 hover:text-gray-900 cursor-pointer uppercase"
                    >
                      <span>Pipeline Status</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedLeads.map((lead) => {
                  const statusMeta = STATUS_META[lead.status] || {
                    label: lead.status,
                    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
                  };
                  const isExpanded = expandedRowId === lead.id;

                  return (
                    <React.Fragment key={lead.id}>
                      <tr
                        className={`hover:bg-purple-50/30 transition-colors ${
                          isExpanded ? "bg-purple-50/20" : ""
                        }`}
                      >
                        {/* 1. Customer & Received */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1">
                            <span className="font-serif font-bold text-sm text-gray-900 block">
                              {lead.customerName}
                            </span>
                            {lead.customerPhone && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-600">
                                <Phone className="w-3 h-3 text-brand-700 shrink-0" />
                                <span>{lead.customerPhone}</span>
                                <button
                                  type="button"
                                  onClick={() => copyPhone(lead.customerPhone, lead.id)}
                                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                  title="Copy phone number"
                                >
                                  {copiedId === lead.id ? (
                                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                            <span className="text-[10px] text-gray-400 block">
                              Received {lead.createdAt?.slice(0, 10) || "Today"}
                            </span>
                          </div>
                        </td>

                        {/* 2. Venue / Service & Event Type */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-brand-800 shrink-0" />
                              <span className="truncate max-w-[180px]">{lead.venueName}</span>
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#faf7fb] border border-brand-100 text-[11px] font-medium text-brand-900">
                              {lead.eventType}
                            </span>
                          </div>
                        </td>

                        {/* 3. Target Date & Guest Count */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                              <span>{lead.eventDate || "Flexible"}</span>
                            </span>
                            <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                              <span>{lead.guestCount || 0} Guests</span>
                            </span>
                          </div>
                        </td>

                        {/* 4. Budget & Notes Preview */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1 max-w-[220px]">
                            <span className="font-bold text-brand-950 block">
                              {lead.budget || "Not specified"}
                            </span>
                            {lead.specialRequests ? (
                              <p className="text-[11px] text-gray-500 truncate">
                                &ldquo;{lead.specialRequests}&rdquo;
                              </p>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No notes</span>
                            )}
                          </div>
                        </td>

                        {/* 5. Pipeline Status */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="space-y-1.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusMeta.badgeClass}`}
                            >
                              {statusMeta.label}
                            </span>
                            <select
                              value={lead.status}
                              disabled={updatingId === lead.id}
                              onChange={(e) =>
                                updateLeadStatus(lead.id, e.target.value as LeadStatus)
                              }
                              className="block w-full px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold text-gray-800 focus:outline-none focus:border-brand-800 cursor-pointer disabled:opacity-50"
                            >
                              {PIPELINE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* 6. Quick Actions */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`tel:${lead.customerPhone}`}
                              className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                              title={`Call ${lead.customerPhone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            <a
                              href={buildWhatsAppLink(lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <a
                              href={`mailto:${lead.customerEmail}`}
                              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                              title={lead.customerEmail || "Send Email"}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => setExpandedRowId(isExpanded ? null : lead.id)}
                              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Toggle full inquiry details"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Inquiry Details */}
                      {isExpanded && (
                        <tr className="bg-purple-50/30 border-b border-gray-200">
                          <td colSpan={6} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-2xl border border-purple-100">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                  Contact Details
                                </span>
                                <p className="text-gray-800 font-semibold">{lead.customerName}</p>
                                <p className="text-gray-600 font-mono text-[11px]">
                                  Phone: {lead.customerPhone || "N/A"}
                                </p>
                                <p className="text-gray-600 text-[11px]">
                                  Email: {lead.customerEmail || "N/A"}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                  Customer Requirements
                                </span>
                                <p className="text-gray-700 leading-relaxed">
                                  {lead.specialRequests || "No special requirements specified."}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                  Timeline Metadata
                                </span>
                                <p className="text-gray-600 text-[11px]">
                                  Received: {lead.createdAt?.slice(0, 10) || "Today"}
                                </p>
                                <p className="text-gray-600 text-[11px]">
                                  Last Updated: {lead.updatedAt ? lead.updatedAt.slice(0, 10) : "Just now"}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-gray-50/70 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
            <span>
              Showing{" "}
              <strong className="text-gray-800">
                {filteredAndSortedLeads.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-800">
                {Math.min(safePage * pageSize, filteredAndSortedLeads.length)}
              </strong>{" "}
              of <strong className="text-gray-800">{filteredAndSortedLeads.length}</strong>{" "}
              inquiries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="font-bold text-gray-800">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CARD VIEW (OPTIONAL COMPACT CARDS TOGGLE)                                 */
        /* ========================================================================= */
        <div className="space-y-4">
          {paginatedLeads.map((lead) => {
            const statusMeta = STATUS_META[lead.status] || {
              label: lead.status,
              badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
            };

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
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        • Received {lead.createdAt?.slice(0, 10) || "Today"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-brand-800" />
                      <span className="font-medium text-gray-800">{lead.venueName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>{lead.customerPhone}</span>
                    </a>

                    <a
                      href={buildWhatsAppLink(lead)}
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Event Type
                    </span>
                    <span className="font-semibold text-gray-900">{lead.eventType}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Target Date
                    </span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-600" />
                      {lead.eventDate}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Guest Count
                    </span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-800" />
                      {lead.guestCount} Guests
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faf7fb] border border-brand-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Budget
                    </span>
                    <span className="font-bold text-brand-900 flex items-center gap-0.5">
                      {lead.budget}
                    </span>
                  </div>
                </div>

                {lead.specialRequests && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Customer Requirements: </strong>
                      <span>{lead.specialRequests}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-500">Pipeline Status:</span>
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-800 cursor-pointer shadow-2xs"
                    >
                      {PIPELINE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    Last updated: {lead.updatedAt ? lead.updatedAt.slice(0, 10) : "Just now"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
