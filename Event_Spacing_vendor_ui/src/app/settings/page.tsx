"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Building,
  CreditCard,
  Bell,
  Save,
  CheckCircle2,
  FileText,
  Lock,
} from "lucide-react";
import { currentVendorProfile } from "@/data/mockVendorData";

export default function VendorSettingsPage() {
  const [profile, setProfile] = useState(currentVendorProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. Header */}
      <div>
        <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">Account Governance</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Business & KYC Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Manage your verified hospitality company details, tax credentials, and payout bank accounts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Vendor business profile and notification preferences successfully updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. Business Entity Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">Hospitality Enterprise Details</h2>
              <p className="text-xs text-gray-500">Legal entity name and primary authorized representative</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Partner</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Business / Trading Name</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Authorized Owner / Manager Name</label>
              <input
                type="text"
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Corporate Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Verified Contact Mobile</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Tax & Legal Credentials */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="font-serif text-lg font-bold text-gray-900">Tax & Regulatory Compliance</h2>
            <p className="text-xs text-gray-500">Goods & Services Tax (GSTIN) and PAN credentials</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">GST Registration Number (GSTIN)</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.gstNumber}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Verified with GST portal. Contact support to modify.</span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Company PAN Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.panNumber}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bank Payout Coordinates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="font-serif text-lg font-bold text-gray-900">Disbursement Bank Account</h2>
            <p className="text-xs text-gray-500">Direct NEFT/RTGS wire destination for venue booking proceeds</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Account Beneficiary Name</label>
              <input
                type="text"
                value={profile.bankDetails.accountHolder}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: { ...profile.bankDetails, accountHolder: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Bank & Branch Name</label>
              <input
                type="text"
                value={profile.bankDetails.bankName}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: { ...profile.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Bank Account Number</label>
              <input
                type="text"
                value={profile.bankDetails.accountNumber}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: { ...profile.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 font-mono focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={profile.bankDetails.ifscCode}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bankDetails: { ...profile.bankDetails, ifscCode: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-gray-900 font-mono focus:outline-none focus:border-brand-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
