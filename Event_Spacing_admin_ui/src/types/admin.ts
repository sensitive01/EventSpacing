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


export interface DirectUpiPaymentApproval {
  _id?: string;
  id?: string;
  bookingRef: string;
  venueName: string;
  selectedSpaceName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  timeSlot: string;
  guestCount: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  utrNumber: string;
  paymentProofUrl?: string;
  paymentGateway: "direct_upi" | "razorpay";
  status: "pending_approval" | "confirmed" | "rejected";
  paymentStatus: "verification_pending" | "paid" | "failed";
  createdAt?: string;
  adminApprovalNotes?: string;
}

export interface UpiGatewayConfig {
  upiId: string;
  payeeName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
}

export type AdminUserRole = "organizer" | "vendor" | "admin";
export type AdminUserKycStatus = "verified" | "pending" | "rejected";

export interface AdminUserItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  companyName?: string;
  businessName?: string;
  gstNumber?: string;
  panNumber?: string;
  kycStatus: AdminUserKycStatus;
  avatarUrl?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedAt?: string | null;
  venuesCount: number;
  bookingsCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUsersSummary {
  totalUsers: number;
  organizersCount: number;
  vendorsCount: number;
  adminsCount: number;
  blockedCount: number;
}

export interface AdminUserDetailResponse {
  user: AdminUserItem & {
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      accountHolder?: string;
      bankName?: string;
    };
  };
  recentBookings: {
    _id: string;
    bookingRef: string;
    venueName: string;
    eventDate: string;
    timeSlot: string;
    totalAmount: number;
    advancePaid: number;
    status: string;
    paymentGateway?: string;
    createdAt: string;
  }[];
  ownedVenues: {
    _id: string;
    name: string;
    slug: string;
    venueType: string;
    location?: { city?: string; locality?: string };
    status: string;
    isVerified: boolean;
    pricing?: { pricePerDay?: number };
    createdAt: string;
  }[];
}

export interface AdminPartnerVenueItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  venueType: string;
  businessName: string;
  city: string;
  locality: string;
  pricePerDay: number;
  seatingCapacity: number;
  floatingCapacity: number;
  status: string;
  isVerified: boolean;
  coverImage: string;
  rating: number;
  reviewCount: number;
  createdAt?: string;
}

export interface AdminPartnerServiceItem {
  id: string;
  _id?: string;
  businessName: string;
  ownerName: string;
  category: string;
  city: string;
  locality: string;
  startingPrice: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  isVerified: boolean;
  phone: string;
  email: string;
  createdAt?: string;
}

export interface AdminUnifiedPartnerItem {
  id: string;
  _id?: string;
  userId?: string | null;
  businessName: string;
  brandNames: string[];
  ownerName: string;
  contactNames: string[];
  phone: string;
  email: string;
  city: string;
  locality: string;
  localities: string[];
  category: string;
  categories: string[];
  startingPrice: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  kycStatus: AdminUserKycStatus;
  isVerified: boolean;
  isBlocked: boolean;
  primaryServiceId?: string | null;
  venues: AdminPartnerVenueItem[];
  services: AdminPartnerServiceItem[];
  venuesCount: number;
  servicesCount: number;
  createdAt: string;
}
