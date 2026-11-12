"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  X,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Loader2,
  UserCog,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  AdminUserDetailResponse,
  AdminUserItem,
  AdminUserKycStatus,
  AdminUserRole,
  AdminUsersSummary,
} from "@/types/admin";

type RoleFilter = "all" | AdminUserRole;
type StatusFilter = "all" | "active" | "blocked" | "unverified";
type SortField = "name" | "role" | "bookingsCount" | "isBlocked" | "createdAt";
type SortDirection = "asc" | "desc";

const QUICK_BLOCK_REASONS = [
  "Suspicious UPI UTR / payment proof",
  "Platform policy violation",
  "Spam or duplicate test account",
  "Unresolved chargeback / dispute",
];

const ROLE_STYLES: Record<AdminUserRole, { label: string; badge: string; avatar: string }> = {
  organizer: {
    label: "Customer",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    avatar: "from-blue-500/30 to-indigo-600/30 text-blue-200 border-blue-500/40",
  },
  vendor: {
    label: "Vendor Partner",
    badge: "bg-gold-500/20 text-gold-300 border border-gold-500/30",
    avatar: "from-amber-500/30 to-gold-600/30 text-gold-200 border-gold-500/40",
  },
  admin: {
    label: "Admin",
    badge: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    avatar: "from-purple-500/30 to-fuchsia-600/30 text-purple-200 border-purple-500/40",
  },
};

const KYC_STYLES: Record<AdminUserKycStatus, string> = {
  verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  pending: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  rejected: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name?: string): string {
  const parts = (name || "U").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummary>({
    totalUsers: 0,
    organizersCount: 0,
    vendorsCount: 0,
    adminsCount: 0,
    blockedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters, sorting & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Row selection & copy state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBulkWorking, setIsBulkWorking] = useState(false);

  // View slide-over drawer state
  const [viewingUser, setViewingUser] = useState<AdminUserItem | null>(null);
  const [viewDetail, setViewDetail] = useState<AdminUserDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "organizer" as AdminUserRole,
    companyName: "",
    businessName: "",
    gstNumber: "",
    panNumber: "",
    kycStatus: "verified" as AdminUserKycStatus,
    isPhoneVerified: false,
    isEmailVerified: false,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Block / Unblock modal state
  const [blockTarget, setBlockTarget] = useState<AdminUserItem | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const recomputeSummary = (list: AdminUserItem[]): AdminUsersSummary => ({
    totalUsers: list.length,
    organizersCount: list.filter((u) => u.role === "organizer").length,
    vendorsCount: list.filter((u) => u.role === "vendor").length,
    adminsCount: list.filter((u) => u.role === "admin").length,
    blockedCount: list.filter((u) => u.isBlocked).length,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getUsers();
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
        setSummary(res.summary || recomputeSummary(res.data));
      } else {
        setUsers([]);
        if (res?.message) showBanner("error", res.message);
      }
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      showBanner("error", err?.message || "Could not load users from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, pageSize]);

  // Filtered + Sorted rows
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "active" && u.isBlocked) return false;
      if (statusFilter === "blocked" && !u.isBlocked) return false;
      if (statusFilter === "unverified" && (u.isPhoneVerified || u.isEmailVerified)) return false;

      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.businessName || "").toLowerCase().includes(q) ||
        (u.companyName || "").toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "role":
          cmp = (a.role || "").localeCompare(b.role || "");
          break;
        case "bookingsCount":
          cmp = (a.bookingsCount || 0) - (b.bookingsCount || 0);
          break;
        case "isBlocked":
          cmp = Number(a.isBlocked) - Number(b.isBlocked);
          break;
        case "createdAt":
        default:
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, safePage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "createdAt" || field === "bookingsCount" ? "desc" : "asc");
    }
  };

  // Selection helpers
  const allVisibleSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedIds.has(u.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        paginatedUsers.forEach((u) => next.delete(u.id));
      } else {
        paginatedUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyText = (id: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Export
  const handleExportCsv = (onlySelected = false) => {
    const source = onlySelected
      ? filteredUsers.filter((u) => selectedIds.has(u.id))
      : filteredUsers;

    if (source.length === 0) {
      showBanner("error", "No users to export.");
      return;
    }

    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Business/Company",
      "Status",
      "Block Reason",
      "KYC Status",
      "Phone Verified",
      "Email Verified",
      "Bookings",
      "Total Spent (INR)",
      "Venues Owned",
      "Joined Date",
    ].join(",");

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = source
      .map((u) =>
        [
          u.id,
          u.name,
          u.email,
          u.phone,
          u.role,
          u.businessName || u.companyName || "",
          u.isBlocked ? "Blocked" : "Active",
          u.blockedReason || "",
          u.kycStatus,
          u.isPhoneVerified ? "Yes" : "No",
          u.isEmailVerified ? "Yes" : "No",
          u.bookingsCount,
          u.totalSpent,
          u.venuesCount,
          formatDate(u.createdAt),
        ]
          .map(escapeCsv)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `event_spacing_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // View Drawer handler
  const openViewDrawer = async (user: AdminUserItem) => {
    setViewingUser(user);
    setViewDetail(null);
    setIsLoadingDetail(true);
    try {
      const res = await api.admin.getUserById(user.id);
      if (res?.success && res?.data) {
        setViewDetail(res.data);
      }
    } catch (err) {
      console.warn("Could not load user activity details:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Edit Modal handler
  const openEditModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setEditError(null);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "organizer",
      companyName: user.companyName || "",
      businessName: user.businessName || "",
      gstNumber: user.gstNumber || "",
      panNumber: user.panNumber || "",
      kycStatus: user.kycStatus || "verified",
      isPhoneVerified: Boolean(user.isPhoneVerified),
      isEmailVerified: Boolean(user.isEmailVerified),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.name.trim()) {
      setEditError("Full Name is required.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);
    try {
      const res = await api.admin.updateUser(editingUser.id, editForm);
      if (!res?.success) {
        setEditError(res?.message || "Failed to update user.");
        return;
      }

      const updatedFields = res.data || editForm;
      setUsers((prev) => {
        const nextList = prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...updatedFields } : u
        );
        setSummary(recomputeSummary(nextList));
        return nextList;
      });

      if (viewingUser?.id === editingUser.id) {
        setViewingUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
      }

      showBanner("success", res.message || "User updated successfully.");
      setEditingUser(null);
    } catch (err: any) {
      setEditError(err?.message || "Unexpected error while updating user.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Block / Unblock handlers
  const openBlockModal = (user: AdminUserItem) => {
    setBlockTarget(user);
    setBlockReason(user.blockedReason || "");
  };

  const handleConfirmBlockToggle = async () => {
    if (!blockTarget) return;
    const nextBlocked = !blockTarget.isBlocked;

    setIsTogglingBlock(true);
    try {
      const res = await api.admin.toggleUserBlock(blockTarget.id, {
        isBlocked: nextBlocked,
        blockedReason: nextBlocked ? blockReason.trim() : "",
      });

      if (!res?.success) {
        showBanner("error", res?.message || "Could not update block status.");
        return;
      }

      setUsers((prev) => {
        const nextList = prev.map((u) =>
          u.id === blockTarget.id
            ? {
                ...u,
                isBlocked: nextBlocked,
                blockedReason: nextBlocked ? blockReason.trim() : "",
                blockedAt: nextBlocked ? new Date().toISOString() : null,
              }
            : u
        );
        setSummary(recomputeSummary(nextList));
        return nextList;
      });

      if (viewingUser?.id === blockTarget.id) {
        setViewingUser((prev) =>
          prev
            ? {
                ...prev,
                isBlocked: nextBlocked,
                blockedReason: nextBlocked ? blockReason.trim() : "",
              }
            : prev
        );
      }

      showBanner(
        "success",
        res.message ||
          `User "${blockTarget.name}" has been ${nextBlocked ? "blocked" : "unblocked"}.`
      );
      setBlockTarget(null);
    } catch (err: any) {
      showBanner("error", err?.message || "Failed to update block status.");
    } finally {
      setIsTogglingBlock(false);
    }
  };

  // Bulk Block / Unblock
  const handleBulkBlock = async (shouldBlock: boolean) => {
    const targets = users.filter((u) => selectedIds.has(u.id));
    if (targets.length === 0) return;

    setIsBulkWorking(true);
    try {
      await Promise.all(
        targets.map((u) =>
          api.admin.toggleUserBlock(u.id, {
            isBlocked: shouldBlock,
            blockedReason: shouldBlock ? "Bulk moderation action by Admin" : "",
          })
        )
      );

      setUsers((prev) => {
        const nextList = prev.map((u) =>
          selectedIds.has(u.id)
            ? {
                ...u,
                isBlocked: shouldBlock,
                blockedReason: shouldBlock ? "Bulk moderation action by Admin" : "",
                blockedAt: shouldBlock ? new Date().toISOString() : null,
              }
            : u
        );
        setSummary(recomputeSummary(nextList));
        return nextList;
      });

      showBanner(
        "success",
        `${targets.length} account(s) ${shouldBlock ? "blocked" : "unblocked"} successfully.`
      );
      setSelectedIds(new Set());
    } catch {
      showBanner("error", "One or more accounts failed to update.");
    } finally {
      setIsBulkWorking(false);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.admin.deleteUser(deleteTarget.id);
      if (!res?.success) {
        showBanner("error", res?.message || "Could not delete user.");
        return;
      }

      setUsers((prev) => {
        const nextList = prev.filter((u) => u.id !== deleteTarget.id);
        setSummary(recomputeSummary(nextList));
        return nextList;
      });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      if (viewingUser?.id === deleteTarget.id) {
        setViewingUser(null);
      }

      showBanner("success", res.message || `Deleted account "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch (err: any) {
      showBanner("error", err?.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeUserDetail = viewDetail?.user || viewingUser;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">
            User Governance &amp; Access Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            All Registered Users
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Search, inspect, edit profiles, verify KYC status, and block or unblock customer &amp; vendor accounts in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCsv(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900/60 border border-brand-800 text-gold-300 text-xs font-semibold hover:bg-brand-900 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
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

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setRoleFilter("all");
            setStatusFilter("all");
          }}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-gold-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Users
            </span>
            <Users className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{summary.totalUsers}</div>
          <p className="text-[11px] text-gray-400 mt-1">All registered accounts</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleFilter("organizer");
            setStatusFilter("all");
          }}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-blue-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Customers
            </span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{summary.organizersCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Event organizers &amp; guests</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleFilter("vendor");
            setStatusFilter("all");
          }}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-gold-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400">
              Vendor Partners
            </span>
            <Building2 className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{summary.vendorsCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Venue &amp; service partners</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleFilter("all");
            setStatusFilter("blocked");
          }}
          className="text-left p-5 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-rose-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Blocked Accounts
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{summary.blockedCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Suspended from sign-in</p>
        </button>
      </div>

      {/* 3. Toolbar: Search, Role Tabs, Status & Page Size */}
      <div className="bg-[#14061d] rounded-2xl p-4 border border-brand-900/60 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: "all", label: `All (${summary.totalUsers})` },
                { key: "organizer", label: `Customers (${summary.organizersCount})` },
                { key: "vendor", label: `Vendors (${summary.vendorsCount})` },
                { key: "admin", label: `Admins (${summary.adminsCount})` },
              ] as { key: RoleFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  roleFilter === tab.key
                    ? "bg-gold-500 text-brand-950 shadow-sm"
                    : "bg-brand-950 text-gray-300 border border-brand-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Status Select, Page Size */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone, company..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500 cursor-pointer"
              title="Rows per page"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="p-3 rounded-xl bg-brand-950/90 border border-gold-500/40 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-gold-300">
              {selectedIds.size} user(s) selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isBulkWorking}
                onClick={() => handleBulkBlock(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold cursor-pointer disabled:opacity-50"
              >
                Block Selected
              </button>
              <button
                type="button"
                disabled={isBulkWorking}
                onClick={() => handleBulkBlock(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold cursor-pointer disabled:opacity-50"
              >
                Unblock Selected
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv(true)}
                className="px-3 py-1.5 rounded-lg bg-brand-900 hover:bg-brand-800 text-gold-300 border border-brand-700 text-[11px] font-bold cursor-pointer"
              >
                Export Selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-white text-[11px] cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. DataTable */}
      <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/50">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    className="accent-gold-500 cursor-pointer"
                    aria-label="Select all visible users"
                  />
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>User &amp; Identity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("role")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Role</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("bookingsCount")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Activity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("isBlocked")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Status &amp; KYC</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-white cursor-pointer uppercase"
                  >
                    <span>Joined</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-900/40 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-400 mx-auto mb-2" />
                    <span>Loading platform users...</span>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400">
                    <UserCog className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-white font-semibold">No matching users found</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Try adjusting your search query, role filter, or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const roleMeta = ROLE_STYLES[user.role] || ROLE_STYLES.organizer;
                  const isChecked = selectedIds.has(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        user.isBlocked
                          ? "bg-rose-950/15 hover:bg-rose-950/25"
                          : "hover:bg-brand-950/40"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(user.id)}
                          className="accent-gold-500 cursor-pointer"
                          aria-label={`Select ${user.name}`}
                        />
                      </td>

                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleMeta.avatar} border flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openViewDrawer(user)}
                              className="font-semibold text-white hover:text-gold-300 transition-colors text-left truncate block max-w-[180px] cursor-pointer"
                            >
                              {user.name}
                            </button>
                            {(user.businessName || user.companyName) && (
                              <span className="text-[11px] text-gray-400 block truncate max-w-[180px]">
                                {user.businessName || user.companyName}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-gray-500">
                              #{user.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 space-y-1">
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="truncate max-w-[190px]">{user.email}</span>
                            {user.isEmailVerified && (
                              <CheckCircle2
                                className="w-3 h-3 text-emerald-400 shrink-0"
                                aria-label="Email verified"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic block">No email</span>
                        )}

                        {user.phone ? (
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Phone className="w-3 h-3 text-gold-400 shrink-0" />
                            <span className="font-mono text-[11px]">{user.phone}</span>
                            {user.isPhoneVerified && (
                              <CheckCircle2
                                className="w-3 h-3 text-emerald-400 shrink-0"
                                aria-label="Phone verified"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyText(`p-${user.id}`, user.phone)}
                              className="text-gray-500 hover:text-gold-300 cursor-pointer"
                              title="Copy phone"
                            >
                              {copiedId === `p-${user.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic block">No phone</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleMeta.badge}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-gray-200 font-medium">
                          {user.bookingsCount} booking{user.bookingsCount === 1 ? "" : "s"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {user.role === "vendor" || user.venuesCount > 0
                            ? `${user.venuesCount} venue${user.venuesCount === 1 ? "" : "s"}`
                            : `₹${(user.totalSpent || 0).toLocaleString()} spent`}
                        </div>
                      </td>

                      {/* Status & KYC */}
                      <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                        <div>
                          {user.isBlocked ? (
                            <span
                              title={user.blockedReason || "Account blocked by admin"}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            >
                              <Ban className="w-2.5 h-2.5" />
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Active
                            </span>
                          )}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold uppercase border ${
                              KYC_STYLES[user.kycStatus] || KYC_STYLES.verified
                            }`}
                          >
                            KYC: {user.kycStatus}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openViewDrawer(user)}
                            className="p-2 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-gold-300 hover:border-gold-500/40 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-blue-300 hover:border-blue-500/40 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openBlockModal(user)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              user.isBlocked
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                                : "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                            }`}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {user.isBlocked ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Ban className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-colors cursor-pointer"
                            title="Delete User"
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

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-brand-900/60 bg-brand-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <span>
            Showing{" "}
            <strong className="text-white">
              {filteredUsers.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
            </strong>
            –
            <strong className="text-white">
              {Math.min(safePage * pageSize, filteredUsers.length)}
            </strong>{" "}
            of <strong className="text-white">{filteredUsers.length}</strong> user(s)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-brand-950 border border-brand-800 text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
              aria-label="Previous page"
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
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: VIEW USER DETAILS SLIDE-OVER DRAWER                          */}
      {/* ===================================================================== */}
      {viewingUser && activeUserDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#14061d] border-l border-brand-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-brand-900/60 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                    (ROLE_STYLES[activeUserDetail.role] || ROLE_STYLES.organizer).avatar
                  } border flex items-center justify-center font-bold text-base`}
                >
                  {getInitials(activeUserDetail.name)}
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-white">
                    {activeUserDetail.name}
                  </h2>
                  <p className="text-[11px] font-mono text-gray-400">
                    ID: {activeUserDetail.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeUserDetail.isBlocked && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-xs">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Ban className="w-4 h-4" /> Account Currently Blocked
                </span>
                <p className="text-rose-200/80">
                  Reason: {activeUserDetail.blockedReason || "Suspended by administrator."}
                </p>
                {activeUserDetail.blockedAt && (
                  <p className="text-[10px] text-rose-300/70">
                    Blocked on {formatDate(activeUserDetail.blockedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Profile & Verification Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Role</span>
                <span className="font-bold text-gold-300">
                  {(ROLE_STYLES[activeUserDetail.role] || ROLE_STYLES.organizer).label}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  KYC Status
                </span>
                <span className="font-bold uppercase text-white">
                  {activeUserDetail.kycStatus}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Email</span>
                <span className="text-white break-all">{activeUserDetail.email || "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Phone</span>
                <span className="font-mono text-white">{activeUserDetail.phone || "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Business / Company
                </span>
                <span className="text-white">
                  {activeUserDetail.businessName || activeUserDetail.companyName || "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Joined Date
                </span>
                <span className="text-white">{formatDate(activeUserDetail.createdAt)}</span>
              </div>
            </div>

            {(activeUserDetail.gstNumber ||
              activeUserDetail.panNumber ||
              viewDetail?.user?.bankDetails?.accountNumber) && (
              <div className="p-4 rounded-2xl bg-brand-950/60 border border-brand-900/50 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-gold-400 block">
                  Tax &amp; Settlement Credentials
                </span>
                {activeUserDetail.gstNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">GSTIN:</span>
                    <span className="font-mono text-white">{activeUserDetail.gstNumber}</span>
                  </div>
                )}
                {activeUserDetail.panNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">PAN:</span>
                    <span className="font-mono text-white">{activeUserDetail.panNumber}</span>
                  </div>
                )}
                {viewDetail?.user?.bankDetails?.accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank Account:</span>
                    <span className="font-mono text-white">
                      {viewDetail.user.bankDetails.bankName} ({viewDetail.user.bankDetails.accountNumber})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Activity Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Platform Activity
              </h3>

              {isLoadingDetail ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-gold-400" />
                  Loading activity history...
                </div>
              ) : (
                <>
                  {viewDetail?.ownedVenues && viewDetail.ownedVenues.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-gray-300 block">
                        Owned Venues ({viewDetail.ownedVenues.length})
                      </span>
                      {viewDetail.ownedVenues.map((v) => (
                        <div
                          key={v._id}
                          className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white block">{v.name}</span>
                            <span className="text-[10px] text-gray-400">
                              {v.venueType} &bull; {v.location?.locality || v.location?.city}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-gray-300 block">
                      Recent Bookings ({viewDetail?.recentBookings?.length || 0})
                    </span>
                    {!viewDetail?.recentBookings || viewDetail.recentBookings.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No bookings linked yet.</p>
                    ) : (
                      viewDetail.recentBookings.map((b) => (
                        <div
                          key={b._id}
                          className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white block">{b.venueName}</span>
                            <span className="text-[10px] font-mono text-gray-400">
                              {b.bookingRef} &bull; {b.eventDate}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gold-300 block">
                              ₹{(b.totalAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] uppercase text-gray-400">{b.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-4 border-t border-brand-900/60 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => openEditModal(activeUserDetail)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => openBlockModal(activeUserDetail)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer ${
                  activeUserDetail.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {activeUserDetail.isBlocked ? "Unblock User" : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT USER FORM                                               */}
      {/* ===================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#14061d] border border-brand-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-900/60 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-white">Edit User Account</h2>
                <p className="text-[11px] text-gray-400 font-mono">ID: {editingUser.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value as AdminUserRole })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="organizer">Customer (Organizer)</option>
                    <option value="vendor">Vendor Partner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    KYC Status
                  </label>
                  <select
                    value={editForm.kycStatus}
                    onChange={(e) =>
                      setEditForm({ ...editForm, kycStatus: e.target.value as AdminUserKycStatus })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={editForm.gstNumber}
                    onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={editForm.panNumber}
                    onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isPhoneVerified}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isPhoneVerified: e.target.checked })
                    }
                    className="accent-gold-500"
                  />
                  <span>Phone Verified</span>
                </label>

                <label className="inline-flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isEmailVerified}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isEmailVerified: e.target.checked })
                    }
                    className="accent-gold-500"
                  />
                  <span>Email Verified</span>
                </label>
              </div>

              <div className="pt-3 border-t border-brand-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-brand-950 border border-brand-800 text-gray-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: BLOCK / UNBLOCK CONFIRMATION                                 */}
      {/* ===================================================================== */}
      {blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#14061d] border border-brand-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {blockTarget.isBlocked ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Ban className="w-5 h-5 text-rose-400" />
                )}
                <h2 className="font-serif text-lg font-bold text-white">
                  {blockTarget.isBlocked ? "Unblock User Account" : "Block User Account"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {blockTarget.role === "admin" && !blockTarget.isBlocked && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Warning: <strong>{blockTarget.name}</strong> has an <strong>Admin</strong> role. Blocking this account revokes their administrative access.
                </span>
              </div>
            )}

            <p className="text-xs text-gray-300 leading-relaxed">
              {blockTarget.isBlocked ? (
                <>
                  Restore sign-in and platform access for <strong>{blockTarget.name}</strong>?
                </>
              ) : (
                <>
                  Blocking <strong>{blockTarget.name}</strong> immediately revokes sign-in, OTP requests, and authenticated actions.
                </>
              )}
            </p>

            {!blockTarget.isBlocked && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-300">
                  Block Reason (optional, shown on denied login)
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-white focus:outline-none focus:border-gold-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_BLOCK_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setBlockReason(reason)}
                      className="px-2 py-1 rounded-lg bg-brand-950 border border-brand-800 text-[10px] text-gray-300 hover:text-gold-300 cursor-pointer"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="px-4 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTogglingBlock}
                onClick={handleConfirmBlockToggle}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50 ${
                  blockTarget.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {isTogglingBlock
                  ? "Updating..."
                  : blockTarget.isBlocked
                  ? "Confirm Unblock"
                  : "Confirm Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION                                          */}
      {/* ===================================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#14061d] border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-white">Delete User Account?</h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong> (
              {deleteTarget.email || deleteTarget.phone || deleteTarget.id})? Existing booking &amp; financial records will remain intact for audit compliance, while this user credential cannot be restored.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

