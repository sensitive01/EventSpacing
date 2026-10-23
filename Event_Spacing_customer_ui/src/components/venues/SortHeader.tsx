"use client";

/**
 * @file SortHeader.tsx
 * @description Toolbar component providing quick keyword search, venue counter, sorting, and view layout toggler.
 */

import React from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { VenueFilterState } from "@/types/venue";

interface SortHeaderProps {
  filters: VenueFilterState;
  totalCount: number;
  onFilterChange: (newFilters: Partial<VenueFilterState>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

/**
 * SortHeader component for venue search results.
 *
 * @param filters - Active filter state
 * @param totalCount - Total matching venue count
 * @param onFilterChange - Filter state dispatcher
 * @param onSearchSubmit - Form submission handler for search keyword
 * @returns React JSX element
 */
export const SortHeader: React.FC<SortHeaderProps> = ({
  filters,
  totalCount,
  onFilterChange,
  onSearchSubmit,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* 1. Keyword Search Input Bar */}
      <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by venue name, location or keyword..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200/90 focus:outline-none focus:border-brand-700 shadow-soft"
          />
        </div>
        <button
          type="submit"
          className="bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {/* 2. Results Count, Sort By Dropdown & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs sm:text-sm font-bold text-gray-800">
          <span className="text-brand-900 font-extrabold text-base">{totalCount}</span>{" "}
          Venues found in{" "}
          <span className="text-brand-800">{filters.selectedCity}</span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Sort By:</span>
            <select
              aria-label="Sort venues by"
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as VenueFilterState["sortBy"],
                })
              }
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-700 cursor-pointer shadow-2xs"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="rating_high_low">Highest Rated</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => onFilterChange({ viewMode: "grid" })}
              aria-label="Switch to grid view"
              className={`p-1.5 rounded-md transition-all ${
                filters.viewMode === "grid"
                  ? "bg-brand-800 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ viewMode: "list" })}
              aria-label="Switch to list view"
              className={`p-1.5 rounded-md transition-all ${
                filters.viewMode === "list"
                  ? "bg-brand-800 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
