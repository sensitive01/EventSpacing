"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardVenue = exports.inquireVenue = exports.getVenueBySlugOrId = exports.getFeaturedVenues = exports.getVenues = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Venue_1 = require("../models/Venue");
const Inquiry_1 = require("../models/Inquiry");
const getVenues = async (req, res, next) => {
    try {
        const { q, city, locality, eventType, venueType, capacityRange, minGuests, maxPrice, isFreeVenueOnly, amenities, sortBy = "recommended", page = "1", limit = "12", } = req.query;
        const filter = { isActive: true };
        // Text search query
        if (q && typeof q === "string" && q.trim()) {
            const searchRegex = new RegExp(q.trim(), "i");
            filter.$or = [
                { name: searchRegex },
                { "location.locality": searchRegex },
                { shortDescription: searchRegex },
                { eventTypes: searchRegex },
                { venueType: searchRegex },
            ];
        }
        // City filter
        if (city && typeof city === "string" && city.trim() !== "All Cities") {
            filter["location.city"] = new RegExp(`^${city.trim()}$`, "i");
        }
        // Locality filter (supports comma-separated string or array)
        if (locality) {
            const localities = Array.isArray(locality)
                ? locality
                : locality.split(",").map((l) => l.trim());
            if (localities.length > 0 && !localities.includes("All Localities") && !localities.includes("Bengaluru")) {
                filter["location.locality"] = { $in: localities.map((l) => new RegExp(`^${String(l)}$`, "i")) };
            }
        }
        // Event Category / Type filter
        if (eventType) {
            const types = Array.isArray(eventType)
                ? eventType
                : eventType.split(",").map((t) => t.trim());
            if (types.length > 0 && !types.includes("All Events")) {
                filter.eventTypes = { $in: types.map((t) => new RegExp(String(t), "i")) };
            }
        }
        // Venue Type filter
        if (venueType) {
            const vTypes = Array.isArray(venueType)
                ? venueType
                : venueType.split(",").map((v) => v.trim());
            if (vTypes.length > 0 && !vTypes.includes("All Types")) {
                filter.venueType = { $in: vTypes.map((v) => new RegExp(`^${String(v)}$`, "i")) };
            }
        }
        // Capacity range
        if (capacityRange && typeof capacityRange === "string") {
            switch (capacityRange) {
                case "upto_50":
                    filter["capacity.maxGuests"] = { $lte: 50 };
                    break;
                case "51_100":
                    filter["capacity.maxGuests"] = { $gte: 51, $lte: 100 };
                    break;
                case "101_300":
                    filter["capacity.maxGuests"] = { $gte: 101, $lte: 300 };
                    break;
                case "301_500":
                    filter["capacity.maxGuests"] = { $gte: 301, $lte: 500 };
                    break;
                case "500_plus":
                    filter["capacity.maxGuests"] = { $gte: 500 };
                    break;
            }
        }
        else if (minGuests) {
            filter["capacity.maxGuests"] = { $gte: parseInt(minGuests, 10) };
        }
        // Max Price
        if (maxPrice) {
            const parsedMaxPrice = parseInt(maxPrice, 10);
            if (!isNaN(parsedMaxPrice) && parsedMaxPrice > 0) {
                filter["pricing.pricePerDay"] = { $lte: parsedMaxPrice };
            }
        }
        // Free Venue Only filter
        if (String(isFreeVenueOnly) === "true") {
            filter["pricing.hasFreeVenueOption"] = true;
        }
        // Amenities
        if (amenities) {
            const amenitiesList = Array.isArray(amenities)
                ? amenities
                : amenities.split(",").map((a) => a.trim());
            if (amenitiesList.length > 0) {
                filter.amenities = { $all: amenitiesList };
            }
        }
        // Sorting
        let sortOptions = { rating: -1 };
        switch (sortBy) {
            case "price_low_high":
                sortOptions = { "pricing.pricePerDay": 1 };
                break;
            case "price_high_low":
                sortOptions = { "pricing.pricePerDay": -1 };
                break;
            case "rating_high_low":
                sortOptions = { rating: -1, reviewCount: -1 };
                break;
            case "recommended":
            default:
                sortOptions = { badge: 1, rating: -1 };
                break;
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * limitNum;
        const [venues, totalCount] = await Promise.all([
            Venue_1.Venue.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
            Venue_1.Venue.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: venues,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVenues = getVenues;
const getFeaturedVenues = async (req, res, next) => {
    try {
        const venues = await Venue_1.Venue.find({
            isActive: true,
            badge: { $in: ["Popular", "Featured", "Free Venue Plan", "Premium"] },
        })
            .sort({ rating: -1, reviewCount: -1 })
            .limit(6);
        res.status(200).json({
            success: true,
            data: venues,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedVenues = getFeaturedVenues;
const getVenueBySlugOrId = async (req, res, next) => {
    try {
        const slugOrId = req.params.slugOrId || "";
        let venue = null;
        if (mongoose_1.default.Types.ObjectId.isValid(slugOrId)) {
            venue = await Venue_1.Venue.findById(slugOrId);
        }
        if (!venue) {
            venue = await Venue_1.Venue.findOne({ slug: slugOrId.toLowerCase() });
        }
        if (!venue) {
            res.status(404).json({
                success: false,
                message: "Venue not found with the requested identifier.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: venue,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVenueBySlugOrId = getVenueBySlugOrId;
const inquireVenue = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, email, phone, eventType, eventDate, guestCount, message } = req.body;
        const venue = await Venue_1.Venue.findById(id);
        if (!venue) {
            res.status(404).json({
                success: false,
                message: "Venue not found.",
            });
            return;
        }
        const inquiry = await Inquiry_1.Inquiry.create({
            inquiryType: "venue",
            venueId: venue._id,
            venueName: venue.name,
            name,
            email,
            phone,
            eventType,
            eventDate,
            guestCount,
            message,
        });
        res.status(201).json({
            success: true,
            message: `Your inquiry for ${venue.name} has been sent successfully. The venue manager will contact you shortly.`,
            data: inquiry,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.inquireVenue = inquireVenue;
const onboardVenue = async (req, res, next) => {
    try {
        const wizardData = req.body;
        const { venueName, businessName, venueType, eventCategories, shortDescription, detailedDescription, city, locality, addressLine1, seatingCapacity, totalCapacity, floatingCapacity, numberOfHalls, pricePerDay, selectedAmenities, coverImage, galleryImages, } = wizardData;
        const slug = (venueName || "venue")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);
        const newVenue = await Venue_1.Venue.create({
            name: venueName,
            businessName,
            slug,
            venueType: venueType || "Banquet Hall",
            coverImage: coverImage || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
            images: galleryImages && galleryImages.length > 0 ? galleryImages : [coverImage],
            location: {
                city: city || "Bengaluru",
                locality: locality || "Indiranagar",
                fullAddress: addressLine1 || "Bengaluru, Karnataka",
            },
            capacity: {
                minGuests: 50,
                maxGuests: totalCapacity || floatingCapacity || 500,
                seatingCapacity: seatingCapacity || 300,
                floatingCapacity: floatingCapacity || 500,
                hallCount: numberOfHalls || 1,
            },
            pricing: {
                pricePerDay: pricePerDay || 75000,
                currency: "INR",
            },
            amenities: selectedAmenities || ["AC Hall", "Parking", "WiFi"],
            eventTypes: eventCategories || ["Marriage / Wedding", "Reception", "Birthday"],
            shortDescription: shortDescription || "Newly registered venue in Bengaluru",
            detailedDescription,
            badge: "New",
            isVerified: false,
            isActive: true,
        });
        res.status(201).json({
            success: true,
            message: "Venue submitted successfully! Our team will verify and activate your listing.",
            data: newVenue,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.onboardVenue = onboardVenue;
