"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Download,
  Printer,
  ChevronRight,
  Filter,
  DollarSign,
  AlertCircle,
  FileText,
  Building2,
  Check,
  X,
  ExternalLink,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  List,
  LayoutGrid,
  Info,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";

type SortField = "eventDate" | "totalAmount" | "customerName" | "createdAt";
type SortDirection = "asc" | "desc";

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "completed" | "cancelled">("all");
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("eventDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.vendor.getBookings();
      if (res && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn("Failed to load vendor bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await api.vendor.updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (selectedInvoiceBooking && selectedInvoiceBooking._id === bookingId) {
        setSelectedInvoiceBooking((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update reservation status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export filtered bookings to CSV
  const handleExportCSV = () => {
    if (filteredAndSortedBookings.length === 0) return;

    const headers = [
      "Booking Reference",
      "Customer Name",
      "Phone",
      "Email",
      "Venue",
      "Space/Hall",
      "Event Date",
      "Time Slot",
      "Category",
      "Guests",
      "Package",
      "Total Tariff (INR)",
      "Advance Paid (INR)",
      "Balance Due (INR)",
      "Status",
      "Txn Reference",
      "Invoice Number",
      "Booked Date",
    ];

    const rows = filteredAndSortedBookings.map((b) => [
      `"${b.bookingRef || ""}"`,
      `"${b.customerName || ""}"`,
      `"${b.customerPhone || ""}"`,
      `"${b.customerEmail || ""}"`,
      `"${b.venueName || ""}"`,
      `"${b.selectedSpaceName || ""}"`,
      `"${b.eventDate || ""}"`,
      `"${b.timeSlot || ""}"`,
      `"${b.eventCategory || ""}"`,
      b.guestCount || 0,
      `"${b.packageTitle || ""}"`,
      b.totalAmount || 0,
      b.advancePaid || 0,
      b.balanceDue || 0,
      `"${b.status || ""}"`,
      `"${b.paymentDetails?.transactionId || ""}"`,
      `"${b.paymentDetails?.invoiceNumber || ""}"`,
      `"${new Date(b.createdAt).toISOString().split("T")[0]}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `EventSpacing_Bookings_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredAndSortedBookings = useMemo(() => {
    let result = bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.bookingRef?.toLowerCase().includes(query) ||
        b.customerName?.toLowerCase().includes(query) ||
        b.customerPhone?.includes(query) ||
        b.customerEmail?.toLowerCase().includes(query) ||
        b.venueName?.toLowerCase().includes(query) ||
        b.selectedSpaceName?.toLowerCase().includes(query) ||
        b.eventCategory?.toLowerCase().includes(query) ||
        b.eventDate?.includes(query);

      return matchesStatus && matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "eventDate") {
        comparison = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      } else if (sortField === "totalAmount") {
        comparison = (a.totalAmount || 0) - (b.totalAmount || 0);
      } else if (sortField === "customerName") {
        comparison = (a.customerName || "").localeCompare(b.customerName || "");
      } else if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [bookings, statusFilter, searchQuery, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(filteredAndSortedBookings.length / pageSize) || 1;
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Financial aggregates
  const totalAdvance = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.advancePaid || 0), 0);

  const totalBalanceDue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.balanceDue || 0), 0);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="w-full bg-[#faf7fb] min-h-screen pb-20">
      {/* 1. Header Banner */}
      <div className="bg-[#1f0528] text-white py-7 px-4 sm:px-8 border-b border-[#380c48]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e5a83b]/20 text-[#f3cf7a] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Online Reservations &bull; Advance Escrow</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Booking Management
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Track real-time confirmed event reservations, customer contacts, allocated halls, and escrow payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5 text-gold-300" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              title="Refresh bookings"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-bold text-xs shadow-md transition-all"
            >
              <Calendar className="w-4 h-4 text-brand-950" />
              <span>+ New Walk-In Booking</span>
            </Link>

            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-gold-300" />
              <span>Availability Calendar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Confirmed Bookings
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#380c48]">
                {confirmedCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                100% Locked
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Advance Deposits In Escrow
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-700">
                ₹{totalAdvance.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                Verified Token
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-soft">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Balance Receivable at Check-in
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-gray-900">
                ₹{totalBalanceDue.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                Due on arrival
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "all", label: `All Bookings (${bookings.length})` },
              { id: "confirmed", label: `Confirmed (${confirmedCount})` },
              { id: "completed", label: `Completed (${bookings.filter((b) => b.status === "completed").length})` },
              { id: "cancelled", label: `Cancelled (${bookings.filter((b) => b.status === "cancelled").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#380c48] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Search & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reference, customer, date..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#380c48]"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table" ? "bg-white text-[#380c48] shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
                title="DataTable View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "card" ? "bg-white text-[#380c48] shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Records Container: DataTable or Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-5">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
            <div className="w-10 h-10 border-4 border-[#380c48] border-t-gold-400 rounded-full animate-spin mx-auto" />
            <p className="font-serif text-lg font-bold text-gray-800">
              Loading Reservations...
            </p>
            <p className="text-xs text-gray-400">Fetching live bookings</p>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
            <Calendar className="w-12 h-12 text-gold-500 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-gray-900">
              No Reservations Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No reservations match your current search or status filter."
                : "You don't have any online bookings yet. As customers book your venue on Event Spacing, confirmed reservations with advance deposits will appear here."}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* ========================================================================= */
          /* TABLE VIEW (PRIMARY DATATABLE)                                           */
          /* ========================================================================= */
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                      >
                        <span>Booking ID &bull; Created</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </button>
                    </th>

                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("customerName")}
                        className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                      >
                        <span>Customer Contact</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </button>
                    </th>

                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("eventDate")}
                        className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                      >
                        <span>Event Date &bull; Slot</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </button>
                    </th>

                    <th className="py-3.5 px-4">Venue &bull; Hall Space</th>

                    <th className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSort("totalAmount")}
                        className="flex items-center justify-end gap-1 hover:text-gray-900 cursor-pointer w-full"
                      >
                        <span>Tariff &bull; Advance</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </button>
                    </th>

                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedBookings.map((b) => {
                    const isConfirmed = b.status === "confirmed";
                    const isCompleted = b.status === "completed";
                    const isCancelled = b.status === "cancelled";
                    const isExpanded = expandedRowId === b._id;

                    const cleanPhone = (b.customerPhone || "").replace(/\D/g, "");
                    const waNumber = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
                    const waLink = `https://wa.me/91${waNumber}?text=Hello%20${encodeURIComponent(b.customerName)},%20regarding%20your%20booking%20${b.bookingRef}%20at%20${encodeURIComponent(b.venueName)}`;

                    return (
                      <React.Fragment key={b._id}>
                        <tr
                          className={`hover:bg-purple-50/30 transition-colors ${
                            isExpanded ? "bg-purple-50/20" : ""
                          }`}
                        >
                          {/* 1. Booking ID & Created Date */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-[#380c48] bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                                  {b.bookingRef}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(b.bookingRef, b._id)}
                                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                  title="Copy Booking ID"
                                >
                                  {copiedId === b._id ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[11px] text-gray-400 block">
                                {new Date(b.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* 2. Customer Contact */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              <div className="font-bold text-gray-900 text-xs">
                                {b.customerName}
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${b.customerPhone}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 hover:text-[#380c48]"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{b.customerPhone}</span>
                                </a>

                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </a>
                              </div>
                              <span className="text-[11px] text-gray-400 block truncate max-w-[180px]">
                                {b.customerEmail}
                              </span>
                            </div>
                          </td>

                          {/* 3. Event Schedule */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#e5a83b]" />
                                <span>{b.eventDate}</span>
                              </div>
                              <span className="text-[11px] text-gray-600 block">
                                {b.timeSlot}
                              </span>
                              <span className="inline-block text-[10px] font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                {b.eventCategory}
                              </span>
                            </div>
                          </td>

                          {/* 4. Venue & Hall */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              <span className="font-semibold text-gray-800 block truncate max-w-[170px]">
                                {b.venueName}
                              </span>
                              <span className="text-[11px] text-gray-600 font-medium block">
                                🏛️ {b.selectedSpaceName || "Main Hall"}
                              </span>
                              <span className="text-[11px] text-gray-500 block">
                                👥 {b.guestCount} Guests &bull; {b.packageTitle}
                              </span>
                            </div>
                          </td>

                          {/* 5. Tariff & Financials */}
                          <td className="py-3.5 px-4 align-top text-right">
                            <div className="space-y-1">
                              <span className="font-bold text-gray-900 text-xs block">
                                ₹{b.totalAmount.toLocaleString()}
                              </span>
                              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Paid: ₹{b.advancePaid.toLocaleString()}</span>
                              </div>
                              <span className="text-[10px] text-gray-500 block">
                                Balance: ₹{b.balanceDue.toLocaleString()}
                              </span>
                              {(b as any).paymentGateway === "razorpay" ? (
                                <span className="inline-block text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                  Razorpay Gateway
                                </span>
                              ) : (
                                <span className="inline-block text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                  Direct Token
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 6. Status Badge */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isConfirmed
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : isCancelled
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>

                          {/* 7. Action Buttons */}
                          <td className="py-3.5 px-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedInvoiceBooking(b)}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                title="View Tax Invoice"
                              >
                                <FileText className="w-4 h-4 text-[#380c48]" />
                              </button>

                              {isConfirmed && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, "completed")}
                                  disabled={updatingId === b._id}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Mark Check-in Completed"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  setExpandedRowId(isExpanded ? null : b._id)
                                }
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                                title="Toggle details"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Row Details */}
                        {isExpanded && (
                          <tr className="bg-purple-50/30 border-b border-gray-200">
                            <td colSpan={7} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-2xl border border-purple-100">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                    Gateway Verification &bull; Escrow
                                  </span>
                                  <p className="font-mono text-gray-800 pt-0.5">
                                    Ref: <strong>{b.paymentDetails?.transactionId || "TXN_UPI_VERIFIED"}</strong>
                                  </p>
                                  <p className="text-gray-500 text-[11px]">
                                    Method: {b.paymentDetails?.paymentMethod || "UPI"}
                                  </p>
                                  <p className="text-gray-500 text-[11px]">
                                    Invoice No: {b.paymentDetails?.invoiceNumber || `INV-2026-${b.bookingRef.slice(-4)}`}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                    Deposit &amp; Policies
                                  </span>
                                  <p className="text-gray-700 pt-0.5">
                                    Security Deposit: <strong>₹{b.securityDeposit?.toLocaleString() || "10,000"}</strong> (Refundable)
                                  </p>
                                  <p className="text-gray-500 text-[11px]">
                                    Refund terms: 85% refundable 14+ days prior.
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                    Special Customer Notes
                                  </span>
                                  <p className="text-gray-700 italic pt-0.5">
                                    {b.specialRequests || "No special instructions provided by customer."}
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
            <div className="p-4 bg-gray-50/70 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredAndSortedBookings.length)} of{" "}
                {filteredAndSortedBookings.length} reservations
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="font-bold text-gray-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CARD VIEW (COMPACT GRID MODE)                                            */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedBookings.map((b) => {
              const isConfirmed = b.status === "confirmed";
              const cleanPhone = (b.customerPhone || "").replace(/\D/g, "");
              const waNumber = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
              const waLink = `https://wa.me/91${waNumber}?text=Hello%20${encodeURIComponent(b.customerName)},%20regarding%20your%20booking%20${b.bookingRef}%20at%20${encodeURIComponent(b.venueName)}`;

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-soft hover:shadow-card transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#380c48] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                      {b.bookingRef}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-gray-900">{b.customerName}</h3>
                    <p className="text-xs text-gray-500">{b.venueName} &bull; {b.selectedSpaceName}</p>
                    <p className="text-xs font-semibold text-[#e5a83b]">📅 {b.eventDate} ({b.timeSlot})</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Total Tariff</span>
                      <strong className="text-gray-900">₹{b.totalAmount.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 block uppercase font-bold">Advance Paid</span>
                      <strong className="text-emerald-700">₹{b.advancePaid.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <button
                      onClick={() => setSelectedInvoiceBooking(b)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Digital Tax Invoice Modal */}
      {selectedInvoiceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1f0528] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gold-300 uppercase tracking-widest block">
                  Digital Tax Invoice
                </span>
                <h3 className="font-serif text-xl font-bold">
                  {selectedInvoiceBooking.paymentDetails?.invoiceNumber ||
                    `INV-2026-${selectedInvoiceBooking.bookingRef.slice(-4)}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceBooking(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{selectedInvoiceBooking.venueName}</p>
                  <p className="text-gray-500">
                    {selectedInvoiceBooking.locality}, {selectedInvoiceBooking.city}
                  </p>
                  <p className="text-gray-400 text-[10px]">
                    GSTIN: 29AABCE8901F1Z2 &bull; SAC: 997212
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ADVANCE PAID
                  </span>
                  <p className="text-gray-400 text-[10px] mt-1">
                    {selectedInvoiceBooking.bookingRef}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Billed To
                </span>
                <p className="font-bold text-gray-900">
                  {selectedInvoiceBooking.customerName}
                </p>
                <p className="text-gray-600">
                  {selectedInvoiceBooking.customerPhone} &bull;{" "}
                  {selectedInvoiceBooking.customerEmail}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>
                    Venue Rental ({selectedInvoiceBooking.selectedSpaceName} -{" "}
                    {selectedInvoiceBooking.eventDate})
                  </span>
                  <span className="font-bold text-gray-900">
                    ₹{selectedInvoiceBooking.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                  <span>GST (CGST 9% + SGST 9%)</span>
                  <span className="text-emerald-700 font-semibold">Included</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                  <span>Refundable Security Deposit</span>
                  <span>
                    ₹
                    {selectedInvoiceBooking.securityDeposit?.toLocaleString() ||
                      "10,000"}
                  </span>
                </div>
                <div className="flex justify-between py-2 font-bold text-sm">
                  <span>Total Amount</span>
                  <span>
                    ₹{selectedInvoiceBooking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#380c48] block">
                    Advance Token Paid (30%)
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Ref:{" "}
                    {selectedInvoiceBooking.paymentDetails?.transactionId ||
                      "TXN_UPI_VERIFIED"}
                  </span>
                </div>
                <span className="font-serif font-extrabold text-base text-[#380c48]">
                  ₹{selectedInvoiceBooking.advancePaid.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#380c48] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gold-400" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
