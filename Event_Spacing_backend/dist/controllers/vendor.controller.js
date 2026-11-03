"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquireVendor = exports.getVendorById = exports.getVendors = void 0;
const Vendor_1 = require("../models/Vendor");
const Inquiry_1 = require("../models/Inquiry");
const getVendors = async (req, res, next) => {
    try {
        const { category, locality, q, page = "1", limit = "12" } = req.query;
        const filter = {};
        if (category && category !== "All Categories") {
            filter.category = new RegExp(`^${category}$`, "i");
        }
        if (locality && locality !== "All Localities") {
            filter.locality = new RegExp(`^${locality}$`, "i");
        }
        if (q && typeof q === "string" && q.trim()) {
            const searchRegex = new RegExp(q.trim(), "i");
            filter.$or = [
                { businessName: searchRegex },
                { ownerName: searchRegex },
                { category: searchRegex },
                { locality: searchRegex },
                { description: searchRegex },
            ];
        }
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * limitNum;
        const [vendors, totalCount] = await Promise.all([
            Vendor_1.Vendor.find(filter).sort({ rating: -1, reviewCount: -1 }).skip(skip).limit(limitNum),
            Vendor_1.Vendor.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: vendors,
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
exports.getVendors = getVendors;
const getVendorById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor_1.Vendor.findById(id);
        if (!vendor) {
            res.status(404).json({
                success: false,
                message: "Vendor service provider not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: vendor,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorById = getVendorById;
const inquireVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, eventDate, message } = req.body;
        const vendor = await Vendor_1.Vendor.findById(id);
        if (!vendor) {
            res.status(404).json({
                success: false,
                message: "Vendor not found.",
            });
            return;
        }
        const inquiry = await Inquiry_1.Inquiry.create({
            inquiryType: "vendor",
            vendorId: vendor._id,
            vendorName: vendor.businessName,
            name,
            email,
            phone,
            eventDate,
            message,
        });
        res.status(201).json({
            success: true,
            message: `Quotation request sent to ${vendor.businessName}! They will respond via phone or email.`,
            data: inquiry,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.inquireVendor = inquireVendor;
