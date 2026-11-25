"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Venue } from "@/types/venue";
import { api } from "@/lib/api";

interface WishlistContextType {
  savedVenues: Venue[];
  savedIds: string[];
  count: number;
  isLoading: boolean;
  isSaved: (venueId: string) => boolean;
  toggleSave: (venue: Venue) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = "es_wishlist_venues";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedVenues, setSavedVenues] = useState<Venue[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWishlist = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("es_auth_token");

    if (token) {
      try {
        const res = await api.auth.getWishlist();
        if (res?.success && Array.isArray(res.data)) {
          const mapped: Venue[] = res.data.map((v: any) => ({
            ...v,
            id: v.id || v._id,
          }));
          setSavedVenues(mapped);
          setSavedIds(
            Array.isArray(res.savedIds)
              ? res.savedIds
              : mapped.map((v) => String(v.id || (v as any)._id))
          );
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback to local guest cache if backend unreachable
      }
    }

    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) {
        const parsed: Venue[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedVenues(parsed);
          setSavedIds(parsed.map((v) => String(v.id || (v as any)._id)));
        }
      } else {
        setSavedVenues([]);
        setSavedIds([]);
      }
    } catch {
      setSavedVenues([]);
      setSavedIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();

    const handleAuthChange = () => {
      refreshWishlist();
    };
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshWishlist]);

  const isSaved = useCallback(
    (venueId: string) => {
      if (!venueId) return false;
      return savedIds.includes(String(venueId));
    },
    [savedIds]
  );

  const toggleSave = useCallback(
    async (venue: Venue) => {
      const vId = String(venue.id || (venue as any)._id || "");
      if (!vId) return;

      const currentlySaved = savedIds.includes(vId);
      const nextIds = currentlySaved
        ? savedIds.filter((id) => id !== vId)
        : [...savedIds, vId];
      const nextVenues = currentlySaved
        ? savedVenues.filter((v) => String(v.id || (v as any)._id) !== vId)
        : [{ ...venue, id: vId }, ...savedVenues];

      // Optimistic UI update
      setSavedIds(nextIds);
      setSavedVenues(nextVenues);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("es_auth_token") : null;

      if (token) {
        try {
          const res = await api.auth.toggleWishlist(vId);
          if (res?.success && Array.isArray(res.savedIds)) {
            setSavedIds(res.savedIds);
          }
          return;
        } catch {
          // Revert on backend failure
          setSavedIds(savedIds);
          setSavedVenues(savedVenues);
          return;
        }
      }

      // Guest fallback persistence
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextVenues));
      } catch {}
    },
    [savedIds, savedVenues]
  );

  return (
    <WishlistContext.Provider
      value={{
        savedVenues,
        savedIds,
        count: savedIds.length,
        isLoading,
        isSaved,
        toggleSave,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
};
