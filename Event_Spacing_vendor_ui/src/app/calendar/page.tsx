"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { DateAvailability, SlotStatus } from "@/types/vendor";
import { api } from "@/lib/api";

export default function VendorCalendarPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [calendarDates, setCalendarDates] = useState<DateAvailability[]>([]);
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [surgeActive, setSurgeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live venues and calendar slots from backend
  useEffect(() => {
    let isMounted = true;
    const loadCalendar = async () => {
      try {
        const venuesRes = await api.vendor.getVenues();

        if (isMounted) {
          if (venuesRes?.data && Array.isArray(venuesRes.data)) {
            const vList = venuesRes.data;
            setVenues(vList);
            if (vList.length > 0) {
              const currentId = selectedVenue || vList[0].id || vList[0]._id;
              setSelectedVenue(currentId);

              const calRes = await api.vendor.getCalendar(currentId);
              if (calRes?.data && Array.isArray(calRes.data)) {
                setCalendarDates(calRes.data);
              }
            } else {
              setVenues([]);
              setCalendarDates([]);
            }
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Error loading calendar data:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadCalendar();
    return () => {
      isMounted = false;
    };
  }, [selectedVenue]);

  // Month navigation (November 2026 for demo context)
  const currentMonthName = "November 2026";
  const daysInMonth = 30; // November has 30 days
  const startDayOfWeek = 0; // Nov 1 2026 starts on Sunday

  const getDateInfo = (day: number): DateAvailability | undefined => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const fullDate = `2026-11-${dayStr}`;
    return calendarDates.find((d) => d.date === fullDate);
  };

  const handleDateClick = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    setSelectedDateModal(`2026-11-${dayStr}`);
  };

  const toggleBlockDate = async (dateStr: string, currentStatus?: SlotStatus) => {
    const existing = calendarDates.find((d) => d.date === dateStr);
    const targetStatus = existing?.status === "blocked" ? "available" : "blocked";

    setCalendarDates((prev) => {
      const exists = prev.find((d) => d.date === dateStr);
      if (exists) {
        if (exists.status === "booked") {
          alert("Cannot modify a confirmed booking date directly. Please contact support or the customer.");
          return prev;
        }
        return prev.map((d) =>
          d.date === dateStr
            ? {
                ...d,
                status: targetStatus as SlotStatus,
                notes: targetStatus === "blocked" ? actionReason || "Vendor maintenance block" : undefined,
              }
            : d
        );
      } else {
        return [
          ...prev,
          {
            date: dateStr,
            status: "blocked",
            notes: actionReason || "Vendor blocked slot",
          },
        ];
      }
    });

    try {
      await api.vendor.toggleDateBlock({
        venueId: selectedVenue,
        date: dateStr,
        status: targetStatus,
        notes: actionReason || "Vendor slot update",
      });
    } catch (err) {
      console.warn("Backend slot update failed:", err);
    }

    setSelectedDateModal(null);
    setActionReason("");
  };

  const activeVenueData = venues.find((v) => (v.id || v._id) === selectedVenue) || venues[0];
  const activeDateInfo = selectedDateModal ? calendarDates.find((d) => d.date === selectedDateModal) : null;

  const bookedCount = calendarDates.filter((d) => d.status === "booked").length;
  const blockedCount = calendarDates.filter((d) => d.status === "blocked").length;
  const availableCount = Math.max(0, 30 - bookedCount - blockedCount);

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
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              No Venues in Portfolio
            </h2>
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
      {/* 1. Header & Venue Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Slot Availability</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Availability &amp; Bookings Calendar</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Block maintenance dates, monitor confirmed event bookings, and control weekend surge tariffs.
          </p>
        </div>

        {/* Venue Selector */}
        {venues.length > 0 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-900" />
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-gray-800 shadow-2xs focus:outline-none focus:border-brand-900"
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

      {/* 2. Calendar Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Days</span>
          <span className="text-xl font-bold text-gray-900">30 Days</span>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-purple-600 block">Confirmed Bookings</span>
          <span className="text-xl font-bold text-brand-900">{bookedCount} Dates</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Blocked Slots</span>
          <span className="text-xl font-bold text-amber-900">{blockedCount} Dates</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Slots</span>
          <span className="text-xl font-bold text-emerald-900">{availableCount} Dates</span>
        </div>
      </div>

      {/* 3. Main Interactive Calendar Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-6">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-gray-900">{currentMonthName}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-800">
              Operational Schedule
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Available for Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-800"></span>
            <span>Confirmed Booking (Locked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Blocked / Maintenance</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div key={dayName} className="text-center text-xs font-bold text-gray-400 py-2">
              {dayName}
            </div>
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const slotInfo = getDateInfo(dayNum);
            const isBooked = slotInfo?.status === "booked";
            const isBlocked = slotInfo?.status === "blocked";

            let bgClass = "bg-white hover:bg-brand-50/40 border-gray-200";
            let badgeClass = "text-gray-700";

            if (isBooked) {
              bgClass = "bg-brand-900 text-white border-brand-950";
              badgeClass = "text-gold-300";
            } else if (isBlocked) {
              bgClass = "bg-amber-50 border-amber-300 text-amber-900";
              badgeClass = "text-amber-800";
            }

            return (
              <div
                key={dayNum}
                onClick={() => handleDateClick(dayNum)}
                className={`min-h-[90px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${bgClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{dayNum}</span>
                  {isBooked && <Lock className="w-3.5 h-3.5 text-gold-400" />}
                  {isBlocked && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                </div>

                <div className="text-[10px]">
                  {isBooked ? (
                    <span className="line-clamp-2 text-gold-200 font-medium">
                      {slotInfo?.bookedBy || "Confirmed Event"}
                    </span>
                  ) : isBlocked ? (
                    <span className="text-amber-700 font-semibold truncate block">
                      {slotInfo?.notes || "Slot Blocked"}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">Open Slot</span>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Date Controls</span>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {selectedDateModal}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDateModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeDateInfo?.status === "booked" ? (
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 space-y-2">
                <div className="flex items-center gap-2 text-brand-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-brand-900" />
                  <span>Confirmed Customer Booking</span>
                </div>
                <p className="text-xs text-gray-700">
                  <strong>Reserved by:</strong> {activeDateInfo.bookedBy}
                </p>
                <p className="text-xs text-gray-500">
                  Booking ref: #{activeDateInfo.bookingRef}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Reason for Blocking Slot
                  </label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="e.g., Deep cleaning, Stage maintenance, Family function"
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-brand-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => toggleBlockDate(selectedDateModal, activeDateInfo?.status)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      activeDateInfo?.status === "blocked"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }`}
                  >
                    {activeDateInfo?.status === "blocked" ? "Unblock Date" : "Block Date Slot"}
                  </button>
                  <button
                    onClick={() => setSelectedDateModal(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
