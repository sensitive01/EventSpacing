"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venue = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VenueSpaceSchema = new mongoose_1.Schema({
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
const EventPackageSchema = new mongoose_1.Schema({
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
const VenueSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
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
exports.Venue = mongoose_1.default.model("Venue", VenueSchema);
