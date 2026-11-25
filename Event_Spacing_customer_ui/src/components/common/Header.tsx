"use client";

/**
 * @file Header.tsx
 * @description Global application header matching the exact reference layout: deep purple utility bar on top, crisp white main navbar with royal crest logo, deep purple navigation links, wishlist heart, sign in, and gold "List Your Venue" CTA.
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  ShoppingBag,
  Gift,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Logo } from "./Logo";
import { useBookingCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
  const pathname = usePathname();
  const { count: cartCount } = useBookingCart();
  const { count: wishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bengaluru, Karnataka");
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
  } | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileDropdownOpen]);

  // Close profile dropdown on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const syncAuth = () => {
      try {
        const stored = localStorage.getItem("es_user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    syncAuth();

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("es_auth_token");
    localStorage.removeItem("es_user");
    setCurrentUser(null);
    window.location.href = "/";
  };

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
              <div className="relative flex items-center">
                <select
                  aria-label="Select City"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-transparent text-white cursor-pointer focus:outline-none pr-5 text-xs font-medium"
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
                <ChevronDown className="w-3 h-3 text-white/70 pointer-events-none -ml-4" />
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
            <a
              href={`${process.env.NEXT_PUBLIC_VENDOR_HUB_URL || "http://localhost:3001"}/signin`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-300 transition-colors"
            >
              Become a Vendor
            </a>
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

          {/* Right Section: Booking Cart + Heart + Sign In + Gold CTA */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Booking Preview Cart */}
            <Link
              href="/cart"
              className="relative text-[#380c48] hover:text-gold-600 transition-colors p-1.5"
              title="Booking Preview Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e5a83b] text-[#240b2e] text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Refer & Earn */}
            <Link
              href="/refer-and-earn"
              className="text-[#380c48] hover:text-gold-600 transition-colors p-1.5"
              title="Refer & Earn"
            >
              <Gift className="w-5 h-5 stroke-[2]" />
            </Link>

            {/* Wishlist Heart Icon */}
            <Link
              href="/wishlist"
              className="relative text-[#380c48] hover:text-rose-600 transition-colors p-1.5"
              title="Saved Venues"
            >
              <Heart className="w-5 h-5 stroke-[2]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Sign In / Profile Dropdown */}
            {currentUser ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-[#380c48] hover:text-[#5a136b] text-sm font-semibold transition-all bg-purple-50 hover:bg-purple-100/80 px-3 py-1.5 rounded-xl border border-purple-100/90 shadow-2xs cursor-pointer select-none"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-200/80 text-[#380c48] flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.name ? currentUser.name.charAt(0) : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {currentUser.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-purple-900/60 transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-purple-950/10 border border-purple-100/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Identity Header */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {currentUser.name || "Customer"}
                      </p>
                      {currentUser.email && (
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      )}
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#380c48] hover:bg-purple-50/70 transition-colors"
                      >
                        <User className="w-4 h-4 text-gold-600 stroke-[2.2]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/my-bookings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#380c48] hover:bg-purple-50/70 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#380c48] stroke-[2]" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#380c48] hover:bg-purple-50/70 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500 stroke-[2]" />
                        <span>Saved Venues</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 stroke-[2]" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="flex items-center gap-1.5 text-[#380c48] hover:text-[#5a136b] text-sm font-semibold transition-colors"
              >
                <User className="w-4 h-4 stroke-[2.2]" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            <Link
              href="/cart"
              className="relative p-1.5 text-[#380c48]"
              title="Booking Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#e5a83b] text-[#240b2e] text-[9px] font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
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
                {currentUser ? (
                  <div className="flex items-center justify-between py-1.5">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-[#380c48]"
                    >
                      <User className="w-4 h-4 text-gold-600" />
                      <span>{currentUser.name || "My Profile"}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-600 font-semibold cursor-pointer flex items-center gap-1 hover:text-rose-700"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-bold text-[#380c48] py-1.5"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 px-3">
                <Link
                  href="/list-your-venue"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-[#380c48] hover:text-gold-600 transition-colors"
                >
                  List Your Venue
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
