"use client";

import React, { useState, useEffect } from "react";
import { Users, Building, ShieldCheck, Star, Phone, Mail, FileText, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await api.vendors.getAll();
      if (res?.success && Array.isArray(res.data)) {
        setVendors(res.data);
      }
    } catch (err) {
      console.error("Failed to load vendors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">Partner Network</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Registered Vendor Partners (Live)</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Hospitality organizations, banquet operators, and event partners registered on Event Spacing.
          </p>
        </div>

        <button
          onClick={fetchVendors}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-950 border border-brand-800 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {vendors.length === 0 ? (
        <div className="p-12 text-center bg-[#14061d] rounded-3xl border border-brand-900/60 space-y-2 text-gray-400 text-xs">
          <Users className="w-10 h-10 text-gold-400 mx-auto mb-2" />
          <p className="text-white font-serif text-base font-bold">No Vendor Partners Found</p>
          <p>Vendors will appear here as they register on the vendor portal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => {
            const id = vendor._id || vendor.id;
            const isVerified = vendor.isVerified || vendor.status === "verified";

            return (
              <div
                key={id}
                className="p-6 rounded-3xl bg-[#14061d] border border-brand-900/60 shadow-soft space-y-4 hover:border-gold-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      {vendor.businessName || vendor.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Primary Contact: <strong className="text-gray-200">{vendor.ownerName || vendor.name || "Vendor Manager"}</strong>
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isVerified
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {isVerified ? "Verified Partner" : "Registered"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/40">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Category</span>
                    <span className="font-semibold text-white">{vendor.category || "Banquet & Event Operations"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/40">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Locality</span>
                    <span className="font-bold text-gold-400">{vendor.locality || "Bengaluru"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-900/40 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    {vendor.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gold-400" />
                        {vendor.phone}
                      </span>
                    )}
                    {vendor.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gold-400" />
                        {vendor.email}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-gray-500">ID: {id?.slice(-8)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
