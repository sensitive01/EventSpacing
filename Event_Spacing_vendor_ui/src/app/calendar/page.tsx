"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  AlertTriangle,
  Info,
  X,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  User,
  DollarSign,
  Tag,
} from "lucide-react";
import { DateAvailability, SlotStatus } from "@/types/vendor";
import { api } from "@/lib/api";

export default function VendorCalendarPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [calendarDates, setCalendarDates] = useState<DateAvailability[]>([]);
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [seasonalMultiplier, setSeasonalMultiplier] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic month navigation state (defaults to December 2026 where verified bookings exist)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 11, 1));

  // Compute month geometry
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth(); // 0 to 11
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const currentMonthName = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToMonth = (targetYear: number, targetMonth: number) => {
    setCurrentMonthDate(new Date(targetYear, targetMonth, 1));
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch live venues and calendar slots from backend
  const fetchCalendar = useCallback(async (venueId: string) => {
    if (!venueId) return;
    try {
      const calRes = await api.vendor.getCalendar(venueId);
      if (calRes?.data && Array.isArray(calRes.data)) {
        setCalendarDates(calRes.data);
      }
    } catch (err) {
      console.warn("Failed to fetch calendar slots from backend:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const venuesRes = await api.vendor.getVenues();
        if (isMounted && venuesRes?.data && Array.isArray(venuesRes.data)) {
          const vList = venuesRes.data;
          setVenues(vList);
          if (vList.length > 0) {
            const initialId = vList[0].id || vList[0]._id;
            setSelectedVenue(initialId);
            const calRes = await api.vendor.getCalendar(initialId);
            if (isMounted && calRes?.data && Array.isArray(calRes.data)) {
              setCalendarDates(calRes.data);
            }
          }
        }
      } catch (err) {
        console.warn("Error loading calendar venues:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // When selected venue changes, reload calendar
  const handleVenueChange = async (newVenueId: string) => {
    setSelectedVenue(newVenueId);
    setIsLoading(true);
    await fetchCalendar(newVenueId);
    setIsLoading(false);
  };

  // Format date helper: YYYY-MM-DD
  const getDateKey = (dayNum: number): string => {
    const dayStr = String(dayNum).padStart(2, "0");
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    return `${currentYear}-${monthStr}-${dayStr}`;
  };

  const getDateInfo = (dayNum: number): DateAvailability | undefined => {
    const dateKey = getDateKey(dayNum);
    return calendarDates.find((d) => d.date === dateKey);
  };

  const handleDateClick = (dayNum: number) => {
    const dateKey = getDateKey(dayNum);
    setSelectedDateModal(dateKey);
    const existing = calendarDates.find((d) => d.date === dateKey);
    setSeasonalMultiplier((existing as any)?.priceModifier || 1.0);
    setActionReason(existing?.notes || "");
  };

  // Toggle block / unblock slot
  const toggleBlockDate = async (dateStr: string, currentStatus?: SlotStatus) => {
    const existing = calendarDates.find((d) => d.date === dateStr);
    if (existing?.status === "booked") {
      alert("Cannot modify a confirmed booking date directly. Please manage this via the Bookings tab.");
      return;
    }

    const targetStatus = existing?.status === "blocked" ? "available" : "blocked";
    setIsSubmitting(true);

    try {
      const res = await api.vendor.toggleDateBlock({
        venueId: selectedVenue,
        date: dateStr,
        status: targetStatus,
        notes: targetStatus === "blocked" ? actionReason || "Vendor maintenance block" : "",
        priceModifier: (existing as any)?.priceModifier || 1.0,
      });

      if (res?.success) {
        showToast(
          targetStatus === "blocked"
            ? `Date ${dateStr} successfully blocked for maintenance.`
            : `Date ${dateStr} successfully unblocked and marked available.`
        );
      }

      await fetchCalendar(selectedVenue);
      setSelectedDateModal(null);
      setActionReason("");
    } catch (err: any) {
      console.warn("Backend slot update failed:", err);
      const errMsg = err?.response?.data?.message || "Failed to update slot status.";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply seasonal pricing multiplier
  const handleApplySeasonalPricing = async (multiplier: number) => {
    if (!selectedDateModal) return;
    const dateStr = selectedDateModal;
    const existing = calendarDates.find((d) => d.date === dateStr);

    if (existing?.status === "booked") {
      alert("Cannot change pricing for a date with an active confirmed customer booking.");
      return;
    }

    const notes =
      multiplier > 1
        ? `Peak Muhurtham Surge (${multiplier}x)`
        : multiplier < 1
        ? `Off-Peak Special (${multiplier}x)`
        : "";

    setIsSubmitting(true);
    try {
      await api.vendor.toggleDateBlock({
        venueId: selectedVenue,
        date: dateStr,
        status: existing?.status || "available",
        priceModifier: multiplier,
        notes: notes || existing?.notes || "",
      });

      showToast(`Seasonal pricing multiplier (${multiplier}x) applied to ${dateStr}.`);
      await fetchCalendar(selectedVenue);
      setSelectedDateModal(null);
    } catch (err: any) {
      console.warn("Backend seasonal pricing update failed:", err);
      const errMsg = err?.response?.data?.message || "Failed to update seasonal price.";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active venue metadata
  const activeVenueData = venues.find((v) => (v.id || v._id) === selectedVenue) || venues[0];
  const activeDateInfo = selectedDateModal ? calendarDates.find((d) => d.date === selectedDateModal) : null;

  // Filtered month statistics
  const currentMonthSlots = calendarDates.filter((d) => d.date.startsWith(monthPrefix));
  const bookedCount = currentMonthSlots.filter((d) => d.status === "booked").length;
  const blockedCount = currentMonthSlots.filter((d) => d.status === "blocked").length;
  const availableCount = Math.max(0, daysInMonth - bookedCount - blockedCount);

  // Format human-friendly date string for modal
  const formatModalDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch {}
    return dateStr;
  };

  if (!isLoading && venues.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Slot Availability</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Availability &amp; Bookings Calendar</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Block maintenance dates, monitor confirmed event bookings, and control seasonal tariffs.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-soft p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-gold-100 to-amber-50 border border-gold-200 text-brand-900 flex items-center justify-center mx-auto shadow-inner">
            <CalendarIcon className="w-10 h-10 text-gold-600" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-gray-900">No Venues in Portfolio</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              You must list a venue before managing its availability calendar, blocking maintenance days, and reviewing customer event dates.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/venues/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>List Your First Venue Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-900 text-white shadow-xl border border-gold-500/40 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Venue Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Operational Schedule</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Availability &amp; Bookings Calendar</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time synchronization with customer reservations, maintenance block controls, and peak seasonal rates.
          </p>
        </div>

        {/* Venue Selector */}
        {venues.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-gray-200/90 shadow-2xs">
            <Building2 className="w-4 h-4 text-brand-900 flex-shrink-0" />
            <select
              value={selectedVenue}
              onChange={(e) => handleVenueChange(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer pr-4"
            >
              {venues.map((v) => (
                <option key={v.id || v._id} value={v.id || v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Calendar Stats Bar for Current Active Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Month</span>
          <span className="text-xl font-bold text-gray-900">{daysInMonth} Days</span>
          <span className="text-[11px] text-gray-500 block truncate">{currentMonthName}</span>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-purple-700 block">Confirmed Bookings</span>
          <span className="text-xl font-bold text-brand-900">{bookedCount} Dates</span>
          <span className="text-[11px] text-purple-600 font-medium block">Locked &amp; Advance Paid</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Blocked Slots</span>
          <span className="text-xl font-bold text-amber-900">{blockedCount} Dates</span>
          <span className="text-[11px] text-amber-600 font-medium block">Maintenance / Private</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Slots</span>
          <span className="text-xl font-bold text-emerald-900">{availableCount} Dates</span>
          <span className="text-[11px] text-emerald-600 font-medium block">Open for Reservation</span>
        </div>
      </div>

      {/* 3. Main Interactive Calendar Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-6">
        {/* Month Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">{currentMonthName}</h2>
          </div>

          {/* Controls: Prev, Next, Quick Jump */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleJumpToMonth(2026, 10)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                currentMonth === 10 && currentYear === 2026
                  ? "bg-brand-900 text-white border-brand-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Nov 2026
            </button>
            <button
              onClick={() => handleJumpToMonth(2026, 11)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                currentMonth === 11 && currentYear === 2026
                  ? "bg-brand-900 text-white border-brand-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Dec 2026 (Live Bookings)
            </button>
            <button
              onClick={() => handleJumpToMonth(2027, 0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                currentMonth === 0 && currentYear === 2027
                  ? "bg-brand-900 text-white border-brand-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Jan 2027
            </button>

            <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-brand-900 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                title="Next Month"
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-brand-900 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-gray-700">Available for Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-900"></span>
              <span className="font-semibold text-brand-950">Confirmed Booking (Locked)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-medium text-amber-800">Blocked / Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                ⚡ Peak Surge
              </span>
              <span className="text-gray-500">Muhurtham Rate</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            <span>Click any date cell to manage or inspect details</span>
          </div>
        </div>

        {/* Calendar 7-Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
            <div
              key={dayName}
              className={`text-center text-xs font-bold py-2 uppercase tracking-wider ${
                idx === 0 || idx === 6 ? "text-gold-600" : "text-gray-400"
              }`}
            >
              {dayName}
            </div>
          ))}

          {/* 1. Leading Empty Padding Cells to align Month Start Day */}
          {Array.from({ length: startDayOfWeek }).map((_, emptyIdx) => (
            <div
              key={`empty-${emptyIdx}`}
              className="min-h-[100px] p-2 rounded-2xl bg-gray-50/50 border border-transparent select-none opacity-40"
            />
          ))}

          {/* 2. Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const slotInfo = getDateInfo(dayNum);
            const isBooked = slotInfo?.status === "booked";
            const isBlocked = slotInfo?.status === "blocked";

            let bgClass = "bg-white hover:bg-brand-50/30 border-gray-200 hover:border-brand-300";

            if (isBooked) {
              bgClass = "bg-brand-900 text-white border-brand-950 shadow-md hover:border-gold-400";
            } else if (isBlocked) {
              bgClass = "bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100/80";
            }

            return (
              <div
                key={dayNum}
                onClick={() => handleDateClick(dayNum)}
                className={`min-h-[100px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${bgClass}`}
              >
                {/* Top Row: Date Number & Lock/Alert Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold text-sm ${
                      isBooked ? "text-white font-serif" : isBlocked ? "text-amber-900" : "text-gray-900"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {isBooked && (
                    <span
                      title="Confirmed Customer Booking"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gold-400/20 text-gold-300 text-[10px] font-bold border border-gold-400/30"
                    >
                      <Lock className="w-3 h-3 text-gold-300" />
                      <span className="hidden sm:inline">Locked</span>
                    </span>
                  )}

                  {isBlocked && (
                    <span
                      title="Blocked Date"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-800 text-[10px] font-bold"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      <span className="hidden sm:inline">Blocked</span>
                    </span>
                  )}
                </div>

                {/* Content / Slot Status Label */}
                <div className="space-y-1">
                  <div className="text-[10px]">
                    {isBooked ? (
                      <div className="space-y-0.5">
                        <div className="text-gold-200 font-semibold truncate leading-tight">
                          {slotInfo?.bookedBy || "Confirmed Event"}
                        </div>
                        {slotInfo?.bookingRef && (
                          <span className="inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-brand-800 text-gold-300 border border-brand-700/60 truncate">
                            {slotInfo.bookingRef}
                          </span>
                        )}
                      </div>
                    ) : isBlocked ? (
                      <span className="text-amber-800 font-medium truncate block leading-tight">
                        {slotInfo?.notes || "Slot Blocked"}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Open Slot</span>
                      </span>
                    )}
                  </div>

                  {/* Seasonal Modifier Badge */}
                  {(slotInfo as any)?.priceModifier && (slotInfo as any).priceModifier !== 1.0 && (
                    <div className="pt-0.5">
                      {(slotInfo as any).priceModifier > 1 ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          ⚡ Peak (+{Math.round(((slotInfo as any).priceModifier - 1) * 100)}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                          🏷️ -{Math.round((1 - (slotInfo as any).priceModifier) * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Inspection / Slot Modifier Modal */}
      {selectedDateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">Date Schedule Controls</span>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {formatModalDate(selectedDateModal)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDateModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Case 1: Confirmed Customer Booking (Locked) */}
            {activeDateInfo?.status === "booked" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-brand-900 text-white space-y-3 shadow-md border border-brand-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
                      <Lock className="w-4 h-4 text-gold-400" />
                      <span>Confirmed Customer Reservation</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      Advance Paid
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-gray-200">
                      <span>Customer &amp; Occasion:</span>
                      <strong className="text-white">{activeDateInfo.bookedBy}</strong>
                    </div>
                    <div className="flex items-center justify-between text-gray-200">
                      <span>Booking Reference:</span>
                      <strong className="text-gold-300 font-mono">#{activeDateInfo.bookingRef}</strong>
                    </div>
                    {activeDateInfo.notes && (
                      <div className="pt-1 text-[11px] text-gray-300 border-t border-brand-800/80">
                        {activeDateInfo.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Safeguard Alert */}
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-purple-700" />
                    <span>Protected Confirmed Slot</span>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    This date has a confirmed booking with a verified advance token. It cannot be directly unblocked or modified here to prevent accidental double-bookings.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/bookings"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>View in Bookings Management</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                  </Link>
                  <button
                    onClick={() => setSelectedDateModal(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Case 2: Available or Blocked Slot */
              <div className="space-y-5">
                {/* 1. Seasonal & Muhurtham Pricing Multiplier */}
                <div className="p-4 rounded-2xl bg-gold-50/60 border border-gold-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-gold-600" />
                      <span>Seasonal &amp; Muhurtham Dynamic Tariff</span>
                    </span>
                    <span className="text-xs font-bold text-brand-900 bg-white px-2.5 py-0.5 rounded-md border border-gold-200">
                      {seasonalMultiplier}x Multiplier
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600">
                    Apply dynamic peak demand surge for wedding muhurthams or off-season discounts for this date.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Standard Rate", mult: 1.0, sub: "Normal day" },
                      { label: "Muhurtham Peak", mult: 1.25, sub: "+25% surge" },
                      { label: "Festival Surge", mult: 1.4, sub: "+40% holiday" },
                      { label: "Off-Peak Discount", mult: 0.85, sub: "-15% discount" },
                    ].map((opt) => (
                      <button
                        key={opt.mult}
                        type="button"
                        onClick={() => setSeasonalMultiplier(opt.mult)}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                          seasonalMultiplier === opt.mult
                            ? "bg-brand-900 text-white shadow-xs"
                            : "bg-white text-gray-700 hover:bg-gold-100/50 border border-gray-200"
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span
                          className={`text-[10px] block ${
                            seasonalMultiplier === opt.mult ? "text-gold-300" : "text-gray-400"
                          }`}
                        >
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs bg-white/70 p-2.5 rounded-xl border border-gold-200/60">
                    <span className="text-gray-500">
                      Base Tariff: ₹{(activeVenueData?.pricing?.pricePerDay || 25000).toLocaleString()}
                    </span>
                    <span className="font-bold text-brand-900">
                      Adjusted: ₹{Math.round((activeVenueData?.pricing?.pricePerDay || 25000) * seasonalMultiplier).toLocaleString()} / day
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleApplySeasonalPricing(seasonalMultiplier)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : `Apply Rate (${seasonalMultiplier}x)`}
                  </button>
                </div>

                {/* 2. Slot Blocking & Maintenance Section */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-800 block">
                      {activeDateInfo?.status === "blocked" ? "Slot Currently Blocked" : "Maintenance & Date Hold"}
                    </label>
                    <p className="text-[11px] text-gray-500">
                      {activeDateInfo?.status === "blocked"
                        ? "This date is currently blocked for maintenance. Unblock to make it open for customer bookings."
                        : "Prevent customer reservations on this date for deep cleaning, private family functions, or repairs."}
                    </p>
                  </div>

                  {activeDateInfo?.status !== "blocked" && (
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Reason: e.g. Stage maintenance, Deep cleaning, Private hold"
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-brand-900"
                    />
                  )}

                  {activeDateInfo?.status === "blocked" && activeDateInfo?.notes && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      Current reason: <strong>{activeDateInfo.notes}</strong>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      disabled={isSubmitting}
                      onClick={() => toggleBlockDate(selectedDateModal, activeDateInfo?.status)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                        activeDateInfo?.status === "blocked"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                    >
                      {isSubmitting
                        ? "Updating..."
                        : activeDateInfo?.status === "blocked"
                        ? "Unblock Date & Open Slot"
                        : "Block Date Slot"}
                    </button>
                    <button
                      onClick={() => setSelectedDateModal(null)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}