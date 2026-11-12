import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Vendor } from "../models/Vendor";
import { Inquiry } from "../models/Inquiry";
import { Booking } from "../models/Booking";

export const getVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, locality, q, page = "1", limit = "12" } = req.query;

    const filter: any = {};

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

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [vendors, totalCount] = await Promise.all([
      Vendor.find(filter).sort({ rating: -1, reviewCount: -1 }).skip(skip).limit(limitNum),
      Vendor.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);

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
  } catch (error) {
    next(error);
  }
};

export const inquireVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, eventDate, message } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
      return;
    }

    const inquiry = await Inquiry.create({
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
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/vendors/:id/booked-slots
 * Returns confirmed/completed booked slots for a marketplace vendor service provider.
 */
export const getVendorBookedSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const bookings = await Booking.find({
      vendorServiceId: id,
      status: { $in: ["confirmed", "completed"] },
    }).select("eventDate timeSlot selectedSpaceName");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings.map((b) => ({
        date: b.eventDate,
        timeSlot: b.timeSlot,
        spaceName: b.selectedSpaceName,
      })),
    });
  } catch (error) {
    next(error);
  }
};
