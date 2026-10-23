/**
 * @file venue.ts
 * @description Comprehensive Type definitions for Venues, Multiple Spaces/Halls,
 * Event Package Engine (including FREE Venues with Catering),
 * Taxonomies (20 Event Categories, 15 Venue Types, 21 Vendor Marketplace Categories),
 * and Customer Booking / Invoices for the Event Spacing Platform.
 */

/**
 * 20 Standard Event Categories specified in PRD
 */
export const EVENT_CATEGORIES = [
  "Marriage / Wedding",
  "Reception",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Naming Ceremony",
  "Family Functions",
  "Corporate Meetings",
  "Conferences",
  "Seminars",
  "Training Programs",
  "Product Launches",
  "Exhibitions",
  "Award Functions",
  "Team Outings",
  "Workshops",
  "Private Parties",
  "Religious / Community Events",
  "Other Custom Events",
] as const;

export type EventCategoryType = typeof EVENT_CATEGORIES[number];

export interface EventCategory {
  id: string;
  name: string;
  iconName: string;
  imageUrl: string;
  count?: number;
}


/**
 * 15 Standard Venue Types specified in PRD
 */
export const VENUE_TYPES = [
  "Banquet Hall",
  "Convention Center",
  "Hotel",
  "Restaurant",
  "Resort",
  "Marriage Hall",
  "Community Hall",
  "Auditorium",
  "Conference Room",
  "Co-working / Event Space",
  "Outdoor Lawn",
  "Rooftop Space",
  "Farmhouse / Club",
  "Party Hall",
  "Studio",
] as const;

export type VenueType = typeof VENUE_TYPES[number];

/**
 * 21 Vendor Marketplace Categories specified in PRD
 */
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

/**
 * Individual Hall or Sub-Space inside a Venue (e.g. Grand Ballroom, Rooftop Lawn)
 */
export interface VenueSpace {
  id: string;
  name: string;
  spaceType: VenueType;
  seatingCapacity: number;
  floatingCapacity: number;
  pricePerDay: number;
  halfDayPrice?: number;
  perHourPrice?: number;
  isAirConditioned: boolean;
  carpetAreaSqFt?: number;
}

/**
 * Event Package Engine: Defines multi-tiered pricing including the FREE VENUES model
 */
export interface EventPackage {
  id: string;
  title: string;
  packageType:
    | "venue_only"
    | "venue_with_addons"
    | "free_venue_with_catering"
    | "per_person"
    | "hourly";
  price: number;
  priceUnit: "per_day" | "per_person" | "per_plate" | "per_hour" | "fixed_package";
  
  // Specific to the "FREE VENUES (with Catering Plans)" model
  isFreeVenueOffer?: boolean;
  freeVenueBadge?: "FREE VENUE" | "ZERO RENTAL WITH CATERING";
  minGuestsRequired?: number; // e.g. 250 guests
  cateringPricePerPlate?: number; // e.g. 1100 per plate

  shortDescription: string;
  includedFeatures: string[];
  inclusions: {
    venueRental: boolean;
    catering: boolean;
    decoration: boolean;
    soundAndDj: boolean;
    lighting: boolean;
    bridalSuite: boolean;
  };
}

/**
 * Vendor Service Provider Profile in the 21-category Marketplace
 */
export interface MarketplaceVendor {
  id: string;
  businessName: string;
  ownerName: string;
  category: VendorMarketplaceCategory;
  city: string;
  locality: string;
  startingPrice: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  portfolioImages: string[];
  description: string;
  isVerified: boolean;
  phone: string;
  email: string;
}

/**
 * Core Venue Model
 */
export interface Venue {
  id: string;
  name: string;
  businessName?: string;
  slug: string;
  venueType?: VenueType;
  images: string[];
  coverImage: string;
  videoUrl?: string;
  view360Url?: string;
  badge?: "Popular" | "Featured" | "Budget Friendly" | "New" | "Premium" | "Free Venue Plan";
  rating: number;
  reviewCount: number;
  location: {
    city: string;
    locality: string;
    fullAddress: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    nearbyLandmarks?: string[];
  };
  capacity: {
    minGuests: number;
    maxGuests: number;
    seatingCapacity: number;
    floatingCapacity: number;
    hallCount: number;
  };
  spaces?: VenueSpace[];
  pricing: {
    pricePerDay: number;
    halfDayPrice?: number;
    perHourPrice?: number;
    securityDeposit?: number;
    advancePaymentPercent?: number;
    currency: "INR";
    hasFreeVenueOption?: boolean;
    freeVenueMinGuests?: number;
    freeVenuePlateStartingPrice?: number;
  };
  packages?: EventPackage[];
  amenities: string[];
  eventTypes: string[];
  shortDescription: string;
  detailedDescription?: string;
  isVerified: boolean;
  cateringPolicy?: "in_house_only" | "outside_allowed" | "both_available";
  decorationPolicy?: "in_house_only" | "outside_allowed" | "both_available";
}

/**
 * Filter criteria state for the venue search & discovery page
 */
export interface VenueFilterState {
  searchQuery: string;
  selectedCity: string;
  selectedLocalities: string[];
  selectedEventTypes: string[];
  selectedVenueTypes?: string[];
  capacityRange: "any" | "upto_50" | "51_100" | "101_300" | "301_500" | "500_plus";
  maxPrice: number;
  selectedAmenities: string[];
  sortBy: "recommended" | "price_low_high" | "price_high_low" | "rating_high_low";
  viewMode: "grid" | "list";
  isFreeVenueOnly?: boolean;
}

/**
 * Customer Booking Model with detailed invoice, refund policy, and status
 */
export interface CustomerBooking {
  id: string;
  bookingRef: string;
  venueId: string;
  venueName: string;
  venueCoverImage: string;
  locality: string;
  city: string;
  selectedSpaceName?: string;
  packageTitle: string;
  eventCategory: string;
  eventDate: string;
  timeSlot: "Full Day (8 AM - 11 PM)" | "Morning Slot (8 AM - 3 PM)" | "Evening Slot (4 PM - 11 PM)";
  guestCount: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  securityDeposit: number;
  status: "confirmed" | "completed" | "cancelled" | "refunded";
  cancellationPolicy: {
    refundableUntilDate: string;
    refundPercentage: number;
    termsSummary: string;
  };
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
}

/**
 * Testimonial model for customer social proof
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
  rating: number;
}

/**
 * FAQ item model for accordion questions
 */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
