"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalities = exports.getTaxonomies = void 0;
const Category_1 = require("../models/Category");
const getTaxonomies = async (req, res, next) => {
    try {
        const { type } = req.query;
        const query = { isActive: true };
        if (type) {
            query.type = type;
        }
        const categories = await Category_1.Category.find(query).sort({ order: 1, name: 1 });
        const eventCategories = categories.filter((c) => c.type === "event_category");
        const venueTypes = categories.filter((c) => c.type === "venue_type");
        const vendorCategories = categories.filter((c) => c.type === "vendor_category");
        res.status(200).json({
            success: true,
            data: {
                eventCategories,
                venueTypes,
                vendorCategories,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaxonomies = getTaxonomies;
const getLocalities = async (req, res, next) => {
    try {
        const localities = [
            { city: "Bengaluru", locality: "Indiranagar", popular: true },
            { city: "Bengaluru", locality: "Koramangala", popular: true },
            { city: "Bengaluru", locality: "Whitefield", popular: true },
            { city: "Bengaluru", locality: "Palace Grounds", popular: true },
            { city: "Bengaluru", locality: "Jayanagar", popular: true },
            { city: "Bengaluru", locality: "JP Nagar", popular: true },
            { city: "Bengaluru", locality: "HSR Layout", popular: true },
            { city: "Bengaluru", locality: "MG Road / CBD", popular: true },
            { city: "Bengaluru", locality: "Hebbal", popular: true },
            { city: "Bengaluru", locality: "Yelahanka", popular: false },
            { city: "Bengaluru", locality: "Bannerghatta Road", popular: false },
            { city: "Bengaluru", locality: "Electronic City", popular: false },
            { city: "Bengaluru", locality: "Malleshwaram", popular: false },
            { city: "Bengaluru", locality: "Rajajinagar", popular: false },
        ];
        res.status(200).json({
            success: true,
            data: localities,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLocalities = getLocalities;
