export const VENDOR_MARKETPLACE_CATEGORIES = [
  "Caterers",
  "Decorators",
  "Photographers",
  "Videographers",
  "DJs",
  "Musicians",
  "Makeup Artists",
  "Mehendi Artists",
  "Event Planners",
  "Wedding Planners",
  "Anchors / MCs",
  "Florists",
  "Invitation Providers",
  "Cake Providers",
  "Security",
  "Valet Parking",
  "Chauffeur Services",
  "Furniture Rental",
  "AV Equipment",
  "Lighting",
  "Stage Providers",
] as const;

export type VendorMarketplaceCategory = typeof VENDOR_MARKETPLACE_CATEGORIES[number];

export const SERVICE_PRICE_UNITS = [
  "per day",
  "per event",
  "per plate",
  "per person",
  "per hour",
  "fixed package",
] as const;

export interface ServiceListing {
  id: string;
  _id?: string;
  businessName: string;
  ownerName: string;
  category: VendorMarketplaceCategory | string;
  city: string;
  locality: string;
  startingPrice: number;
  priceUnit: string;
  rating?: number;
  reviewCount?: number;
  imageUrl: string;
  portfolioImages?: string[];
  description: string;
  isVerified?: boolean;
  phone: string;
  email: string;
  createdAt?: string;
}

