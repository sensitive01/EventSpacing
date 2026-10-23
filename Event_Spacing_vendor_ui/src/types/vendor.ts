/**
 * @file vendor.ts
 * @description Type definitions for Vendor management, Lead CRM, Availability Calendar, and Payout settlements.
 */

export type LeadStatus = "new" | "contacted" | "visited" | "booked" | "declined";

export interface VendorLead {
  id: string;
  venueId: string;
  venueName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  budget: string;
  specialRequests?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export type SlotStatus = "available" | "booked" | "blocked" | "maintenance";

export interface DateAvailability {
  date: string; // YYYY-MM-DD
  status: SlotStatus;
  notes?: string;
  priceModifier?: number; // e.g. 1.2 for 20% weekend peak
  bookedBy?: string;
  bookingRef?: string;
}

export interface PayoutRecord {
  id: string;
  transactionDate: string;
  bookingId: string;
  customerName: string;
  venueName: string;
  grossAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  netPayout: number;
  status: "paid" | "processing" | "pending";
  payoutMethod: string;
  payoutReference?: string;
}

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
    bankName: string;
  };
  kycStatus: "verified" | "pending" | "rejected";
  totalVenues: number;
  rating: number;
  joinedDate: string;
}
