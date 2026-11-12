"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface AdminCatalogVenue {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  businessName?: string;
  vendorName?: string;
  venueType?: string;
  coverImage?: string;
  images?: string[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  status?: string;
  location?: {
    city?: string;
    locality?: string;
    fullAddress?: string;
  };
  capacity?: {
    minGuests?: number;
    maxGuests?: number;
    seatingCapacity?: number;
    floatingCapacity?: number;
    hallCount?: number;
  };
  pricing?: {
    pricePerDay?: number;
    halfDayPrice?: number;
    securityDeposit?: number;
  };
  amenities?: string[];
  eventTypes?: string[];
  shortDescription?: string;
  createdAt?: string;
}

type StatusFilter = "all" | "live" | "suspended";
type VerificationFilter = "all" | "verified" | "unverified";
type SortField = "name" | "vendorName" | "pricePerDay" | "maxGuests" | "status" | "createdAt";
type SortDirection = "asc" | "desc";

const BADGE_OPTIONS = [
  { value: "none", label: "No Badge" },
  { value: "Popular", label: "🔥 Popular" },
  { value: "Featured", label: "⭐ Featured" },
  { value: "Premium", label: "👑 Premium" },
  { value: "Budget Friendly", label: "🏷️ Budget Friendly" },
  { value: "New", label: "✨ New" },
  { value: "Free Venue Plan", label: "🎁 Free Venue Plan" },
];

const getVenueId = (v: AdminCatalogVenue) => v._id || v.id || "";

export default function AdminVenuesCatalogPage() {
  const [venues, setVenues] = useState<AdminCatalogVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters, sorting, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Interactive drawer & copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingVenueId, setViewingVenueId] = useState<string | null>(null);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getVenues();
      if (res?.success && Array.isArray(res.data)) {
        setVenues(res.data);
      } else {
        setVenues([]);
      }
    } catch (err: any) {
      console.error("Failed to load venues:", err);
      showBanner("error", err?.message || "Could not load platform venue catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedType, statusFilter, verificationFilter, pageSize]);

  const viewingVenue = useMemo(
    () => venues.find((v) => getVenueId(v) === viewingVenueId) || null,
    [venues, viewingVenueId]
  );

  // Distinct dropdown options
  const cities = useMemo(() => {
    const set = new Set<string>();
    venues.forEach((v) => {
      if (v.location?.city) set.add(v.location.city);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [venues]);

  const venueTypes = useMemo(() => {
    const set = new Set<string>();
    venues.forEach((v) => {
      if (v.venueType) set.add(v.venueType);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [venues]);

  const stats = useMemo(() => {
    const live = venues.filter((v) => (v.status || "live") === "live").length;
    const suspended = venues.filter((v) => v.status === "suspended").length;
    const verified = venues.filter((v) => Boolean(v.isVerified)).length;
    const featured = venues.filter((v) => Boolean(v.badge)).length;
    return { total: venues.length, live, suspended, verified, featured };
  }, [venues]);

  // Filtered + sorted rows
  const filteredVenues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = venues.filter((v) => {
      const status = v.status || "live";
      if (statusFilter === "live" && status !== "live") return false;
      if (statusFilter === "suspended" && status !== "suspended") return false;

      if (verificationFilter === "verified" && !v.isVerified) return false;
      if (verificationFilter === "unverified" && v.isVerified) return false;

      const city = v.location?.city || "";
      if (selectedCity !== "all" && city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      const vType = v.venueType || "";
      if (selectedType !== "all" && vType.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      if (!q) return true;
      const id = getVenueId(v);
      const name = v.name || "";
      const locality = v.location?.locality || "";
      const vendor = v.vendorName || v.businessName || "";

      return (
        name.toLowerCase().includes(q) ||
        locality.toLowerCase().includes(q) ||
        city.toLowerCase().includes(q) ||
        vendor.toLowerCase().includes(q) ||
        vType.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "vendorName":
          cmp = (a.vendorName || a.businessName || "").localeCompare(
            b.vendorName || b.businessName || ""
          );
          break;
        case "pricePerDay":
          cmp = (a.pricing?.pricePerDay || 0) - (b.pricing?.pricePerDay || 0);
          break;
        case "maxGuests":
          cmp = (a.capacity?.maxGuests || 0) - (b.capacity?.maxGuests || 0);
          break;
        case "status":
          cmp = (a.status || "live").localeCompare(b.status || "live");
          break;
        case "createdAt":
        default:
          cmp =
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [
    venues,
    searchQuery,
    selectedCity,
    selectedType,
    statusFilter,
    verificationFilter,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredVenues.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVenues = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredVenues.slice(start, start + pageSize);
  }, [filteredVenues, safePage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedType("all");
    setStatusFilter("all");
    setVerificationFilter("all");
  };

  // Shared helper for verified / badge / status mutations with rollback on failure
  const updateVenueField = async (
    id: string,
    payload: { isVerified?: boolean; badge?: string; status?: string },
    successMessage: string
  ) => {
    const prevSnapshot = venues.find((v) => getVenueId(v) === id);
    if (!prevSnapshot) return;

    setVenues((prev) =>
      prev.map((v) => (getVenueId(v) === id ? { ...v, ...payload } : v))
    );

    try {
      const res = await api.admin.toggleVenueVerified(id, payload);
      if (!res?.success) {
        setVenues((prev) =>
          prev.map((v) => (getVenueId(v) === id ? prevSnapshot : v))
        );
        showBanner("error", res?.message || "Could not update venue.");
        return;
      }
      showBanner("success", successMessage);
    } catch (err: any) {
      setVenues((prev) =>
        prev.map((v) => (getVenueId(v) === id ? prevSnapshot : v))
      );
      showBanner("error", err?.message || "Failed to persist venue update.");
    }
  };

  const toggleVerified = (venue: AdminCatalogVenue) => {
    const id = getVenueId(venue);
    const nextVal = !venue.isVerified;
    updateVenueField(
      id,
      { isVerified: nextVal },
      `${venue.name} marked as ${nextVal ? "Verified" : "Unverified"}.`
    );
  };

  const updateBadge = (venue: AdminCatalogVenue, badge: string) => {
    const id = getVenueId(venue);
    const badgeVal = badge === "none" ? "" : badge;
    updateVenueField(
      id,
      { badge: badgeVal },
      badgeVal
        ? `Assigned "${badgeVal}" badge to ${venue.name}.`
        : `Removed marketplace badge from ${venue.name}.`
    );
  };

  const toggleSuspension = (venue: AdminCatalogVenue) => {
    const id = getVenueId(venue);
    const isCurrentlyLive = (venue.status || "live") === "live";
    const nextStatus = isCurrentlyLive ? "suspended" : "live";
    updateVenueField(
      id,
      { status: nextStatus },
      `${venue.name} is now ${nextStatus === "live" ? "Live (Active)" : "Suspended"}.`
    );
  };

  const handleExportCsv = () => {
    if (filteredVenues.length === 0) {
      showBanner("error", "No venues available to export.");
      return;
    }

    const headers = [
      "Venue ID",
      "Venue Name",
      "Venue Type",
      "Vendor Partner",
      "Locality",
      "City",
      "Price Per Day (INR)",
      "Min Guests",
      "Max Guests",
      "Verified",
      "Marketplace Badge",
      "Status",
    ].join(",");

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = filteredVenues
      .map((v) =>
        [
          getVenueId(v),
          v.name,
          v.venueType || "Banquet Hall",
          v.vendorName || v.businessName || "",
          v.location?.locality || "",
          v.location?.city || "",
          v.pricing?.pricePerDay || 0,
          v.capacity?.minGuests || 50,
          v.capacity?.maxGuests || 500,
          v.isVerified ? "Verified" : "Unverified",
          v.badge || "None",
          (v.status || "live") === "live" ? "Live (Active)" : "Suspended",
        ]
          .map(escapeCsv)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `event_spacing_venue_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">
            Catalog Governance
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Platform Venue Catalog (Live)
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Control verified checkmarks, assign homepage feature badges, or suspend listings for policy violations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchVenues}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-200 hover:text-gold-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <a
            href="http://localhost:3000/venues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-800 text-gold-300 text-xs font-semibold hover:bg-brand-900 transition-colors"
          >
            <span>Preview Customer Discovery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
            banner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={resetFilters}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-gold-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Venues
            </span>
            <Building2 className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
          <p className="text-[11px] text-gray-400 mt-1">Catalog properties indexed</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("live")}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-emerald-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live Listings
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.live}</div>
          <p className="text-[11px] text-gray-400 mt-1">Visible to customers</p>
        </button>

        <button
          type="button"
          onClick={() =>
            setVerificationFilter((prev) => (prev === "verified" ? "all" : "verified"))
          }
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-purple-400/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Verified Venues
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-300" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.verified}</div>
          <p className="text-[11px] text-gray-400 mt-1">{stats.featured} carrying badges</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("suspended")}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-rose-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Suspended
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.suspended}</div>
          <p className="text-[11px] text-gray-400 mt-1">Held from storefront</p>
        </button>
      </div>

      {/* 3. DataTable Filter Toolbar */}
      <div className="bg-[#14061d] rounded-2xl p-4 border border-brand-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { key: "all", label: `All (${stats.total})` },
              { key: "live", label: `Live (${stats.live})` },
              { key: "suspended", label: `Suspended (${stats.suspended})` },
            ] as { key: StatusFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-gold-500 text-brand-950 shadow-sm"
                  : "bg-brand-950 text-gray-300 border border-brand-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Dropdowns + Page Size */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venue, locality, partner, ID..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="all">All Venue Types</option>
            {venueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as VerificationFilter)}
            className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="all">All Checks</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* 4. Platform Venue DataTable */}
      <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/50">
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Venue Details</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("vendorName")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Vendor Partner</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("pricePerDay")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Tariff &amp; Capacity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-center">Verified Check</th>
                <th className="py-3.5 px-4">Marketplace Badge</th>
                <th className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Listing Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-900/40 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-400 mx-auto mb-2" />
                    <span>Loading platform venue catalog...</span>
                  </td>
                </tr>
              ) : paginatedVenues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    <Building2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-white font-semibold">No Venues Found</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      No catalog properties match your current filters.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-brand-950 border border-brand-800 text-gold-300 text-[11px] font-semibold hover:text-white cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedVenues.map((v) => {
                  const id = getVenueId(v);
                  const isLive = (v.status || "live") === "live";

                  return (
                    <tr key={id} className="hover:bg-brand-950/40 transition-colors">
                      {/* Venue Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-950 border border-brand-800 shrink-0">
                            {v.coverImage ? (
                              <img
                                src={v.coverImage}
                                alt={v.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => setViewingVenueId(id)}
                              className="font-bold text-white hover:text-gold-300 transition-colors text-left block truncate max-w-[230px] cursor-pointer"
                            >
                              {v.name}
                            </button>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 truncate max-w-[230px]">
                              <MapPin className="w-3 h-3 text-gold-400 shrink-0" />
                              {v.location?.locality || "Central"}, {v.location?.city || "Bengaluru"}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded-md bg-brand-950 border border-brand-800/80 text-[10px] font-medium text-purple-200">
                              {v.venueType || "Banquet Hall"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vendor Partner */}
                      <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap">
                        <span className="font-semibold block text-white">
                          {v.vendorName || v.businessName || "Registered Partner"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono mt-0.5">
                          <span>ID: {id.slice(-8)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(id)}
                            className="text-gray-500 hover:text-gold-300 cursor-pointer"
                            title="Copy full venue ID"
                          >
                            {copiedId === id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tariff & Capacity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-gold-400 block">
                          ₹{(v.pricing?.pricePerDay || 0).toLocaleString("en-IN")} / day
                        </span>
                        <span className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-gray-500" />
                          {v.capacity?.minGuests || 50}–{v.capacity?.maxGuests || 500} Guests
                        </span>
                      </td>

                      {/* Verified check */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleVerified(v)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            v.isVerified
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                              : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
                          }`}
                          title="Click to toggle verified checkmark"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{v.isVerified ? "Verified" : "Unverified"}</span>
                        </button>
                      </td>

                      {/* Marketplace Feature Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={v.badge || "none"}
                          onChange={(e) => updateBadge(v, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-950 border border-brand-800 text-[11px] font-semibold text-gold-300 focus:outline-none focus:border-gold-500 cursor-pointer"
                        >
                          {BADGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleSuspension(v)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            isLive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300"
                              : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-300"
                          }`}
                          title={isLive ? "Click to suspend listing" : "Click to restore live"}
                        >
                          {isLive ? "Live (Active)" : "Suspended"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingVenueId(id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-950 border border-brand-800 text-gray-200 hover:text-gold-300 hover:border-gold-500/40 transition-colors cursor-pointer text-[11px] font-semibold"
                            title="Inspect venue catalog specification"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {v.slug && (
                            <a
                              href={`http://localhost:3000/venues/${v.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-gold-300 hover:border-gold-500/40 transition-colors"
                              title="Open Customer Storefront Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-brand-900/60 bg-brand-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <span>
            Showing{" "}
            <strong className="text-white">
              {filteredVenues.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
            </strong>
            –
            <strong className="text-white">
              {Math.min(safePage * pageSize, filteredVenues.length)}
            </strong>{" "}
            of <strong className="text-white">{filteredVenues.length}</strong> venue(s)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-semibold text-gray-200">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW VENUE DETAILS DRAWER                                            */}
      {/* ===================================================================== */}
      {viewingVenue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#14061d] border-l border-brand-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-4 border-b border-brand-900/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                  Venue Catalog Record
                </span>
                <h2 className="font-serif text-xl font-bold text-white mt-0.5">
                  {viewingVenue.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {viewingVenue.venueType || "Banquet Hall"} • Partner:{" "}
                  <strong className="text-gray-200">
                    {viewingVenue.vendorName || viewingVenue.businessName || "Registered Partner"}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingVenueId(null)}
                className="p-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cover Photo */}
            {viewingVenue.coverImage && (
              <div className="rounded-2xl overflow-hidden border border-brand-800 h-48 bg-brand-950">
                <img
                  src={viewingVenue.coverImage}
                  alt={viewingVenue.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Quick Governance Controls */}
            <div className="p-4 rounded-2xl bg-brand-950/70 border border-brand-900 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Verification &amp; Visibility
                  </span>
                  <span className="text-xs text-gray-300">
                    Rating:{" "}
                    <strong className="text-amber-300 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {Number(viewingVenue.rating || 4.8).toFixed(1)} ({viewingVenue.reviewCount || 0})
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleVerified(viewingVenue)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      viewingVenue.isVerified
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-gray-800 text-gray-300 border-gray-700"
                    }`}
                  >
                    {viewingVenue.isVerified ? "Verified ✓" : "Mark Verified"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSuspension(viewingVenue)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      (viewingVenue.status || "live") === "live"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {(viewingVenue.status || "live") === "live" ? "Live" : "Suspended"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-brand-900/60">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  Homepage Feature Badge
                </span>
                <select
                  value={viewingVenue.badge || "none"}
                  onChange={(e) => updateBadge(viewingVenue, e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#14061d] border border-brand-800 text-xs font-semibold text-gold-300 focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {BADGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing & Capacity Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-900/60">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Base Tariff
                </span>
                <span className="text-base font-bold text-gold-400 mt-1 block">
                  ₹{(viewingVenue.pricing?.pricePerDay || 0).toLocaleString("en-IN")} / day
                </span>
                {viewingVenue.pricing?.securityDeposit !== undefined && (
                  <span className="text-[11px] text-gray-400">
                    Deposit: ₹{viewingVenue.pricing.securityDeposit.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-950/60 border border-brand-900/60">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Guest Capacity
                </span>
                <span className="text-base font-bold text-white mt-1 block">
                  {viewingVenue.capacity?.minGuests || 50}–{viewingVenue.capacity?.maxGuests || 500}
                </span>
                <span className="text-[11px] text-gray-400">
                  Seating: {viewingVenue.capacity?.seatingCapacity || 300} • Floating:{" "}
                  {viewingVenue.capacity?.floatingCapacity || 500}
                </span>
              </div>
            </div>

            {/* Location & Description */}
            <div className="p-4 rounded-2xl bg-brand-950/60 border border-brand-900/60 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Location &amp; Address
              </span>
              <p className="text-white font-medium">
                {viewingVenue.location?.fullAddress ||
                  `${viewingVenue.location?.locality || "Central"}, ${
                    viewingVenue.location?.city || "Bengaluru"
                  }`}
              </p>
              {viewingVenue.shortDescription && (
                <p className="text-gray-400 pt-1 border-t border-brand-900/60">
                  {viewingVenue.shortDescription}
                </p>
              )}
            </div>

            {/* Amenities & Event Types */}
            {viewingVenue.amenities && viewingVenue.amenities.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Amenities ({viewingVenue.amenities.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingVenue.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2.5 py-1 rounded-lg bg-brand-950 border border-brand-800 text-[11px] text-gray-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Link */}
            {viewingVenue.slug && (
              <div className="pt-2 border-t border-brand-900/60 flex justify-end">
                <a
                  href={`http://localhost:3000/venues/${viewingVenue.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 text-brand-950 font-bold text-xs hover:bg-gold-400 transition-colors"
                >
                  <span>Open Live Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
