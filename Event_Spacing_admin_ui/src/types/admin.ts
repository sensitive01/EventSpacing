/**
 * @file admin.ts
 * @description Type definitions for Admin operations, KYC Verification workflows, Catalog moderation, and Master Taxonomies.
 */

import { Venue } from "@/types/venue";

export type ApprovalStatus = "pending" | "approved" | "changes_requested" | "rejected";

export interface VenueApprovalItem {
  id: string;
  venueName: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  submissionDate: string;
  venueType: string;
  city: string;
  locality: string;
  seatingCapacity: number;
  floatingCapacity: number;
  pricePerDay: number;
  coverImage: string;
  photos: string[];
  documents: {
    type: "Trade License / NOC" | "Electricity Bill" | "GST Certificate" | "Floor Plan";
    fileName: string;
    status: "verified" | "pending_review";
  }[];
  amenities: string[];
  eventTypes: string[];
  status: ApprovalStatus;
  reviewerNotes?: string;
}

export interface PlatformMetrics {
  totalVenuesLive: number;
  venuesUnderReview: number;
  totalVendors: number;
  totalCustomerInquiries: number;
  monthlyPlatformGMV: number;
  monthlyCommissionEarned: number;
  averageBookingValue: number;
}

export interface MasterCategoryItem {
  id: string;
  name: string;
  iconName: string;
  imageUrl: string;
  venueCount: number;
  isActive: boolean;
}

export interface MasterAmenityItem {
  id: string;
  name: string;
  category: "General" | "Audio/Visual" | "Dining & Catering" | "Convenience";
  usageCount: number;
  isPopular: boolean;
}

export interface PlatformTransaction {
  id: string;
  bookingRef: string;
  date: string;
  venueName: string;
  vendorName: string;
  customerName: string;
  grossAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  netPayoutToVendor: number;
  paymentStatus: "completed" | "escrow_held" | "refunded";
}
