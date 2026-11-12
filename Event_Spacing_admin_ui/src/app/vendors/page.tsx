"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  Clock,
  Star,
  Phone,
  Mail,
  RefreshCw,
  Download,
  Search,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Layers,
  BadgeCheck,
  ShieldOff,
  Building2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  AdminPartnerServiceItem,
  AdminPartnerVenueItem,
  AdminUnifiedPartnerItem,
} from "@/types/admin";

type OfferingFilter = "all" | "venues" | "services" | "both";
type VerificationFilter = "all" | "verified" | "pending";
type SortField = "businessName" | "venuesCount" | "startingPrice" | "rating" | "createdAt";
type SortDirection = "asc" | "desc";

export default function AdminVendorsPage() {
  const [partners, setPartners] = useState<AdminUnifiedPartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters, sorting, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [offeringFilter, setOfferingFilter] = useState<OfferingFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Interactive modals / drawer / copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPartnerId, setViewingPartnerId] = useState<string | null>(null);

  // Edit Partner Modal state
  const [editingPartner, setEditingPartner] = useState<AdminUnifiedPartnerItem | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    isVerified: true,
  });
  const [isSavingPartner, setIsSavingPartner] = useState(false);

  // Edit Individual Service Modal state
  const [editingService, setEditingService] = useState<AdminPartnerServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    businessName: "",
    ownerName: "",
    category: "",
    city: "",
    locality: "",
    startingPrice: 0,
    priceUnit: "per day",
    phone: "",
    email: "",
    description: "",
    isVerified: true,
  });
  const [isSavingService, setIsSavingService] = useState(false);

  // Delete Individual Service Confirmation Modal state
  const [deleteServiceTarget, setDeleteServiceTarget] = useState<AdminPartnerServiceItem | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getVendors();
      if (res?.success && Array.isArray(res.data)) {
        setPartners(res.data);
      } else {
        setPartners([]);
      }
    } catch (err: any) {
      console.error("Failed to load vendors:", err);
      showBanner("error", err?.message || "Could not load vendor partners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, offeringFilter, categoryFilter, verificationFilter, pageSize]);

  // Keep drawer synced live with latest partners array
  const viewingPartner = useMemo(
    () => partners.find((p) => p.id === viewingPartnerId) || null,
    [partners, viewingPartnerId]
  );

  // Aggregate category & offering counts
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    partners.forEach((p) => {
      (p.categories || []).forEach((c) => set.add(c));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [partners]);

  const stats = useMemo(() => {
    const withVenues = partners.filter((p) => p.venuesCount > 0).length;
    const withServices = partners.filter((p) => p.servicesCount > 0).length;
    const both = partners.filter((p) => p.venuesCount > 0 && p.servicesCount > 0).length;
    return { withVenues, withServices, both };
  }, [partners]);

  // Filtered + Sorted partners
  const filteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = partners.filter((p) => {
      if (offeringFilter === "venues" && p.venuesCount === 0) return false;
      if (offeringFilter === "services" && p.servicesCount === 0) return false;
      if (offeringFilter === "both" && (p.venuesCount === 0 || p.servicesCount === 0)) return false;

      if (verificationFilter === "verified" && !p.isVerified) return false;
      if (verificationFilter === "pending" && p.isVerified) return false;

      if (categoryFilter !== "all" && !(p.categories || []).includes(categoryFilter)) {
        return false;
      }

      if (!q) return true;
      const venueNames = p.venues.map((v) => `${v.name} ${v.venueType} ${v.locality}`).join(" ");
      const serviceNames = p.services
        .map((s) => `${s.businessName} ${s.category} ${s.ownerName} ${s.locality}`)
        .join(" ");

      return (
        (p.businessName || "").toLowerCase().includes(q) ||
        (p.brandNames || []).join(" ").toLowerCase().includes(q) ||
        (p.ownerName || "").toLowerCase().includes(q) ||
        (p.contactNames || []).join(" ").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.localities || []).join(" ").toLowerCase().includes(q) ||
        venueNames.toLowerCase().includes(q) ||
        serviceNames.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "businessName":
          cmp = (a.businessName || "").localeCompare(b.businessName || "");
          break;
        case "venuesCount":
          cmp = a.venuesCount + a.servicesCount - (b.venuesCount + b.servicesCount);
          break;
        case "startingPrice":
          cmp = (a.startingPrice || 0) - (b.startingPrice || 0);
          break;
        case "rating":
          cmp = (a.rating || 0) - (b.rating || 0);
          break;
        case "createdAt":
        default:
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [partners, searchQuery, offeringFilter, categoryFilter, verificationFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPartners = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, safePage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "businessName" ? "asc" : "desc");
    }
  };

  const handleCopy = (key: string, val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Partner-level verify toggle
  const handleTogglePartnerVerified = async (partner: AdminUnifiedPartnerItem) => {
    const nextVerified = !partner.isVerified;
    try {
      if (partner.userId) {
        const res = await api.admin.updateVendorPartner(partner.userId, { isVerified: nextVerified });
        if (!res?.success) {
          showBanner("error", res?.message || "Failed to update verification.");
          return;
        }
      } else if (partner.primaryServiceId) {
        await api.admin.updateVendor(partner.primaryServiceId, { isVerified: nextVerified });
      }
      showBanner(
        "success",
        `${partner.businessName} marked as ${nextVerified ? "Verified Partner" : "Pending Review"}.`
      );
      fetchVendors();
    } catch (err: any) {
      showBanner("error", err?.message || "Failed to toggle verification status.");
    }
  };

  // Edit Partner Profile modal
  const openEditPartnerModal = (partner: AdminUnifiedPartnerItem) => {
    setEditingPartner(partner);
    setPartnerForm({
      businessName: partner.businessName || "",
      ownerName: partner.ownerName || "",
      phone: partner.phone || "",
      email: partner.email || "",
      isVerified: Boolean(partner.isVerified),
    });
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    setIsSavingPartner(true);
    try {
      if (editingPartner.userId) {
        const res = await api.admin.updateVendorPartner(editingPartner.userId, partnerForm);
        if (!res?.success) {
          showBanner("error", res?.message || "Failed to update partner.");
          return;
        }
      } else if (editingPartner.primaryServiceId) {
        const res = await api.admin.updateVendor(editingPartner.primaryServiceId, partnerForm);
        if (!res?.success) {
          showBanner("error", res?.message || "Failed to update partner.");
          return;
        }
      }
      showBanner("success", "Partner details updated successfully.");
      setEditingPartner(null);
      fetchVendors();
    } catch (err: any) {
      showBanner("error", err?.message || "Error saving partner details.");
    } finally {
      setIsSavingPartner(false);
    }
  };

  // Individual Venue actions inside Drawer
  const handleToggleVenueStatus = async (venue: AdminPartnerVenueItem) => {
    const nextStatus = venue.status === "live" ? "suspended" : "live";
    try {
      await api.admin.toggleVenueVerified(venue.id, {
        status: nextStatus,
        isVerified: nextStatus === "live",
      });
      showBanner(
        "success",
        `Venue "${venue.name}" marked as ${nextStatus === "live" ? "Live & Verified" : "Suspended"}.`
      );
      fetchVendors();
    } catch (err: any) {
      showBanner("error", err?.message || "Failed to update venue status.");
    }
  };

  // Individual Service actions inside Drawer
  const handleToggleServiceVerified = async (svc: AdminPartnerServiceItem) => {
    const nextVal = !svc.isVerified;
    try {
      await api.admin.updateVendor(svc.id, { isVerified: nextVal });
      showBanner(
        "success",
        `Service "${svc.businessName}" (${svc.category}) ${nextVal ? "verified" : "unverified"}.`
      );
      fetchVendors();
    } catch (err: any) {
      showBanner("error", err?.message || "Failed to update service.");
    }
  };

  const openEditServiceModal = (svc: AdminPartnerServiceItem) => {
    setEditingService(svc);
    setServiceForm({
      businessName: svc.businessName || "",
      ownerName: svc.ownerName || "",
      category: svc.category || "",
      city: svc.city || "Bengaluru",
      locality: svc.locality || "",
      startingPrice: svc.startingPrice || 0,
      priceUnit: svc.priceUnit || "per day",
      phone: svc.phone || "",
      email: svc.email || "",
      description: svc.description || "",
      isVerified: Boolean(svc.isVerified),
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setIsSavingService(true);
    try {
      const res = await api.admin.updateVendor(editingService.id, serviceForm);
      if (!res?.success) {
        showBanner("error", res?.message || "Failed to save service changes.");
        return;
      }
      showBanner("success", res.message || "Service updated successfully.");
      setEditingService(null);
      fetchVendors();
    } catch (err: any) {
      showBanner("error", err?.message || "Error updating service.");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleConfirmDeleteService = async () => {
    if (!deleteServiceTarget) return;
    setIsDeletingService(true);
    try {
      const res = await api.admin.deleteVendor(deleteServiceTarget.id);
      if (!res?.success) {
        showBanner("error", res?.message || "Failed to remove service.");
        return;
      }
      showBanner("success", res.message || "Service removed.");
      setDeleteServiceTarget(null);
      fetchVendors();
    } catch (err: any) {
      showBanner("error", err?.message || "Failed to delete service.");
    } finally {
      setIsDeletingService(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredPartners.length === 0) {
      showBanner("error", "No vendor partners available to export.");
      return;
    }

    const headers = [
      "Partner ID",
      "Business Names",
      "Primary Contact",
      "Venues Count",
      "Venues Listed",
      "Services Count",
      "Services Listed",
      "Categories & Types",
      "Localities",
      "Phone",
      "Email",
      "Status",
    ].join(",");

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = filteredPartners
      .map((p) =>
        [
          p.id,
          (p.brandNames || [p.businessName]).join(" / "),
          (p.contactNames || [p.ownerName]).join(" / "),
          p.venuesCount,
          p.venues.map((v) => `${v.name} (${v.venueType})`).join("; "),
          p.servicesCount,
          p.services.map((s) => `${s.businessName} (${s.category})`).join("; "),
          p.categories.join("; "),
          p.localities.join("; "),
          p.phone,
          p.email,
          p.isVerified ? "Verified Partner" : "Pending",
        ]
          .map(escapeCsv)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `event_spacing_vendor_partners_${Date.now()}.csv`);
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
            Partner Network
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Registered Vendor Partners (Live)
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Unified partner view combining each operator&apos;s owned venues and marketplace event services.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchVendors}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-800 text-gold-300 text-xs font-semibold hover:bg-brand-900 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
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
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)} className="font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setOfferingFilter("all")}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-gold-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Partners
            </span>
            <Users className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{partners.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Registered vendor operators</p>
        </button>

        <button
          type="button"
          onClick={() => setOfferingFilter("venues")}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-purple-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Partners With Venues
            </span>
            <Building2 className="w-4 h-4 text-purple-300" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.withVenues}</div>
          <p className="text-[11px] text-gray-400 mt-1">Banquet halls &amp; spaces</p>
        </button>

        <button
          type="button"
          onClick={() => setOfferingFilter("services")}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-amber-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400">
              Partners With Services
            </span>
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.withServices}</div>
          <p className="text-[11px] text-gray-400 mt-1">Photographers, decor, catering...</p>
        </button>

        <div className="p-5 rounded-2xl bg-[#14061d] border border-brand-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Verticals Active
            </span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{allCategories.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Venue types &amp; service categories</p>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="bg-[#14061d] rounded-2xl p-4 border border-brand-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { key: "all", label: `All (${partners.length})` },
              { key: "venues", label: `Has Venues (${stats.withVenues})` },
              { key: "services", label: `Has Services (${stats.withServices})` },
              { key: "both", label: `Venue + Service (${stats.both})` },
            ] as { key: OfferingFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOfferingFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                offeringFilter === tab.key
                  ? "bg-gold-500 text-brand-950 shadow-sm"
                  : "bg-brand-950 text-gray-300 border border-brand-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner, venue, service, phone..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="all">All Categories &amp; Venue Types</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as VerificationFilter)}
            className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Review</option>
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

      {/* 4. Unified Vendor Partners DataTable */}
      <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/50">
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("businessName")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Partner &amp; Brands</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Direct Contact</th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("rating")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Rating</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-900/40 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-400 mx-auto mb-2" />
                    <span>Loading vendor directory...</span>
                  </td>
                </tr>
              ) : paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-400">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-white font-semibold">No Vendor Partners Found</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Try clearing your search, offering filter, or category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((partner) => {
                  const brandTitle =
                    partner.brandNames && partner.brandNames.length > 0
                      ? partner.brandNames.join(" • ")
                      : partner.businessName;

                  return (
                    <tr key={partner.id} className="hover:bg-brand-950/40 transition-colors">
                      {/* Partner & Brands */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {partner.imageUrl ? (
                            <img
                              src={partner.imageUrl}
                              alt={partner.businessName}
                              className="w-10 h-10 rounded-xl object-cover border border-brand-800 shrink-0 bg-brand-950"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-brand-900 border border-brand-800 flex items-center justify-center font-bold text-gold-300 shrink-0">
                              {partner.businessName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setViewingPartnerId(partner.id)}
                              className="font-semibold text-white hover:text-gold-300 transition-colors text-left block truncate max-w-[220px] cursor-pointer"
                            >
                              {brandTitle}
                            </button>
                            <span className="text-[11px] text-gray-400 block truncate max-w-[220px]">
                              Contact:{" "}
                              <strong className="text-gray-200">
                                {(partner.contactNames || [partner.ownerName]).join(" / ")}
                              </strong>
                            </span>
                            <span className="text-[10px] font-mono text-gray-500">
                              ID: {partner.id.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Locality & City */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gold-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[160px]">{partner.locality || "Bengaluru"}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 block pl-4">
                          {partner.city || "Bengaluru"}
                        </span>
                      </td>

                      {/* Direct Contact */}
                      <td className="py-3.5 px-4 space-y-1">
                        {partner.phone ? (
                          <div className="flex items-center gap-1.5 text-gray-200 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-gold-400 shrink-0" />
                            <span>{partner.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`vp-${partner.id}`, partner.phone)}
                              className="text-gray-500 hover:text-gold-300 cursor-pointer"
                              title="Copy phone"
                            >
                              {copiedId === `vp-${partner.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic block">No phone</span>
                        )}

                        {partner.email ? (
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Mail className="w-3 h-3 text-gold-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{partner.email}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic block">No email</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 text-amber-300 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{Number(partner.rating || 4.8).toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          ({partner.reviewCount || 0} reviews)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePartnerVerified(partner)}
                          title="Click to toggle partner verification"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                            partner.isVerified
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                          }`}
                        >
                          {partner.isVerified ? (
                            <>
                              <BadgeCheck className="w-3 h-3" />
                              Verified Partner
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingPartnerId(partner.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-950 border border-brand-800 text-gray-200 hover:text-gold-300 hover:border-gold-500/40 transition-colors cursor-pointer text-[11px] font-semibold"
                            title="View Complete Portfolio (Venues & Services)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditPartnerModal(partner)}
                            className="p-2 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-blue-300 hover:border-blue-500/40 transition-colors cursor-pointer"
                            title="Edit Partner Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePartnerVerified(partner)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              partner.isVerified
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                            }`}
                            title={partner.isVerified ? "Unverify Partner" : "Verify Partner"}
                          >
                            {partner.isVerified ? (
                              <ShieldOff className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
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

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-brand-900/60 bg-brand-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <span>
            Showing{" "}
            <strong className="text-white">
              {filteredPartners.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
            </strong>
            –
            <strong className="text-white">
              {Math.min(safePage * pageSize, filteredPartners.length)}
            </strong>{" "}
            of <strong className="text-white">{filteredPartners.length}</strong> partner(s)
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
      {/* VIEW PARTNER PORTFOLIO DRAWER (VENUES + MARKETPLACE SERVICES)         */}
      {/* ===================================================================== */}
      {viewingPartner && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#14061d] border-l border-brand-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3 border-b border-brand-900/60 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block">
                  Unified Partner Portfolio
                </span>
                <h2 className="font-serif text-xl font-bold text-white">
                  {(viewingPartner.brandNames || [viewingPartner.businessName]).join(" • ")}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Contacts: {(viewingPartner.contactNames || [viewingPartner.ownerName]).join(" / ")}{" "}
                  &bull; <span className="font-mono">ID: {viewingPartner.id.slice(-8)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPartnerId(null)}
                className="p-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Partner Contact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Venues</span>
                <span className="font-bold text-purple-300 text-sm">
                  {viewingPartner.venuesCount} Added
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Services</span>
                <span className="font-bold text-gold-300 text-sm">
                  {viewingPartner.servicesCount} Added
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Phone</span>
                <span className="font-mono text-white">{viewingPartner.phone || "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Email</span>
                <span className="text-white break-all">{viewingPartner.email || "—"}</span>
              </div>
            </div>

            {/* Section 1: Venues Added by This Partner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Venues Added ({viewingPartner.venues.length})</span>
                </h3>
              </div>

              {viewingPartner.venues.length === 0 ? (
                <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-900/50 text-xs text-gray-500 italic">
                  No venue properties registered under this partner yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {viewingPartner.venues.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl bg-brand-950/70 border border-brand-900/60 flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="flex items-start gap-3">
                        {v.coverImage ? (
                          <img
                            src={v.coverImage}
                            alt={v.name}
                            className="w-16 h-16 rounded-xl object-cover border border-brand-800 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-brand-900 flex items-center justify-center text-purple-300 shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                        )}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-sm text-white">
                              {v.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                v.status === "live"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : v.status === "suspended"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {v.status}
                            </span>
                          </div>
                          <div className="text-gray-300">
                            {v.venueType} &bull; {v.locality}, {v.city}
                          </div>
                          <div className="text-[11px] text-gold-300 font-semibold">
                            ₹{(v.pricePerDay || 0).toLocaleString()} / day &bull; Capacity:{" "}
                            {v.seatingCapacity} Seated / {v.floatingCapacity} Floating
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleVenueStatus(v)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border ${
                            v.status === "live"
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                          }`}
                        >
                          {v.status === "live" ? "Suspend Venue" : "Approve & Go Live"}
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_CUSTOMER_URL || "http://localhost:3000"}/venues/${v.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gold-300"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Marketplace Services Added by This Partner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Marketplace Services Added ({viewingPartner.services.length})</span>
                </h3>
              </div>

              {viewingPartner.services.length === 0 ? (
                <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-900/50 text-xs text-gray-500 italic">
                  No marketplace event services registered under this partner yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {viewingPartner.services.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-brand-950/70 border border-brand-900/60 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex items-start gap-3">
                          {s.imageUrl && (
                            <img
                              src={s.imageUrl}
                              alt={s.businessName}
                              className="w-16 h-16 rounded-xl object-cover border border-brand-800 shrink-0"
                            />
                          )}
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-sm text-white">
                                {s.businessName}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-gold-300 border border-gold-500/30 text-[10px] font-bold">
                                {s.category}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  s.isVerified
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {s.isVerified ? "Verified" : "Unverified"}
                              </span>
                            </div>
                            <div className="text-gray-300">
                              Contact: {s.ownerName} &bull; {s.locality}, {s.city}
                            </div>
                            <div className="text-[11px] text-gold-300 font-semibold">
                              ₹{(s.startingPrice || 0).toLocaleString()} {s.priceUnit}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-center gap-1.5 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditServiceModal(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-900 border border-brand-700 text-[11px] font-semibold text-blue-300 hover:bg-brand-800 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleServiceVerified(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-900 border border-brand-700 text-[11px] font-semibold text-gold-300 hover:bg-brand-800 cursor-pointer"
                            >
                              {s.isVerified ? "Unverify" : "Verify"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteServiceTarget(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {s.description && (
                        <p className="text-[11px] text-gray-400 leading-relaxed border-t border-brand-900/50 pt-2">
                          {s.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="pt-4 border-t border-brand-900/60 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => openEditPartnerModal(viewingPartner)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold cursor-pointer"
              >
                Edit Partner Contact
              </button>
              <button
                type="button"
                onClick={() => handleTogglePartnerVerified(viewingPartner)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer ${
                  viewingPartner.isVerified
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {viewingPartner.isVerified ? "Mark Pending Review" : "Verify Partner Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EDIT PARTNER PROFILE MODAL                                            */}
      {/* ===================================================================== */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#14061d] border border-brand-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-900/60 pb-3">
              <h2 className="font-serif text-lg font-bold text-white">Edit Partner Account</h2>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Business / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={partnerForm.businessName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={partnerForm.ownerName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={partnerForm.isVerified}
                  onChange={(e) => setPartnerForm({ ...partnerForm, isVerified: e.target.checked })}
                  className="accent-gold-500"
                />
                <span>Verified Partner (syncs KYC &amp; linked listings)</span>
              </label>

              <div className="pt-3 border-t border-brand-900/60 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPartner}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingPartner ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EDIT INDIVIDUAL SERVICE MODAL                                         */}
      {/* ===================================================================== */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#14061d] border border-brand-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-900/60 pb-3">
              <h2 className="font-serif text-lg font-bold text-white">Edit Service Listing</h2>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.businessName}
                    onChange={(e) => setServiceForm({ ...serviceForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.ownerName}
                    onChange={(e) => setServiceForm({ ...serviceForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Starting Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={serviceForm.startingPrice}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, startingPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Locality</label>
                  <input
                    type="text"
                    value={serviceForm.locality}
                    onChange={(e) => setServiceForm({ ...serviceForm, locality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={serviceForm.city}
                    onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={serviceForm.isVerified}
                  onChange={(e) => setServiceForm({ ...serviceForm, isVerified: e.target.checked })}
                  className="accent-gold-500"
                />
                <span>Verified Marketplace Service</span>
              </label>

              <div className="pt-3 border-t border-brand-900/60 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingService ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DELETE INDIVIDUAL SERVICE CONFIRMATION MODAL                          */}
      {/* ===================================================================== */}
      {deleteServiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#14061d] border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-white">Remove Service Listing?</h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Remove <strong>{deleteServiceTarget.businessName}</strong> ({deleteServiceTarget.category}) from the marketplace? Any venues owned by this partner remain untouched.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteServiceTarget(null)}
                className="px-4 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingService}
                onClick={handleConfirmDeleteService}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              >
                {isDeletingService ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
