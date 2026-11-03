import mongoose, { Document, Schema, Model } from "mongoose";

export interface IVenueSpace {
  id: string;
  name: string;
  spaceType: string;
  seatingCapacity: number;
  floatingCapacity: number;
  pricePerDay: number;
  halfDayPrice?: number;
  perHourPrice?: number;
  isAirConditioned: boolean;
  carpetAreaSqFt?: number;
}

export interface IEventPackage {
  id: string;
  title: string;
  packageType: "venue_only" | "venue_with_addons" | "free_venue_with_catering" | "per_person" | "hourly";
  price: number;
  priceUnit: "per_day" | "per_person" | "per_plate" | "per_hour" | "fixed_package";
  isFreeVenueOffer?: boolean;
  freeVenueBadge?: "FREE VENUE" | "ZERO RENTAL WITH CATERING";
  minGuestsRequired?: number;
  cateringPricePerPlate?: number;
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

export interface IVenue extends Document {
  name: string;
  businessName?: string;
  slug: string;
  venueType: string;
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
  spaces: IVenueSpace[];
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
  packages: IEventPackage[];
  amenities: string[];
  eventTypes: string[];
  shortDescription: string;
  detailedDescription?: string;
  isVerified: boolean;
  isActive: boolean;
  cateringPolicy?: "in_house_only" | "outside_allowed" | "both_available";
  decorationPolicy?: "in_house_only" | "outside_allowed" | "both_available";
  createdAt: Date;
  updatedAt: Date;
}

const VenueSpaceSchema = new Schema<IVenueSpace>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  spaceType: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
  floatingCapacity: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  halfDayPrice: { type: Number },
  perHourPrice: { type: Number },
  isAirConditioned: { type: Boolean, default: true },
  carpetAreaSqFt: { type: Number },
});

const EventPackageSchema = new Schema<IEventPackage>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  packageType: {
    type: String,
    enum: ["venue_only", "venue_with_addons", "free_venue_with_catering", "per_person", "hourly"],
    required: true,
  },
  price: { type: Number, required: true },
  priceUnit: {
    type: String,
    enum: ["per_day", "per_person", "per_plate", "per_hour", "fixed_package"],
    required: true,
  },
  isFreeVenueOffer: { type: Boolean, default: false },
  freeVenueBadge: { type: String },
  minGuestsRequired: { type: Number },
  cateringPricePerPlate: { type: Number },
  shortDescription: { type: String, default: "" },
  includedFeatures: [{ type: String }],
  inclusions: {
    venueRental: { type: Boolean, default: true },
    catering: { type: Boolean, default: false },
    decoration: { type: Boolean, default: false },
    soundAndDj: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false },
    bridalSuite: { type: Boolean, default: false },
  },
});

const VenueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    venueType: { type: String, required: true },
    images: [{ type: String }],
    coverImage: { type: String, required: true },
    videoUrl: { type: String },
    view360Url: { type: String },
    badge: {
      type: String,
      enum: ["Popular", "Featured", "Budget Friendly", "New", "Premium", "Free Venue Plan"],
    },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    location: {
      city: { type: String, required: true, default: "Bengaluru" },
      locality: { type: String, required: true },
      fullAddress: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      nearbyLandmarks: [{ type: String }],
    },
    capacity: {
      minGuests: { type: Number, default: 50 },
      maxGuests: { type: Number, required: true },
      seatingCapacity: { type: Number, required: true },
      floatingCapacity: { type: Number, required: true },
      hallCount: { type: Number, default: 1 },
    },
    spaces: [VenueSpaceSchema],
    pricing: {
      pricePerDay: { type: Number, required: true },
      halfDayPrice: { type: Number },
      perHourPrice: { type: Number },
      securityDeposit: { type: Number, default: 20000 },
      advancePaymentPercent: { type: Number, default: 30 },
      currency: { type: String, default: "INR" },
      hasFreeVenueOption: { type: Boolean, default: false },
      freeVenueMinGuests: { type: Number },
      freeVenuePlateStartingPrice: { type: Number },
    },
    packages: [EventPackageSchema],
    amenities: [{ type: String }],
    eventTypes: [{ type: String }],
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    cateringPolicy: {
      type: String,
      enum: ["in_house_only", "outside_allowed", "both_available"],
      default: "both_available",
    },
    decorationPolicy: {
      type: String,
      enum: ["in_house_only", "outside_allowed", "both_available"],
      default: "both_available",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and discovery
VenueSchema.index({ "location.city": 1, "location.locality": 1 });
VenueSchema.index({ "pricing.pricePerDay": 1 });
VenueSchema.index({ rating: -1 });
VenueSchema.index({ badge: 1 });
VenueSchema.index({ "capacity.maxGuests": 1 });
VenueSchema.index({
  name: "text",
  "location.locality": "text",
  shortDescription: "text",
  eventTypes: "text",
});

export const Venue: Model<IVenue> = mongoose.model<IVenue>("Venue", VenueSchema);

