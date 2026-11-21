"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  Phone,
  Mail,
  Building,
  Calendar,
  Users,
  IndianRupee,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Trash2,
  AlertCircle,
  RefreshCw,
  Send,
  X,
  Briefcase,
  HeartHandshake,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  AdminInquiryItem,
  AdminInquiriesSummary,
  InquiryType,
  InquiryStatus,
} from "@/types/admin";

const TYPE_CONFIG: Record<
  InquiryType,
  { label: string; badge: string; icon: React.ElementType }
> = {
  corporate: {
    label: "Corporate",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: Briefcase,
  },
  concierge: {
    label: "Concierge",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    icon: HeartHandshake,
  },
  venue: {
    label: "Venue Quote",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: Building,
  },
  vendor: {
    label: "Marketplace",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    icon: Sparkles,
  },
};

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; badge: string; dot: string }
> = {
  new: {
    label: "New",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400 animate-pulse",
  },
  contacted: {
    label: "Contacted",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
  in_discussion: {
    label: "In Discussion",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    dot: "bg-indigo-400",
  },
  visited: {
    label: "Site Visited",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
  },
  booked: {
    label: "Booked / Won",
    badge: "bg-gold-500/20 text-gold-300 border-gold-500/30",
    dot: "bg-gold-400",
  },
  converted: {
    label: "Converted",
    badge: "bg-gold-500/20 text-gold-300 border-gold-500/30",
    dot: "bg-gold-400",
  },
  declined: {
    label: "Declined",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
  closed: {
    label: "Closed",
    badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    dot: "bg-gray-400",
  },
};

type SortField = "name" | "budget" | "createdAt" | "status";
type SortDirection = "asc" | "desc";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<AdminInquiryItem[]>([]);
  const [summary, setSummary] = useState<AdminInquiriesSummary>({
    totalInquiries: 0,
    newCount: 0,
    inProgressCount: 0,
    convertedCount: 0,
    corporateCount: 0,
    conciergeCount: 0,
    venueQuotesCount: 0,
    totalPipelineBudget: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal / Drawer state
  const [activeModalInquiry, setActiveModalInquiry] = useState<AdminInquiryItem | null>(null);
  const [modalNotes, setModalNotes] = useState("");
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    setConnectionError(false);
    try {
      const res = await api.admin.getInquiries();
      if (res?.success) {
        const rawList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.inquiries)
          ? res.data.inquiries
          : [];
        setInquiries(rawList);

        const summaryData = res.summary || res.data?.summary;
        if (summaryData) {
          setSummary(summaryData);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch inquiries:", err);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await api.admin.updateInquiry(id, { status: newStatus });
      if (res?.success) {
        setInquiries((prev) =>
          prev.map((item) =>
            item._id === id || item.id === id ? { ...item, status: newStatus } : item
          )
        );
        setActionMessage(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert("Failed to update inquiry status: " + (err.message || "Unknown error"));
    }
  };

  const handleSaveNotes = async () => {
    if (!activeModalInquiry) return;
    setIsUpdatingNotes(true);
    try {
      const res = await api.admin.updateInquiry(activeModalInquiry._id, {
        notes: modalNotes,
      });
      if (res?.success) {
        setInquiries((prev) =>
          prev.map((item) =>
            item._id === activeModalInquiry._id
              ? { ...item, notes: modalNotes }
              : item
          )
        );
        setActiveModalInquiry((prev) => (prev ? { ...prev, notes: modalNotes } : null));
        setActionMessage("Internal staff notes saved successfully.");
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert("Failed to save notes: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete inquiry from ${clientName}?`)) return;
    try {
      const res = await api.admin.deleteInquiry(id);
      if (res?.success) {
        setInquiries((prev) => prev.filter((i) => i._id !== id && i.id !== id));
        if (activeModalInquiry?._id === id) setActiveModalInquiry(null);
        setActionMessage("Inquiry record deleted.");
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert("Failed to delete inquiry: " + (err.message || "Unknown error"));
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtered & Sorted dataset
  const filteredAndSortedInquiries = useMemo(() => {
    const list = Array.isArray(inquiries) ? inquiries : [];
    const filtered = list.filter((item) => {
      // Type filter
      if (selectedType !== "all" && item.inquiryType !== selectedType) {
        return false;
      }
      // Status filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesEmail = item.email?.toLowerCase().includes(q);
        const matchesPhone = item.phone?.toLowerCase().includes(q);
        const matchesCompany = item.companyName?.toLowerCase().includes(q);
        const matchesVenue = item.venueName?.toLowerCase().includes(q);
        const matchesEvent = item.eventType?.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesCompany &&
          !matchesVenue &&
          !matchesEvent
        ) {
          return false;
        }
      }
      return true;
    });

    return filtered.sort((a, b) => {
      let comp = 0;
      if (sortField === "name") {
        comp = (a.name || "").localeCompare(b.name || "");
      } else if (sortField === "budget") {
        comp = (a.budget || 0) - (b.budget || 0);
      } else if (sortField === "status") {
        comp = (a.status || "").localeCompare(b.status || "");
      } else if (sortField === "createdAt") {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [inquiries, selectedType, selectedStatus, searchQuery, sortField, sortDirection]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedInquiries.slice(start, start + pageSize);
  }, [filteredAndSortedInquiries, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedInquiries.length && paginatedInquiries.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedInquiries.map((i) => i._id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-900/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-700/50 text-gold-400 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            CRM & Lead Deck
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
            Inquiries & Corporate Concierge
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage high-value corporate event quotes, luxury wedding concierge requests, and venue booking inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInquiries}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a0a26] hover:bg-[#250d36] text-gray-300 hover:text-white border border-brand-800/60 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-sm shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionMessage}
        </div>
      )}

      {/* Backend Offline Connection Warning */}
      {connectionError && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Backend Server Offline:</strong> Cannot connect to{" "}
              <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">
                http://localhost:5000/api/admin/inquiries
              </code>
              . Please start the backend service (<code>cd Event_Spacing_backend && npm run dev</code>).
            </span>
          </div>
          <button
            onClick={fetchInquiries}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-brand-950 font-black text-xs transition-colors shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inquiries */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-gray-400">
            <span>Total Inquiries</span>
            <MessageSquare className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-serif">
              {summary.totalInquiries}
            </span>
            <span className="text-xs text-gray-500">all channels</span>
          </div>
        </div>

        {/* Action Required */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14061d] border border-emerald-900/40 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
            <span>New / Action Required</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-serif">
              {summary.newCount}
            </span>
            <span className="text-xs text-emerald-500/80">awaiting reply</span>
          </div>
        </div>

        {/* In Discussion */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-blue-400">
            <span>In Pipeline</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-300 font-serif">
              {summary.inProgressCount}
            </span>
            <span className="text-xs text-gray-500">negotiating</span>
          </div>
        </div>

        {/* Won & Converted */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-gold-400">
            <span>Converted / Won</span>
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gold-300 font-serif">
              {summary.convertedCount}
            </span>
            <span className="text-xs text-gold-500/70">booked</span>
          </div>
        </div>

        {/* Pipeline Budget */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1a0a26] to-[#12041b] border border-gold-500/30 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-gold-300">
            <span>Pipeline Budget</span>
            <IndianRupee className="w-4 h-4 text-gold-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-gold-400 font-serif">
              ₹{(summary.totalPipelineBudget || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client name, company, email, phone, venue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0413] border border-brand-800/60 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>Showing</span>
            <span className="font-bold text-white px-2 py-0.5 rounded bg-brand-900/60 border border-brand-700/60">
              {filteredAndSortedInquiries.length}
            </span>
            <span>of {(Array.isArray(inquiries) ? inquiries : []).length} inquiries</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-900/40">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Type:
          </span>
          {[
            { id: "all", label: "All Types" },
            { id: "corporate", label: "Corporate" },
            { id: "concierge", label: "Wedding Concierge" },
            { id: "venue", label: "Venue Quotes" },
            { id: "vendor", label: "Marketplace" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedType(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedType === tab.id
                  ? "bg-gold-500 text-brand-950 shadow-md font-black"
                  : "bg-[#0d0413] text-gray-400 hover:text-white border border-brand-900/60"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="h-4 w-px bg-brand-900/60 mx-2 hidden sm:block" />

          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
            Status:
          </span>
          {[
            { id: "all", label: "All Status" },
            { id: "new", label: "New" },
            { id: "in_discussion", label: "In Discussion" },
            { id: "booked", label: "Booked / Won" },
            { id: "declined", label: "Declined" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-brand-700 text-white border border-brand-500"
                  : "bg-[#0d0413] text-gray-400 hover:text-white border border-brand-900/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Interactive Luxury Data Table */}
      <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/60">
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === paginatedInquiries.length &&
                      paginatedInquiries.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="accent-gold-500 cursor-pointer"
                    aria-label="Select all"
                  />
                </th>
                <th className="py-4 px-4 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase font-bold"
                  >
                    <span>Client & Enterprise</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 min-w-[160px]">Inquiry Channel</th>
                <th className="py-4 px-4 min-w-[160px]">Event Specs</th>
                <th className="py-4 px-4 min-w-[120px]">
                  <button
                    type="button"
                    onClick={() => toggleSort("budget")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase font-bold"
                  >
                    <span>Est. Budget</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 min-w-[150px]">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase font-bold"
                  >
                    <span>Pipeline Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 min-w-[180px]">Notes & Message</th>
                <th className="py-4 px-4 min-w-[110px]">
                  <button
                    type="button"
                    onClick={() => toggleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase font-bold"
                  >
                    <span>Received</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-900/40 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <RefreshCw className="w-7 h-7 animate-spin text-gold-400 mx-auto mb-2" />
                    <span>Loading inquiries data table...</span>
                  </td>
                </tr>
              ) : paginatedInquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <MessageSquare className="w-9 h-9 text-gray-600 mx-auto mb-2" />
                    <p className="text-white font-semibold">No Inquiries Found</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Try adjusting your search query, type filter, or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedInquiries.map((inquiry) => {
                  const typeConf = TYPE_CONFIG[inquiry.inquiryType] || TYPE_CONFIG.venue;
                  const statusConf = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.new;
                  const TypeIcon = typeConf.icon;
                  const isChecked = selectedIds.has(inquiry._id);

                  const cleanPhone = inquiry.phone ? inquiry.phone.replace(/\D/g, "") : "";
                  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const waMessage = encodeURIComponent(
                    `Hi ${inquiry.name}, regarding your ${
                      inquiry.eventType || "event"
                    } inquiry on Event Spacing...`
                  );

                  return (
                    <tr
                      key={inquiry._id}
                      className={`transition-colors group ${
                        isChecked
                          ? "bg-brand-900/30 hover:bg-brand-900/40"
                          : "hover:bg-brand-950/50"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(inquiry._id)}
                          className="accent-gold-500 cursor-pointer"
                        />
                      </td>

                      {/* Client & Enterprise */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-700/50 to-brand-900/70 border border-brand-600/40 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                            {inquiry.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white hover:text-gold-300 transition-colors cursor-pointer truncate"
                                onClick={() => {
                                  setActiveModalInquiry(inquiry);
                                  setModalNotes(inquiry.notes || "");
                                }}
                              >
                                {inquiry.name}
                              </span>
                              {inquiry.companyName && (
                                <span className="px-1.5 py-0.5 rounded bg-brand-900/90 border border-brand-700 text-brand-300 text-[10px] font-semibold truncate max-w-[130px]">
                                  {inquiry.companyName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                              {inquiry.phone && <span>{inquiry.phone}</span>}
                              {inquiry.phone && inquiry.email && <span>•</span>}
                              {inquiry.email && <span className="truncate max-w-[140px]">{inquiry.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Channel & Target Listing */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${typeConf.badge}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {typeConf.label}
                          </span>
                          {inquiry.venueName && (
                            <div className="text-[11px] text-gold-300 flex items-center gap-1 font-medium truncate max-w-[150px]">
                              <Building className="w-3 h-3 text-gold-400 shrink-0" />
                              <span className="truncate">{inquiry.venueName}</span>
                            </div>
                          )}
                          {inquiry.vendorName && (
                            <div className="text-[11px] text-cyan-300 flex items-center gap-1 font-medium truncate max-w-[150px]">
                              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate">{inquiry.vendorName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Event Specs */}
                      <td className="py-3.5 px-4 text-gray-300">
                        <div className="font-semibold text-white truncate max-w-[140px]">
                          {inquiry.eventType || "Event"}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                          {inquiry.eventDate && (
                            <span>
                              {new Date(inquiry.eventDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                          {inquiry.guestCount && (
                            <span className="flex items-center gap-0.5">
                              <Users className="w-3 h-3 text-gray-500" />
                              {inquiry.guestCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Est. Budget */}
                      <td className="py-3.5 px-4">
                        {inquiry.budget ? (
                          <span className="font-black text-gold-400 font-serif text-sm">
                            ₹{Number(inquiry.budget).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Flexible</span>
                        )}
                      </td>

                      {/* Pipeline Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={inquiry.status}
                            onChange={(e) =>
                              handleStatusChange(inquiry._id, e.target.value as InquiryStatus)
                            }
                            className="appearance-none pl-6 pr-6 py-1 rounded-xl bg-[#0d0413] border border-brand-800/80 text-[11px] font-bold text-gray-200 focus:outline-none focus:border-gold-500 cursor-pointer shadow-sm hover:border-brand-600 transition-colors"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_discussion">In Discussion</option>
                            <option value="visited">Site Visited</option>
                            <option value="booked">Booked / Won</option>
                            <option value="converted">Converted</option>
                            <option value="declined">Declined</option>
                            <option value="closed">Closed</option>
                          </select>
                          <span
                            className={`w-2 h-2 rounded-full ${statusConf.dot} absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none`}
                          />
                          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Notes & Messages */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => {
                            setActiveModalInquiry(inquiry);
                            setModalNotes(inquiry.notes || "");
                          }}
                          className="cursor-pointer group/note"
                        >
                          {inquiry.message ? (
                            <p className="text-[11px] text-gray-400 line-clamp-1 italic group-hover/note:text-white transition-colors max-w-[170px]">
                              "{inquiry.message}"
                            </p>
                          ) : (
                            <span className="text-[11px] text-gray-600">No message</span>
                          )}
                          {inquiry.notes && (
                            <div className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800/50 text-[10px] text-purple-300">
                              <FileText className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{inquiry.notes}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Received Date */}
                      <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                        <div>
                          {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(inquiry.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* WhatsApp */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${waNumber}?text=${waMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Direct Phone Call */}
                          {cleanPhone && (
                            <a
                              href={`tel:${cleanPhone}`}
                              title="Call Client"
                              className="p-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-300 transition-colors cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* View Dossier / Notes */}
                          <button
                            onClick={() => {
                              setActiveModalInquiry(inquiry);
                              setModalNotes(inquiry.notes || "");
                            }}
                            title="View dossier & staff notes"
                            className="p-1.5 rounded-lg bg-brand-950/80 hover:bg-brand-900 border border-brand-700/60 text-gold-400 hover:text-gold-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(inquiry._id, inquiry.name)}
                            title="Delete inquiry"
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="p-4 border-t border-brand-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 bg-brand-950/30">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-white">
                {filteredAndSortedInquiries.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, filteredAndSortedInquiries.length)}
              </strong>{" "}
              of <strong className="text-white">{filteredAndSortedInquiries.length}</strong> inquiries
            </span>

            {/* Page Size Select */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px] text-gray-500">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#0d0413] border border-brand-900 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-brand-900/80 hover:bg-brand-900/50 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={page}>
                    {prev && page - prev > 1 && <span className="px-1 text-gray-600">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        currentPage === page
                          ? "bg-gold-500 text-brand-950 font-black shadow-sm"
                          : "border border-brand-900/60 hover:bg-brand-900/40 text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-brand-900/80 hover:bg-brand-900/50 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Detailed Inquiry Dossier & Notes Modal */}
      {activeModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#14061d] border border-brand-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-brand-900/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                  Lead Details & CRM Dossier
                </span>
                <h3 className="text-lg font-serif font-black text-white mt-0.5">
                  {activeModalInquiry.name}{" "}
                  {activeModalInquiry.companyName && (
                    <span className="text-gray-400 font-sans text-sm font-normal">
                      ({activeModalInquiry.companyName})
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInquiry(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-900/40 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Quick Contacts Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#0d0413] border border-brand-900/60">
                  <span className="text-[10px] text-gray-500 uppercase block">Phone</span>
                  <a
                    href={`tel:${activeModalInquiry.phone}`}
                    className="text-white hover:text-gold-400 font-semibold text-xs flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                    {activeModalInquiry.phone || "N/A"}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#0d0413] border border-brand-900/60">
                  <span className="text-[10px] text-gray-500 uppercase block">Email</span>
                  <a
                    href={`mailto:${activeModalInquiry.email}`}
                    className="text-white hover:text-gold-400 font-semibold text-xs flex items-center gap-1.5 mt-0.5 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold-400" />
                    {activeModalInquiry.email || "N/A"}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#0d0413] border border-brand-900/60">
                  <span className="text-[10px] text-gray-500 uppercase block">Estimated Budget</span>
                  <span className="text-gold-400 font-bold text-xs flex items-center gap-1 mt-0.5">
                    ₹{Number(activeModalInquiry.budget || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Event Requirements */}
              <div className="p-4 rounded-xl bg-[#0d0413] border border-brand-900/60 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Event Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Event Type:</span>{" "}
                    <span className="text-white font-medium">{activeModalInquiry.eventType || "General"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Target Date:</span>{" "}
                    <span className="text-white font-medium">
                      {activeModalInquiry.eventDate
                        ? new Date(activeModalInquiry.eventDate).toLocaleDateString("en-IN")
                        : "Flexible"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Guest Count:</span>{" "}
                    <span className="text-white font-medium">{activeModalInquiry.guestCount || "TBD"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Target Venue:</span>{" "}
                    <span className="text-white font-medium">{activeModalInquiry.venueName || "Open"}</span>
                  </div>
                </div>
              </div>

              {/* Client's Original Message */}
              {activeModalInquiry.message && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">Client's Message / Request</label>
                  <div className="p-3.5 rounded-xl bg-[#0d0413] border border-brand-900/60 text-xs text-gray-200 leading-relaxed">
                    {activeModalInquiry.message}
                  </div>
                </div>
              )}

              {/* Internal Staff Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                    Internal Concierge & Staff Notes
                  </label>
                  <span className="text-[10px] text-gray-500">Visible only to admin team</span>
                </div>
                <textarea
                  rows={4}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="E.g. Called client on Nov 21. Needs cocktail setup and AV projection. Follow up on Monday with custom package quote."
                  className="w-full p-3.5 rounded-xl bg-[#0d0413] border border-brand-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-brand-900/60 flex items-center justify-between bg-[#12041b]">
              <button
                onClick={() => setActiveModalInquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={isUpdatingNotes}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-brand-950 font-black text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingNotes ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save Notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
