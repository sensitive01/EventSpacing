"use client";

/**
 * @file FilterSidebar.tsx
 * @description Faceted left filter sidebar for narrowing venues by locality, event category, capacity, price, and amenities.
 */

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { VenueFilterState } from "@/types/venue";
import { api } from "@/lib/api";
import { EVENT_CATEGORIES, ALL_VENUE_TYPES } from "@/data/mockCategories";

interface FilterSidebarProps {
  filters: VenueFilterState;
  onFilterChange: (newFilters: Partial<VenueFilterState>) => void;
  onReset: () => void;
  onApply: () => void;
}

/**
 * FilterSidebar component rendering interactive search facet controls.
 *
 * @param filters - Current filter criteria state
 * @param onFilterChange - Dispatcher for individual filter changes
 * @param onReset - Resets all filters to initial defaults
 * @param onApply - Triggers filtered query evaluation
 * @returns React JSX element
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const [locationSearch, setLocationSearch] = useState("");
  const [showMoreLocations, setShowMoreLocations] = useState(false);
  const [showMoreEventTypes, setShowMoreEventTypes] = useState(false);
  const [showMoreVenueTypes, setShowMoreVenueTypes] = useState(false);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);

  const [venueTypesList, setVenueTypesList] = useState<string[]>(
    ALL_VENUE_TYPES.map((v) => v.name)
  );
  const [localitiesList, setLocalitiesList] = useState<string[]>([
    "Bengaluru",
    "Whitefield",
    "Electronic City",
    "Koramangala",
    "Indiranagar",
    "HSR Layout",
    "Yelahanka",
  ]);
  const [eventTypesList, setEventTypesList] = useState<string[]>(
    EVENT_CATEGORIES.map((c) => c.name)
  );

  useEffect(() => {
    let isCancelled = false;

    const loadDynamicFacets = async () => {
      try {
        const [catRes, locRes] = await Promise.allSettled([
          api.categories.getAll(),
          api.categories.getLocalities(),
        ]);

        if (!isCancelled && catRes.status === "fulfilled" && catRes.value?.data) {
          const { eventCategories, venueTypes } = catRes.value.data;
          if (Array.isArray(eventCategories) && eventCategories.length > 0) {
            setEventTypesList(eventCategories.map((c: any) => c.name).filter(Boolean));
          }
          if (Array.isArray(venueTypes) && venueTypes.length > 0) {
            setVenueTypesList(venueTypes.map((v: any) => v.name).filter(Boolean));
          }
        }

        if (!isCancelled && locRes.status === "fulfilled" && Array.isArray(locRes.value?.data)) {
          const locs = locRes.value.data.map((l: any) => l.locality).filter(Boolean);
          if (locs.length > 0) {
            setLocalitiesList(Array.from(new Set(["Bengaluru", ...locs])));
          }
        }
      } catch {
        // Retain initial fallback lists if backend is unreachable
      }
    };

    loadDynamicFacets();
    return () => {
      isCancelled = true;
    };
  }, []);

  const capacityOptions: { label: string; value: VenueFilterState["capacityRange"] }[] = [
    { label: "Any", value: "any" },
    { label: "Upto 50", value: "upto_50" },
    { label: "51 - 100", value: "51_100" },
    { label: "101 - 300", value: "101_300" },
    { label: "301 - 500", value: "301_500" },
    { label: "500+", value: "500_plus" },
  ];

  const amenitiesList = [
    "AC Hall",
    "Parking",
    "WiFi",
    "Catering Available",
    "In-house Decoration",
    "Projector / AV Setup",
    "Outdoor Space",
    "Rooms Available",
    "Stage",
    "Power Backup",
    "Bridal Room",
  ];

  /**
   * Toggles inclusion of a locality in the filter state.
   *
   * @param locality - Locality name
   */
  const handleLocalityToggle = (locality: string) => {
    const exists = filters.selectedLocalities.includes(locality);
    const updated = exists
      ? filters.selectedLocalities.filter((item) => item !== locality)
      : [...filters.selectedLocalities, locality];
    onFilterChange({ selectedLocalities: updated });
  };

  /**
   * Toggles inclusion of an event type in the filter state.
   *
   * @param type - Event type name
   */
  const handleEventTypeToggle = (type: string) => {
    const exists = filters.selectedEventTypes.includes(type);
    const updated = exists
      ? filters.selectedEventTypes.filter((item) => item !== type)
      : [...filters.selectedEventTypes, type];
    onFilterChange({ selectedEventTypes: updated });
  };

  /**
   * Toggles inclusion of a venue type in the filter state.
   */
  const handleVenueTypeToggle = (type: string) => {
    const current = filters.selectedVenueTypes || [];
    const exists = current.includes(type);
    const updated = exists
      ? current.filter((item) => item !== type)
      : [...current, type];
    onFilterChange({ selectedVenueTypes: updated });
  };

  /**
   * Toggles inclusion of an amenity tag.
   *
   * @param amenity - Amenity title
   */
  const handleAmenityToggle = (amenity: string) => {
    const exists = filters.selectedAmenities.includes(amenity);
    const updated = exists
      ? filters.selectedAmenities.filter((item) => item !== amenity)
      : [...filters.selectedAmenities, amenity];
    onFilterChange({ selectedAmenities: updated });
  };

  const filteredLocalities = localitiesList.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const displayedLocalities = showMoreLocations
    ? filteredLocalities
    : filteredLocalities.slice(0, 5);

  const displayedEventTypes = showMoreEventTypes
    ? eventTypesList
    : eventTypesList.slice(0, 5);

  const displayedAmenities = showMoreAmenities
    ? amenitiesList
    : amenitiesList.slice(0, 8);

  return (
    <aside className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-soft space-y-6">
      {/* 1. Header with Reset All */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-serif text-lg font-bold text-brand-950">
          Filters
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:text-brand-950 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 2. Location Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center justify-between">
          <span>Location</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </h4>

        {/* Location search box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter city or area"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-700"
          />
        </div>

        {/* Localities checkboxes */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {displayedLocalities.map((loc) => {
            const isChecked = filters.selectedLocalities.includes(loc);
            return (
              <label
                key={loc}
                className="flex items-center justify-between text-xs text-gray-700 hover:text-brand-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleLocalityToggle(loc)}
                    className="w-4 h-4 rounded text-brand-800 focus:ring-brand-700 accent-brand-800"
                  />
                  <span>{loc}</span>
                </div>
              </label>
            );
          })}
        </div>

        {filteredLocalities.length > 5 && (
          <button
            type="button"
            onClick={() => setShowMoreLocations(!showMoreLocations)}
            className="text-xs font-semibold text-brand-800 hover:underline"
          >
            {showMoreLocations ? "Show Less" : `+ View All ${filteredLocalities.length} Areas`}
          </button>
        )}
      </div>

      {/* 3. Event Type Filter */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center justify-between">
          <span>Event Type</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </h4>

        <div className="space-y-2">
          {displayedEventTypes.map((type) => {
            const isChecked = filters.selectedEventTypes.includes(type);
            return (
              <label
                key={type}
                className="flex items-center justify-between text-xs text-gray-700 hover:text-brand-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleEventTypeToggle(type)}
                    className="w-4 h-4 rounded text-brand-800 focus:ring-brand-700 accent-brand-800"
                  />
                  <span>{type}</span>
                </div>
              </label>
            );
          })}
        </div>

        {eventTypesList.length > 5 && (
          <button
            type="button"
            onClick={() => setShowMoreEventTypes(!showMoreEventTypes)}
            className="text-xs font-semibold text-brand-800 hover:underline"
          >
            {showMoreEventTypes ? "Show Less" : `+ View All ${eventTypesList.length} Events`}
          </button>
        )}
      </div>

      {/* 4. Venue Type Filter */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center justify-between">
          <span>Venue Type</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </h4>

        <div className="space-y-2">
          {(showMoreVenueTypes ? venueTypesList : venueTypesList.slice(0, 5)).map((type) => {
            const isChecked = (filters.selectedVenueTypes || []).includes(type);
            return (
              <label
                key={type}
                className="flex items-center justify-between text-xs text-gray-700 hover:text-brand-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleVenueTypeToggle(type)}
                    className="w-4 h-4 rounded text-brand-800 focus:ring-brand-700 accent-brand-800"
                  />
                  <span>{type}</span>
                </div>
              </label>
            );
          })}
        </div>

        {venueTypesList.length > 5 && (
          <button
            type="button"
            onClick={() => setShowMoreVenueTypes(!showMoreVenueTypes)}
            className="text-xs font-semibold text-brand-800 hover:underline inline-flex items-center gap-1"
          >
            <span>{showMoreVenueTypes ? "Show Less" : `+ View All ${venueTypesList.length} Types`}</span>
          </button>
        )}
      </div>

      {/* 4. Guest Capacity Segmented Radios */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
          Guest Capacity
        </h4>

        <div className="space-y-2">
          {capacityOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-xs text-gray-700 hover:text-brand-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="capacityOption"
                checked={filters.capacityRange === opt.value}
                onChange={() => onFilterChange({ capacityRange: opt.value })}
                className="w-4 h-4 text-brand-800 accent-brand-800"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Price Range Slider */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Price Range (Per Day)
          </h4>
        </div>

        <input
          type="range"
          min="50000"
          max="500000"
          step="10000"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full cursor-pointer accent-brand-800"
        />

        <div className="flex items-center justify-between text-xs font-bold text-gray-800">
          <span>₹ 0</span>
          <span className="text-brand-900">
            ₹ {new Intl.NumberFormat("en-IN").format(filters.maxPrice)}+
          </span>
        </div>
      </div>

      {/* 6. Amenities Checklist */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
          Amenities
        </h4>

        <div className="space-y-2">
          {displayedAmenities.map((amenity) => {
            const isChecked = filters.selectedAmenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-2 text-xs text-gray-700 hover:text-brand-900 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 rounded text-brand-800 focus:ring-brand-700 accent-brand-800"
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowMoreAmenities(!showMoreAmenities)}
          className="text-xs font-semibold text-brand-800 hover:underline"
        >
          {showMoreAmenities ? "Show Less" : "Show More ▾"}
        </button>
      </div>

      {/* 7. Apply Filters Action Button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onApply}
          className="w-full bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
};
