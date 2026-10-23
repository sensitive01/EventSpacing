"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Users,
  Layers,
  Receipt,
  Bell,
  Search,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  LogOut,
  Lock,
} from "lucide-react";
import { mockApprovalQueue } from "@/data/mockAdminData";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pendingApprovalsCount = mockApprovalQueue.filter((a) => a.status === "pending").length;

  const navigationItems = [
    { name: "Operations Dashboard", href: "/", icon: LayoutDashboard },
    {
      name: "Verification Queue",
      href: "/approvals",
      icon: ShieldCheck,
      badge: `${pendingApprovalsCount} Action`,
      isUrgent: true,
    },
    { name: "Venue Catalog", href: "/venues", icon: Building2 },
    { name: "Vendor Partners", href: "/vendors", icon: Users },
    { name: "Master Taxonomies", href: "/master-data", icon: Layers },
    { name: "Transactions & GMV", href: "/transactions", icon: Receipt },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // If on authentication pages, render full-screen standalone layout without sidebar
  if (pathname === "/signin" || pathname === "/login") {
    return <main className="min-h-screen w-full bg-[#0d0413] text-gray-100">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#0d0413] flex text-gray-100">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#14061d] text-white border-r border-brand-900/60 shrink-0 select-none">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-brand-900/50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-gold-600 flex items-center justify-center text-brand-950 font-bold shadow-lg">
              <ShieldAlert className="w-5 h-5 text-brand-950" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-wide text-white block leading-tight">
                Event Spacing
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">
                Admin Control Deck
              </span>
            </div>
          </Link>
        </div>

        {/* Security Role Tag */}
        <div className="px-4 py-3 border-b border-brand-900/40 bg-brand-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-gray-300">Operations SuperAdmin</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30">
            PROD
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-300 border border-gold-500/40 shadow-sm"
                    : "text-gray-300 hover:bg-brand-900/40 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-gold-400" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isUrgent
                        ? "bg-amber-500 text-brand-950 shadow-xs animate-pulse"
                        : "bg-brand-800 text-gold-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Portal Jump Links Footer */}
        <div className="p-4 border-t border-brand-900/50 bg-[#0f0416] space-y-2 text-[11px]">
          <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Connected Workspaces
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-gray-400 hover:text-gold-400 transition-colors"
          >
            <span>Customer Discovery UI</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-gray-400 hover:text-gold-400 transition-colors"
          >
            <span>Vendor Partner Hub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <div className="pt-2 border-t border-brand-900/40">
            <Link
              href="/signin"
              className="flex items-center justify-between text-gray-400 hover:text-amber-400 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>Lock Console / Sign Out</span>
              </span>
              <LogOut className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#14061d] border-b border-brand-900/60 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:bg-brand-900/40"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-serif font-bold text-white">Event Spacing Admin</span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 max-w-md w-full bg-brand-950/70 border border-brand-800/60 rounded-xl px-3 py-1.5 focus-within:border-gold-500 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search venue ID, vendor company, GSTIN, booking reference..."
              className="w-full text-xs bg-transparent border-none outline-none text-gray-100 placeholder-gray-500"
            />
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/approvals"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{pendingApprovalsCount} Venues Awaiting KYC</span>
            </Link>

            <div className="relative p-2 rounded-xl text-gray-400 hover:bg-brand-900/40 cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
            </div>

            <div className="h-6 w-px bg-brand-900/60"></div>

            <Link
              href="/signin"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Click to view sign in or switch admin role"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-500 to-amber-400 text-brand-950 font-bold text-xs flex items-center justify-center shadow-xs">
                SA
              </div>
              <span className="hidden sm:block text-xs font-semibold text-gray-200">
                Super Admin
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#14061d] text-white p-4 border-b border-brand-900/80 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-xs text-gray-200 hover:bg-brand-900/60"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gold-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-brand-950 font-bold">
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
