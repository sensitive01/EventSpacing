"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Crosshair, Loader2, MapPin } from "lucide-react";

export interface MapLocationResult {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  pincode?: string;
  locality?: string;
  displayName?: string;
}

interface OpenStreetMapPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (loc: MapLocationResult) => void;
}

interface SearchSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function OpenStreetMapPicker({
  lat,
  lng,
  onLocationSelect,
}: OpenStreetMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [statusText, setStatusText] = useState<string>("");

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Reverse geocode coordinates via OpenStreetMap Nominatim
  const reverseGeocode = async (targetLat: number, targetLng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${targetLat}&lon=${targetLng}&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Reverse geocoding failed");
      const data = await res.json();
      const addr = data?.address || {};

      const resolvedCity =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.city_district ||
        addr.state_district ||
        addr.county ||
        "";
      const resolvedState = addr.state || "";
      const resolvedPincode = addr.postcode || "";
      const resolvedLocality =
        addr.suburb || addr.neighbourhood || addr.road || "";

      setStatusText(
        [resolvedCity, resolvedState, resolvedPincode].filter(Boolean).join(", ") ||
          data?.display_name ||
          `${targetLat.toFixed(4)}, ${targetLng.toFixed(4)}`
      );

      onLocationSelectRef.current({
        lat: Number(targetLat.toFixed(6)),
        lng: Number(targetLng.toFixed(6)),
        city: resolvedCity,
        state: resolvedState,
        pincode: resolvedPincode,
        locality: resolvedLocality,
        displayName: data?.display_name,
      });
    } catch {
      onLocationSelectRef.current({
        lat: Number(targetLat.toFixed(6)),
        lng: Number(targetLng.toFixed(6)),
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Initialize Leaflet map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = lat || 12.9716;
    const initialLng = lng || 77.5946;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Custom divIcon so Next.js never hits missing default marker PNG paths
    const pinIcon = L.divIcon({
      className: "custom-osm-pin",
      html: `<div style="width:32px;height:32px;border-radius:9999px;background:#e11d48;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:bold;font-size:14px;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: pinIcon,
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      map.panTo(pos);
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: clickedLat, lng: clickedLng } = e.latlng;
      marker.setLatLng([clickedLat, clickedLng]);
      map.panTo([clickedLat, clickedLng]);
      reverseGeocode(clickedLat, clickedLng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep map & marker synced if lat/lng props change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && lat && lng) {
      const current = markerRef.current.getLatLng();
      if (
        Math.abs(current.lat - lat) > 0.0001 ||
        Math.abs(current.lng - lng) > 0.0001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
      }
    }
  }, [lat, lng]);

  // Search places via Nominatim forward geocoding
  const handleSearchPlace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=in&limit=5`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (res.ok) {
        const results = await res.json();
        setSuggestions(Array.isArray(results) ? results : []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    const targetLat = parseFloat(item.lat);
    const targetLng = parseFloat(item.lon);
    setSuggestions([]);
    setSearchQuery(item.display_name.split(",")[0] || item.display_name);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([targetLat, targetLng]);
      mapInstanceRef.current.setView([targetLat, targetLng], 15);
    }
    reverseGeocode(targetLat, targetLng);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusText("Geolocation is not supported by your browser.");
      return;
    }
    setIsReverseGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const targetLat = pos.coords.latitude;
        const targetLng = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([targetLat, targetLng]);
          mapInstanceRef.current.setView([targetLat, targetLng], 16);
        }
        reverseGeocode(targetLat, targetLng);
      },
      () => {
        setIsReverseGeocoding(false);
        setStatusText("Unable to access GPS location. Please click directly on the map.");
      }
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Search & GPS Toolbar */}
      <div className="relative flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 flex gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchPlace();
                }
              }}
              placeholder="Search area, street, or landmark on OpenStreetMap..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearchPlace()}
            disabled={isSearching}
            className="px-3.5 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shrink-0"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Find"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isReverseGeocoding}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-900 border border-purple-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Crosshair className="w-3.5 h-3.5 text-brand-700" />
          <span>Use My Location</span>
        </button>

        {/* Search Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-[1000] max-h-52 overflow-y-auto divide-y divide-gray-100">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-brand-950 flex items-start gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live OpenStreetMap Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-xs h-64 sm:h-72 bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Coordinate & Reverse Geocode Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[400] pointer-events-none flex items-center justify-between gap-2">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-gray-200 text-[11px] font-semibold text-gray-800 flex items-center gap-1.5 pointer-events-auto max-w-full truncate">
            {isReverseGeocoding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-700 shrink-0" />
                <span>Fetching City, State &amp; Pincode from map...</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">
                  {statusText ||
                    `Click map or drag pin (Lat: ${Number(lat || 12.9716).toFixed(4)}, Lng: ${Number(
                      lng || 77.5946
                    ).toFixed(4)})`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
