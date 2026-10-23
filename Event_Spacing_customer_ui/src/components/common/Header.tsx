"use client";

/**
 * @file Header.tsx
 * @description Global application header matching the exact reference layout: deep purple utility bar on top, crisp white main navbar with royal crest logo, deep purple navigation links, wishlist heart, sign in, and gold "List Your Venue" CTA.
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./Logo";

/**
 * Master navigation items for Event Spacing.
 */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Venues", href: "/venues" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "My Bookings", href: "/my-bookings" },
  { label: "Corporate", href: "/corporate" },
  { label: "About Us", href: "/about" },
];

interface NavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

/**
 * Inner navigation component that accurately highlights the active link.
 *
 * @param props - Navigation links props
 * @returns React JSX element
 */
function NavLinksInner({ isMobile, onLinkClick }: NavLinksProps) {
  const pathname = usePathname();

  /**
   * Evaluates if a given navigation link is currently active.
   *
   * @param href - The target route href
   * @returns boolean true if the route is active
   */
  const checkIsActive = (href: string) => {
    // Exact match for homepage
    if (href === "/") {
      return pathname === "/";
    }

    // Ignore hash links from auto-highlighting when on home
    if (href.startsWith("/#")) {
      return false;
    }

    // Active for matching section or sub-path
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (isMobile) {
    return (
      <>
        {NAV_LINKS.map((item) => {
          const isActive = checkIsActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onLinkClick}
              className={`block px-3 py-2 rounded-md font-semibold transition-colors ${
                isActive
                  ? "bg-purple-50 text-[#380c48] font-bold"
                  : "text-[#380c48] hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-8 text-[14px] font-semibold tracking-normal text-[#380c48]">
      {NAV_LINKS.map((item) => {
        const isActive = checkIsActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`transition-colors duration-200 py-1.5 relative ${
              isActive
                ? "text-[#380c48] font-bold"
                : "text-[#380c48]/90 hover:text-gold-600"
            }`}
          >
            {item.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#380c48] rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Fallback navigation links component used during SSR static prerendering.
 *
 * @param props - Navigation links props
 * @returns React JSX element
 */
function NavLinksFallback({ isMobile, onLinkClick }: NavLinksProps) {
  const pathname = usePathname();

  /**
   * Basic fallback active state determination without query param access.
   *
   * @param href - Target route href
   * @returns boolean true if link is active
   */
  const checkIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (isMobile) {
    return (
      <>
        {NAV_LINKS.map((item) => {
          const isActive = checkIsActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onLinkClick}
              className={`block px-3 py-2 rounded-md font-semibold ${
                isActive
                  ? "bg-purple-50 text-[#380c48] font-bold"
                  : "text-[#380c48] hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-8 text-[14px] font-semibold tracking-normal text-[#380c48]">
      {NAV_LINKS.map((item) => {
        const isActive = checkIsActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`transition-colors duration-200 py-1.5 relative ${
              isActive
                ? "text-[#380c48] font-bold"
                : "text-[#380c48]/90 hover:text-gold-600"
            }`}
          >
            {item.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#380c48] rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Suspense-wrapped Navigation Links component.
 *
 * @param props - Navigation links props
 * @returns React JSX element
 */
function NavLinks(props: NavLinksProps) {
  return (
    <React.Suspense fallback={<NavLinksFallback {...props} />}>
      <NavLinksInner {...props} />
    </React.Suspense>
  );
}

/**
 * Header component featuring top contact bar and white main brand navigation.
 *
 * @returns React JSX element
 */
export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bengaluru, Karnataka");

  /**
   * Toggles the mobile navigation drawer visibility.
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="w-full z-50 sticky top-0 shadow-md">
      {/* 1. Top Utility Info Bar (Deep Royal Purple) */}
      <div className="bg-[#380c48] text-white text-xs py-2 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left contact & location items */}
          <div className="flex items-center gap-5">
            {/* City Selector */}
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-gold-300 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <div className="flex items-center gap-1">
                <select
                  aria-label="Select City"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-white cursor-pointer focus:outline-none pr-1 text-xs font-medium"
                >
                  <option value="Bengaluru, Karnataka" className="bg-[#380c48] text-white">
                    Bengaluru, Karnataka
                  </option>
                  <option value="Mumbai, Maharashtra" className="bg-[#380c48] text-white">
                    Mumbai, Maharashtra
                  </option>
                  <option value="Delhi NCR" className="bg-[#380c48] text-white">
                    Delhi NCR
                  </option>
                  <option value="Hyderabad, Telangana" className="bg-[#380c48] text-white">
                    Hyderabad, Telangana
                  </option>
                  <option value="Chennai, Tamil Nadu" className="bg-[#380c48] text-white">
                    Chennai, Tamil Nadu
                  </option>
                </select>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </div>
            </div>

            <span className="text-white/30">|</span>

            {/* Helpline Phone */}
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 hover:text-gold-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span className="font-medium">+91 98765 43210</span>
            </a>

            <span className="text-white/30">|</span>

            {/* Email Address */}
            <a
              href="mailto:info@eventspacing.com"
              className="flex items-center gap-1.5 hover:text-gold-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span className="font-medium">info@eventspacing.com</span>
            </a>
          </div>

          {/* Right Partner & Help Links */}
          <div className="flex items-center gap-4 text-xs font-medium text-white/90">
            <Link
              href="/list-your-venue"
              className="hover:text-gold-300 transition-colors"
            >
              List Your Venue
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/list-your-venue"
              className="hover:text-gold-300 transition-colors"
            >
              Become a Vendor
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/#faq" className="hover:text-gold-300 transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean Pure White Background with Overhanging Logo) */}
      <nav className="bg-white border-b border-gray-100/80 text-brand-950 px-4 sm:px-8 h-16 sm:h-[66px] relative flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6 relative">
          {/* Royal Logo Emblem Overhanging the Bottom Border */}
          <div className="flex-shrink-0 relative w-36 sm:w-44 h-12 flex items-center">
            <div className="absolute top-1 sm:top-1.5 left-0 z-50 drop-shadow-xl transition-transform duration-200 hover:scale-105">
              <Logo size="lg" />
            </div>
          </div>

          {/* Center Navigation Links (Deep Purple Text) */}
          <NavLinks />

          {/* Right Section: Heart Wishlist + Sign In + Gold CTA */}
          <div className="hidden sm:flex items-center gap-6">
            {/* Wishlist Heart Icon */}
            <Link
              href="/venues"
              className="text-[#380c48] hover:text-rose-600 transition-colors p-1"
              title="Saved Venues"
            >
              <Heart className="w-5 h-5 stroke-[2]" />
            </Link>

            {/* User Sign In */}
            <Link
              href="/signin"
              className="flex items-center gap-1.5 text-[#380c48] hover:text-[#5a136b] text-sm font-semibold transition-colors"
            >
              <User className="w-4 h-4 stroke-[2.2]" />
              <span>Sign In</span>
            </Link>

            {/* Gold CTA "List Your Venue" */}
            <Link
              href="/list-your-venue"
              className="bg-[#e5a83b] hover:bg-[#d4992b] text-[#240b2e] font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 text-center whitespace-nowrap"
            >
              List Your Venue
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            <Link
              href="/list-your-venue"
              className="bg-[#e5a83b] text-[#240b2e] font-bold text-xs px-3 py-1.5 rounded-md sm:hidden shadow-xs"
            >
              List Venue
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-[#380c48] hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer (Positioned Absolutely Below Navbar) */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="lg:hidden fixed inset-0 top-[65px] bg-black/40 backdrop-blur-xs z-40 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide Drawer Content */}
            <div className="lg:hidden absolute top-full left-0 right-0 w-full bg-white shadow-2xl border-b border-gray-200 z-50 px-4 py-4 text-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <NavLinks isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />

              <div className="pt-2 border-t border-gray-100 px-3">
                <Link
                  href="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-[#380c48] py-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-500" /> Bengaluru
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gold-500" /> +91 98765 43210
                </span>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};
