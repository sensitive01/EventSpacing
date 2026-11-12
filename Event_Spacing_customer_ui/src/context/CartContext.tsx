  "use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface BookingCartItem {
  cartItemId: string;
  bookingType: "venue" | "service";
  venueId?: string;
  vendorServiceId?: string;
  title: string;
  categoryLabel: string;
  coverImage: string;
  locality: string;
  city: string;
  selectedSpaceName: string;
  packageTitle: string;
  eventCategory: string;
  eventDate: string;
  timeSlot: "Full Day (8 AM - 11 PM)" | "Morning Slot (8 AM - 3 PM)" | "Evening Slot (4 PM - 11 PM)";
  guestCount: number;
  totalAmount: number;
  advancePaid: number;
  securityDeposit: number;
}

interface CartContextValue {
  items: BookingCartItem[];
  addItem: (item: Omit<BookingCartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  advanceTotal: number;
  securityDepositTotal: number;
  count: number;
}

const STORAGE_KEY = "es_booking_cart";

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BookingCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = (item: Omit<BookingCartItem, "cartItemId">) => {
    const cartItemId = `${item.bookingType}-${item.venueId || item.vendorServiceId}-${item.eventDate}-${item.timeSlot}-${Date.now()}`;
    setItems((prev) => {
      // Replace exact duplicate entity+date+slot if already queued
      const filtered = prev.filter(
        (existing) =>
          !(
            existing.bookingType === item.bookingType &&
            (existing.venueId || existing.vendorServiceId) ===
              (item.venueId || item.vendorServiceId) &&
            existing.eventDate === item.eventDate &&
            existing.timeSlot === item.timeSlot
          )
      );
      return [...filtered, { ...item, cartItemId }];
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        totalAmount: acc.totalAmount + (i.totalAmount || 0),
        advanceTotal: acc.advanceTotal + (i.advancePaid || 0),
        securityDepositTotal: acc.securityDepositTotal + (i.securityDeposit || 0),
      }),
      { totalAmount: 0, advanceTotal: 0, securityDepositTotal: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalAmount: totals.totalAmount,
        advanceTotal: totals.advanceTotal,
        securityDepositTotal: totals.securityDepositTotal,
        count: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useBookingCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useBookingCart must be used within CartProvider");
  }
  return ctx;
}
