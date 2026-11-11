"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Layers, Plus, CheckCircle2, Sparkles, Star, Tag, X, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

const DEFAULT_AMENITIES = [
  { id: "am-1", name: "Acoustic Soundproofing", category: "Audio/Visual", usageCount: 42, isPopular: true },
  { id: "am-2", name: "Bridal Powder Suites", category: "Convenience", usageCount: 78, isPopular: true },
  { id: "am-3", name: "Valet Parking (200+ bays)", category: "Convenience", usageCount: 65, isPopular: true },
  { id: "am-4", name: "Central Air Conditioning (HVAC)", category: "General", usageCount: 94, isPopular: true },
  { id: "am-5", name: "Commercial Kitchen / Tandoor", category: "Dining & Catering", usageCount: 52, isPopular: false },
  { id: "am-6", name: "100% Diesel Generator Backup", category: "General", usageCount: 88, isPopular: true },
];

export default function AdminMasterDataPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "amenities">("categories");
  const [categories, setCategories] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>(DEFAULT_AMENITIES);
  const [isLoading, setIsLoading] = useState(true);

  // New item modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<any>("General");

  const fetchTaxonomies = async () => {
    setIsLoading(true);
    try {
      const res = await api.categories.getAll();
      if (res?.success && res?.data?.eventCategories) {
        setCategories(
          res.data.eventCategories.map((c: any) => ({
            id: c._id || c.slug,
            name: c.name,
            iconName: c.iconName || "Sparkles",
            imageUrl:
              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
            venueCount: c.count || 0,
            isActive: c.isActive !== false,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load taxonomies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const toggleAmenityPopular = (id: string) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPopular: !a.isPopular } : a))
    );
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (activeTab === "categories") {
      setCategories((prev) => [
        ...prev,
        {
          id: `cat-${Date.now()}`,
          name: newName,
          iconName: "Sparkles",
          imageUrl:
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
          venueCount: 0,
          isActive: true,
        },
      ]);
    } else {
      setAmenities((prev) => [
        ...prev,
        {
          id: `am-${Date.now()}`,
          name: newName,
          category: newCategoryType,
          usageCount: 0,
          isPopular: true,
        },
      ]);
    }

    setNewName("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">System Taxonomy</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Master Categories &amp; Amenities (Live)</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Define the foundational classification options available in the vendor onboarding wizard and customer filter drawer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTaxonomies}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-brand-950 border border-brand-800 text-gray-300 hover:text-white cursor-pointer"
            title="Refresh Taxonomies"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-brand-950 font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab === "categories" ? "Category" : "Amenity"}</span>
          </button>
        </div>
      </div>

      {/* 2. Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-900/60 pb-3">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "categories"
              ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
              : "text-gray-400 hover:bg-brand-900/40 hover:text-white"
          }`}
        >
          <span>Event Categories ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("amenities")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "amenities"
              ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
              : "text-gray-400 hover:bg-brand-900/40 hover:text-white"
          }`}
        >
          <span>Standard Amenities ({amenities.length})</span>
        </button>
      </div>

      {/* 3. Categories View */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-[#14061d] border border-brand-900/60 hover:border-gold-500/30 transition-all flex items-center justify-between gap-3 shadow-soft"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-900/60 text-gold-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">{cat.name}</span>
                  <span className="text-[10px] text-gray-500">{cat.venueCount} Venues</span>
                </div>
              </div>

              <button
                onClick={() => toggleCategoryActive(cat.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                  cat.isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-gray-800 text-gray-500 border border-gray-700"
                }`}
              >
                {cat.isActive ? "Active" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Amenities View */}
      {activeTab === "amenities" && (
        <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/40">
                <th className="py-3 px-4">Amenity Name</th>
                <th className="py-3 px-4">Classification Group</th>
                <th className="py-3 px-4">Usage Frequency</th>
                <th className="py-3 px-4 text-center">Featured Spotlight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/40 text-xs">
              {amenities.map((am) => (
                <tr key={am.id} className="hover:bg-brand-950/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{am.name}</td>
                  <td className="py-3.5 px-4 text-gray-300">
                    <span className="px-2 py-0.5 rounded-md bg-brand-900/60 text-[10px] border border-brand-800">
                      {am.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gold-400 font-medium">Used in {am.usageCount} listings</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleAmenityPopular(am.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        am.isPopular
                          ? "bg-gold-500/20 text-gold-300 border border-gold-400/30"
                          : "bg-gray-800 text-gray-500 border border-gray-700"
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>{am.isPopular ? "Popular" : "Standard"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#14061d] rounded-3xl p-6 border border-brand-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-white">
                Add New {activeTab === "categories" ? "Event Category" : "Master Amenity"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNew} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Title / Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sangeet Celebration / Helipad Access..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {activeTab === "amenities" && (
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Category Classification</label>
                  <select
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-950 border border-brand-800 text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="General">General Infrastructure</option>
                    <option value="Audio/Visual">Audio &amp; Visual Tech</option>
                    <option value="Dining & Catering">Dining &amp; Catering Facilities</option>
                    <option value="Convenience">Convenience &amp; Hospitality</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-800 text-gray-300 hover:bg-brand-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-brand-950 font-bold cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
