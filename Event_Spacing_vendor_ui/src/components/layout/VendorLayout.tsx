"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  CalendarDays,
  Wallet,
  Settings,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Store,
  Star,
} from "lucide-react";
import { api } from "@/lib/api";

interface VendorLayoutProps {
  children: React.ReactNode;
}

export const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeVenueDropdown, setActiveVenueDropdown] = useState(false);
  const [addListingDropdown, setAddListingDropdown] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string>("Loading workspace...");
  const [userVenues, setUserVenues] = useState<any[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState<number>(0);
  const [vendorUser, setVendorUser] = useState<any>(null);

  // Sync current authenticated vendor session from localStorage and backend
  useEffect(() => {
    let isMounted = true;

    const syncVendor = () => {
      try {
        const stored = localStorage.getItem("es_vendor_user");
        if (stored) {
          setVendorUser(JSON.parse(stored));
        } else {
          setVendorUser(null);
        }
      } catch {
        setVendorUser(null);
      }
    };

    syncVendor();

    // Fetch user's venues & stats for sidebar workspace and badge
    const loadSidebarData = async () => {
      try {
        const [venuesRes, statsRes] = await Promise.allSettled([
          api.vendor.getVenues(),
          api.vendor.getStats(),
        ]);

        if (isMounted) {
          if (venuesRes.status === "fulfilled") {
            const val = venuesRes.value;
            const fetched = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
            setUserVenues(fetched);
            if (fetched.length > 0) {
              setSelectedVenue(fetched[0].name);
            } else {
              setSelectedVenue("No Active Venue");
            }
          } else {
            setSelectedVenue("No Active Venue");
          }

          if (statsRes.status === "fulfilled" && statsRes.value?.data) {
            setNewLeadsCount(statsRes.value.data.newLeads || 0);
            setConfirmedBookingsCount(statsRes.value.data.confirmedBookings || 0);
          }
        }
      } catch (err) {
        if (isMounted) setSelectedVenue("No Active Venue");
      }
    };

    loadSidebarData();

    window.addEventListener("vendor-auth-change", syncVendor);
    window.addEventListener("storage", syncVendor);
    return () => {
      isMounted = false;
      window.removeEventListener("vendor-auth-change", syncVendor);
      window.removeEventListener("storage", syncVendor);
    };
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("es_vendor_token");
      localStorage.removeItem("es_vendor_user");
      window.dispatchEvent(new Event("vendor-auth-change"));
    }
    router.push("/signin");
  };

  const displayName = vendorUser?.name || "Partner Account";
  const displayBusiness =
    vendorUser?.businessName ||
    vendorUser?.companyName ||
    (userVenues.length > 0 ? userVenues[0].name : "Event Partner");

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EP";

  const navigationItems: Array<{
    name: string;
    href: string;
    icon: any;
    badge?: string;
    isHighlight?: boolean;
  }> = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Venues", href: "/venues", icon: Building2 },
    { name: "Marketplace Services", href: "/services", icon: Store },
    {
      name: "Bookings",
      href: "/bookings",
      icon: CheckCircle2,
      badge: confirmedBookingsCount > 0 ? `${confirmedBookingsCount} Booked` : undefined,
    },
    {
      name: "Leads & Inquiries",
      href: "/leads",
      icon: MessageSquare,
      badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined,
    },
    { name: "Availability Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Customer Reviews", href: "/reviews", icon: Star },
    { name: "Payouts & Finance", href: "/payouts", icon: Wallet },
    { name: "Business Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // If on authentication pages, render full-screen standalone layout without sidebar
  if (pathname === "/signin" || pathname === "/login") {
    return <main className="min-h-screen w-full bg-[#faf7fb]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#faf7fb] flex text-gray-900">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#21092c] text-white border-r border-brand-900/40 shrink-0 select-none">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-brand-800/40 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold-500 to-amber-300 flex items-center justify-center text-brand-950 font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-brand-950" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-wide text-white block leading-tight">
                Event Spacing
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
                Vendor Partner Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Business Selector Pill */}
        <div className="px-4 py-3 border-b border-brand-800/30">
          <div className="relative">
            <button
              onClick={() => setActiveVenueDropdown(!activeVenueDropdown)}
              className="w-full text-left p-2.5 rounded-xl bg-brand-900/60 hover:bg-brand-900 border border-brand-700/40 flex items-center justify-between transition-colors"
            >
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active Workspace</p>
                <p className="text-xs font-semibold text-white truncate">{selectedVenue}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gold-400 shrink-0 ml-1" />
            </button>

            {activeVenueDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2b0d38] border border-brand-700/60 rounded-xl shadow-2xl p-1 z-50">
                {userVenues.length === 0 ? (
                  <div className="p-2 text-center text-xs text-gray-400">
                    <p>No venues listed yet</p>
                    <Link
                      href="/venues/new"
                      onClick={() => setActiveVenueDropdown(false)}
                      className="mt-1 block text-gold-400 hover:underline font-bold text-[11px]"
                    >
                      + List Your First Venue
                    </Link>
                  </div>
                ) : (
                  <>
                    {userVenues.map((v: any) => (
                      <button
                        key={v.id || v._id}
                        onClick={() => {
                          setSelectedVenue(v.name);
                          setActiveVenueDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                          selectedVenue === v.name
                            ? "bg-gold-500/20 text-gold-300 font-semibold"
                            : "text-gray-300 hover:bg-brand-800/60"
                        }`}
                      >
                        <span className="truncate">{v.name}</span>
                        {selectedVenue === v.name && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                      </button>
                    ))}
                    <div className="pt-1 mt-1 border-t border-brand-800">
                      <Link
                        href="/venues/new"
                        onClick={() => setActiveVenueDropdown(false)}
                        className="block px-3 py-1.5 text-xs text-gold-400 hover:bg-brand-800/60 rounded-lg font-semibold"
                      >
                        + Add Another Venue
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-300 border border-gold-500/30 shadow-sm"
                    : item.isHighlight
                    ? "bg-brand-800/40 text-gold-300 hover:bg-brand-800/80 border border-gold-500/20"
                    : "text-gray-300 hover:bg-brand-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-gold-400" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-brand-950 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Verified Partner Badge & Profile Footer */}
        <div className="p-4 border-t border-brand-800/40 bg-brand-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-brand-950 font-bold shadow-md shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate">
                  {displayName}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-gray-400 truncate">{displayBusiness}</p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-brand-900/80 flex items-center justify-between text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified Vendor
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-serif font-bold text-brand-950">Event Spacing Vendor</span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 max-w-md w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-gold-500 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings, customer leads, invoice reference..."
              className="w-full text-xs bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setAddListingDropdown(!addListingDropdown)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                <span>Add Listing</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-0.5" />
              </button>

              {addListingDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/venues/new"
                    onClick={() => setAddListingDropdown(false)}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-brand-50/60 text-gray-800 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-900 group-hover:text-gold-400 transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-gray-900">List a Venue</span>
                      <span className="text-[10px] text-gray-500 block leading-tight">Banquet, lawn, resort, convention center</span>
                    </div>
                  </Link>

                  <Link
                    href="/services/new"
                    onClick={() => setAddListingDropdown(false)}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gold-50/60 text-gray-800 transition-colors group mt-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-gold-500 group-hover:text-brand-950 transition-colors">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-gray-900">List an Event Service</span>
                      <span className="text-[10px] text-gray-500 block leading-tight">Catering, Photography, DJ, Decor & more</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/leads"
              className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {newLeadsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500"></span>
              )}
            </Link>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Account Settings"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-gray-800">
                  {displayName}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#21092c] text-white p-4 border-b border-brand-800 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-xs text-gray-200 hover:bg-brand-900"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gold-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold-500 text-brand-950 font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* 3. Page Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};