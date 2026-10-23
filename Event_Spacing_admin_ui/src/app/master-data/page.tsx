"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Layers, Plus, CheckCircle2, Sparkles, Star, Tag, X } from "lucide-react";
import { mockMasterCategories, mockMasterAmenities } from "@/data/mockAdminData";
import { MasterCategoryItem, MasterAmenityItem } from "@/types/admin";

export default function AdminMasterDataPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "amenities">("categories");
  const [categories, setCategories] = useState<MasterCategoryItem[]>(mockMasterCategories);
  const [amenities, setAmenities] = useState<MasterAmenityItem[]>(mockMasterAmenities);

  // New item modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<any>("General");

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
    <div className="space-y-6">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">System Taxonomy</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Master Categories & Amenities</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Define the foundational classification options available in the vendor onboarding wizard and customer filter drawer.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-brand-950 font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab === "categories" ? "Category" : "Amenity"}</span>
        </button>
      </div>

      {/* 2. Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-900/60 pb-3">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
              : "text-gray-400 hover:bg-brand-900/40 hover:text-white"
          }`}
        >
          <span>Event Categories ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("amenities")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "amenities"
              ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
              : "text-gray-400 hover:bg-brand-900/40 hover:text-white"
          }`}
        >
          <span>Master Amenities ({amenities.length})</span>
        </button>
      </div>

      {/* 3. Categories View */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#14061d] rounded-3xl border border-brand-900/60 overflow-hidden flex flex-col justify-between shadow-soft hover:border-gold-500/30 transition-colors"
            >
              <div className="relative h-36 w-full bg-brand-950">
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14061d] via-transparent to-black/30"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                  <span>{cat.venueCount} Assigned Venues</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Archived"}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-white">{cat.name}</h3>
                  <span className="text-[10px] text-gray-500 font-mono">ID: {cat.id}</span>
                </div>

                <button
                  onClick={() => toggleCategoryActive(cat.id)}
                  className="px-3 py-1 rounded-lg border border-brand-800 text-[11px] font-semibold text-gray-300 hover:text-gold-300 hover:bg-brand-900/60 transition-colors"
                >
                  {cat.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Amenities View */}
      {activeTab === "amenities" && (
        <div className="bg-[#14061d] rounded-3xl border border-brand-900/60 shadow-soft overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-brand-950/40">
                  <th className="py-3 px-4">Amenity Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Venue Usage Count</th>
                  <th className="py-3 px-4 text-center">Popular Filter Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/40 text-xs">
                {amenities.map((am) => (
                  <tr key={am.id} className="hover:bg-brand-950/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{am.name}</td>
                    <td className="py-3.5 px-4 text-gray-300">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-brand-900 text-gold-300">
                        {am.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{am.usageCount} Venues</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleAmenityPopular(am.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          am.isPopular
                            ? "bg-gold-500/20 text-gold-300 border border-gold-500/40"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        <Star className="w-3 h-3 text-gold-400" />
                        <span>{am.isPopular ? "Popular" : "Standard"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#14061d] border border-brand-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-brand-900/60">
              <h3 className="font-serif text-lg font-bold text-white">
                Create New {activeTab === "categories" ? "Event Category" : "Master Amenity"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNew} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-300 block mb-1.5">Display Title</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={activeTab === "categories" ? "e.g. Baby Shower & Naming Ceremony" : "e.g. Helipad Access"}
                  className="w-full px-3.5 py-2.5 bg-brand-950 border border-brand-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              {activeTab === "amenities" && (
                <div>
                  <label className="font-semibold text-gray-300 block mb-1.5">Classification</label>
                  <select
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-950 border border-brand-800 rounded-xl text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="General">General</option>
                    <option value="Audio/Visual">Audio/Visual</option>
                    <option value="Dining & Catering">Dining & Catering</option>
                    <option value="Convenience">Convenience</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-brand-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-brand-950 font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
