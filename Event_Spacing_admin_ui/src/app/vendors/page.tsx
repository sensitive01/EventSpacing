"use client";

import React from "react";
import { Users, Building, ShieldCheck, Star, Phone, Mail, FileText } from "lucide-react";

export default function AdminVendorsPage() {
  const vendors = [
    {
      id: "vend_001",
      name: "Vikramaditya Rao",
      businessName: "Prestige Hospitality & Banquets",
      email: "partner@prestigevenues.com",
      phone: "+91 98450 12345",
      gstin: "29AABCP1234F1Z8",
      venuesCount: 3,
      rating: 4.85,
      gmvGenerated: 8250000,
      status: "verified",
      joinedDate: "Jan 2024",
    },
    {
      id: "vend_042",
      name: "Siddharth Jain",
      businessName: "Silver Oaks Retreats Ltd",
      email: "admin@silveroaks.in",
      phone: "+91 97400 66789",
      gstin: "29AABCS8891F1Z2",
      venuesCount: 2,
      rating: 4.75,
      gmvGenerated: 4500000,
      status: "verified",
      joinedDate: "Mar 2024",
    },
    {
      id: "vend_019",
      name: "Kabir Mehra",
      businessName: "Skyline Properties Group",
      email: "skyline@penthouse.com",
      phone: "+91 98801 44321",
      gstin: "29AABCK9901M1Z4",
      venuesCount: 1,
      rating: 4.6,
      gmvGenerated: 1850000,
      status: "pending_kyc",
    },
    {
      id: "vend_088",
      name: "Naveen Reddy",
      businessName: "Orchid Conventions Pvt Ltd",
      email: "naveen@orchidconventions.com",
      phone: "+91 99452 77102",
      gstin: "29AABCO5512L1Z9",
      venuesCount: 4,
      rating: 4.9,
      gmvGenerated: 9400000,
      status: "verified",
      joinedDate: "Aug 2023",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">Partner Network</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Registered Vendor Partners</h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Hospitality organizations, banquet operators, and hotel partners listing properties on Event Spacing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="p-6 rounded-3xl bg-[#14061d] border border-brand-900/60 shadow-soft space-y-4 hover:border-gold-500/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">{vendor.businessName}</h3>
                <p className="text-xs text-gray-400">
                  Primary Contact: <strong className="text-gray-200">{vendor.name}</strong>
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  vendor.status === "verified"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {vendor.status === "verified" ? "Verified Partner" : "Pending KYC Review"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/40">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Properties Listed</span>
                <span className="font-semibold text-white">{vendor.venuesCount} Venues</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-950/70 border border-brand-900/40">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Total GMV Settled</span>
                <span className="font-bold text-gold-400">₹{vendor.gmvGenerated.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-brand-900/40 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  {vendor.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  {vendor.email}
                </span>
              </div>
              <span className="font-mono text-[10px] text-gray-500">GST: {vendor.gstin}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
