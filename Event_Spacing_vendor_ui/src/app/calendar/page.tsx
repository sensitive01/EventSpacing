"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { mockCalendarDates as initialDates, vendorVenuesList } from "@/data/mockVendorData";
import { DateAvailability, SlotStatus } from "@/types/vendor";

export default function VendorCalendarPage() {
  const [selectedVenue, setSelectedVenue] = useState(vendorVenuesList[0].id);
  const [calendarDates, setCalendarDates] = useState<DateAvailability[]>(initialDates);
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [surgeActive, setSurgeActive] = useState(false);

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

  const toggleBlockDate = (dateStr: string, currentStatus?: SlotStatus) => {
    setCalendarDates((prev) => {
      const existing = prev.find((d) => d.date === dateStr);
      if (existing) {
        if (existing.status === "booked") {
          alert("Cannot modify a confirmed booking date directly. Please contact support or the customer.");
          return prev;
        }
        return prev.map((d) =>
          d.date === dateStr
            ? {
                ...d,
                status: d.status === "blocked" ? "available" : "blocked",
                notes: d.status === "blocked" ? undefined : actionReason || "Vendor maintenance block",
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
    setSelectedDateModal(null);
    setActionReason("");
  };

  const activeVenueData = vendorVenuesList.find((v) => v.id === selectedVenue) || vendorVenuesList[0];
  const activeDateInfo = selectedDateModal ? calendarDates.find((d) => d.date === selectedDateModal) : null;

  return (
    <div className="space-y-6">
      {/* 1. Header & Venue Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Slot Availability</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Availability & Bookings Calendar</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Block maintenance dates, monitor confirmed event bookings, and control weekend surge tariffs.
          </p>
        </div>

        {/* Venue Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-900" />
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-gray-800 shadow-2xs focus:outline-none focus:border-brand-900"
          >
            {vendorVenuesList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Calendar Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Days</span>
          <span className="text-xl font-bold text-gray-900">30 Days</span>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-purple-600 block">Confirmed Bookings</span>
          <span className="text-xl font-bold text-brand-900">8 Dates</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Blocked Slots</span>
          <span className="text-xl font-bold text-amber-900">2 Dates</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Slots</span>
          <span className="text-xl font-bold text-emerald-900">20 Dates</span>
        </div>
      </div>

      {/* 3. Main Interactive Calendar Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-soft space-y-6">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-gray-900">{currentMonthName}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-800">
              Peak Wedding Season
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

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateInfo = getDateInfo(dayNum);
            const status = dateInfo?.status || "available";

            const isBooked = status === "booked";
            const isBlocked = status === "blocked";
            const isAvailable = status === "available";

            return (
              <div
                key={dayNum}
                onClick={() => handleDateClick(dayNum)}
                className={`min-h-[90px] sm:min-h-[105px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isBooked
                    ? "bg-brand-900 text-white border-brand-950 shadow-sm"
                    : isBlocked
                    ? "bg-amber-50 border-amber-300 text-amber-950"
                    : "bg-[#faf7fb] hover:bg-white hover:border-brand-300 border-gray-200/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${isBooked ? "text-white" : "text-gray-800"}`}>
                    {dayNum}
                  </span>
                  {isBooked && <Lock className="w-3 h-3 text-gold-400 shrink-0" />}
                  {isBlocked && <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
                  {isAvailable && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </div>

                <div className="mt-1">
                  {isBooked && (
                    <div className="text-[10px] leading-tight">
                      <p className="font-semibold text-gold-300 truncate">{dateInfo?.bookedBy}</p>
                      <p className="text-gray-300 font-mono text-[9px] mt-0.5">#{dateInfo?.bookingRef}</p>
                    </div>
                  )}

                  {isBlocked && (
                    <div className="text-[10px] font-semibold text-amber-800 leading-tight">
                      <span>Blocked</span>
                      {dateInfo?.notes && (
                        <p className="text-[9px] text-amber-700 truncate mt-0.5">{dateInfo.notes}</p>
                      )}
                    </div>
                  )}

                  {isAvailable && (
                    <div className="text-[10px] text-gray-500 leading-tight">
                      <span className="text-emerald-700 font-semibold">Available</span>
                      <p className="text-gray-400 text-[9px] mt-0.5">₹{activeVenueData.pricing.pricePerDay.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Action Modal */}
      {selectedDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">Date Controls</span>
                <h3 className="font-serif text-lg font-bold text-gray-900">{selectedDateModal}</h3>
              </div>
              <button
                onClick={() => setSelectedDateModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeDateInfo?.status === "booked" ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 text-xs text-brand-950 space-y-1">
                  <div className="font-bold text-sm">Confirmed Event Booking</div>
                  <div><strong>Customer / Event:</strong> {activeDateInfo.bookedBy}</div>
                  <div><strong>Booking Reference:</strong> {activeDateInfo.bookingRef}</div>
                  <div><strong>Status:</strong> Advance payment received (30%)</div>
                </div>
                <p className="text-xs text-gray-500">
                  Confirmed bookings are managed through the Payouts & Bookings tab. Dates cannot be modified without customer cancellation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-gray-600">
                  Current Status:{" "}
                  <strong className={activeDateInfo?.status === "blocked" ? "text-amber-700" : "text-emerald-700"}>
                    {activeDateInfo?.status === "blocked" ? "Blocked from marketplace" : "Open for booking"}
                  </strong>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Reason for blocking (Maintenance, Private family event, Renovation):
                  </label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="e.g. Stage lighting rewiring"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDateModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBlockDate(selectedDateModal, activeDateInfo?.status)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                      activeDateInfo?.status === "blocked"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    {activeDateInfo?.status === "blocked" ? "Unblock & Open Date" : "Block This Date"}
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
