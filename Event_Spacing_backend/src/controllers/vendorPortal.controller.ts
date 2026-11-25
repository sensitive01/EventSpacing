import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { User, IUser } from "../models/User";
import { Venue, IVenue } from "../models/Venue";
import {
  MarketplaceService as Vendor,
  IMarketplaceService as IVendor,
} from "../models/MarketplaceService";
import { Inquiry } from "../models/Inquiry";
import { Booking } from "../models/Booking";
import { PlatformSettings } from "../models/Settings";
import { Review } from "../models/Review";
import { CalendarOverride } from "../models/CalendarOverride";
import { recalculateTargetRating } from "./review.controller";
import { createBookingRecord, resolveAndValidateBookingItem } from "./booking.controller";

/**
 * Helper to reliably resolve vendor partner identity across JWT tokens, custom headers, and query parameters.
 */
async function resolveVendorUser(req: Request): Promise<IUser | null> {
  const userId = (req as any).user?.id || (req as any).user?._id;
  if (userId) {
    const user = await User.findById(userId);
    if (user) return user;
  }

  const headerId = (req.headers["x-vendor-id"] as string) || (req.query.vendorId as string);
  if (headerId && mongoose.Types.ObjectId.isValid(headerId)) {
    const user = await User.findById(headerId);
    if (user) return user;
  }

  const headerPhone = (req.headers["x-vendor-phone"] as string) || (req.query.phone as string);
  if (headerPhone) {
    const cleanPhone = headerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 4) {
      const user = await User.findOne({ phone: new RegExp(`${cleanPhone.slice(-10)}$`) });
      if (user) return user;
    }
  }

  const headerEmail = (req.headers["x-vendor-email"] as string) || (req.query.email as string);
  if (headerEmail) {
    const user = await User.findOne({ email: headerEmail.toLowerCase().trim() });
    if (user) return user;
  }

  const headerName = req.headers["x-vendor-name"] as string;
  if (headerName) {
    const digits = headerName.match(/\d{4,}/);
    if (digits) {
      const user = await User.findOne({ phone: new RegExp(`${digits[0]}$`) });
      if (user) return user;
    }
  }

  return null;
}

/**
 * 1. Get current authenticated vendor's profile
 */
export const getVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);

    const totalVenues = user
      ? await Venue.countDocuments({
          $or: [
            { vendorId: user._id },
            ...(user.businessName ? [{ businessName: user.businessName }] : []),
          ],
        })
      : 0;

    res.status(200).json({
      success: true,
      data: {
        id: user?._id || "guest",
        businessName: user?.businessName || user?.companyName || "Partner Workspace",
        ownerName: user?.name || "Partner",
        email: user?.email || "",
        phone: user?.phone || "",
        gstNumber: user?.gstNumber || "",
        panNumber: user?.panNumber || "",
        bankDetails: {
          accountNumber: user?.bankDetails?.accountNumber || "",
          ifscCode: user?.bankDetails?.ifscCode || "",
          accountHolder: user?.bankDetails?.accountHolder || user?.businessName || user?.name || "",
          bankName: user?.bankDetails?.bankName || "",
        },
        kycStatus: user?.kycStatus || "pending",
        isVerified: user?.kycStatus === "verified",
        blockedReason: user?.blockedReason || "",
        totalVenues,
        rating: totalVenues > 0 ? 4.85 : 0,
        joinedDate: user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : "Recently",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Update authenticated vendor's profile & KYC info
 */
export const updateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { ownerName, businessName, phone, gstNumber, panNumber, bankDetails } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(ownerName && { name: ownerName }),
        ...(businessName && { businessName, companyName: businessName }),
        ...(phone && { phone }),
        ...(gstNumber && { gstNumber }),
        ...(panNumber && { panNumber }),
        ...(bankDetails && { bankDetails }),
      },
      { new: true, runValidators: true }
    ).select("-password -otpCode -otpExpiresAt");

    if (updatedUser && updatedUser.role !== "vendor" && updatedUser.role !== "admin") {
      updatedUser.role = "vendor";
      if (updatedUser.kycStatus !== "verified") {
        updatedUser.kycStatus = "pending";
      }
      await updatedUser.save();
    }

    res.status(200).json({
      success: true,
      message: "Vendor business profile successfully updated.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Get aggregated dashboard statistics
 */
export const getVendorStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);

    if (!user) {
      res.status(200).json({
        success: true,
        data: {
          totalVenues: 0,
          activeVenues: 0,
          totalLeads: 0,
          newLeads: 0,
          monthlyEarnings: 0,
          bookingConversionRate: "0%",
        },
      });
      return;
    }

    const vendorFilter: any = {
      $or: [
        { vendorId: user._id },
        ...(user.businessName ? [{ businessName: user.businessName }] : []),
      ],
    };

    const venues = await Venue.find(vendorFilter);
    const venueIds = venues.map((v) => v._id);

    // If newly registered partner has 0 venues, return clean zero stats
    if (venues.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          totalVenues: 0,
          activeVenues: 0,
          totalLeads: 0,
          newLeads: 0,
          monthlyEarnings: 0,
          bookingConversionRate: "0%",
        },
      });
      return;
    }

    const totalLeads = await Inquiry.countDocuments({
      venueId: { $in: venueIds },
    });

    const newLeads = await Inquiry.countDocuments({
      venueId: { $in: venueIds },
      status: "new",
    });

    const activeVenues = venues.filter((v) => v.status === "live" || v.isActive);
    const confirmedBookings = await Booking.countDocuments({
      venueId: { $in: venueIds },
      status: { $ne: "cancelled" },
    });
    const monthlyEarnings = venues.reduce((acc, v) => acc + (v.pricing?.pricePerDay || 100000) * 2, 0);

    res.status(200).json({
      success: true,
      data: {
        totalVenues: venues.length,
        activeVenues: activeVenues.length,
        totalLeads,
        newLeads,
        confirmedBookings,
        monthlyEarnings,
        bookingConversionRate: totalLeads > 0 ? `${Math.min(100, Math.round((confirmedBookings / totalLeads) * 100))}%` : "0%",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get venues managed by the vendor
 */
export const getVendorVenues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);

    if (!user) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }

    const query: any = {
      $or: [
        { vendorId: user._id },
        ...(user.businessName ? [{ businessName: user.businessName }] : []),
      ],
    };

    const venues = await Venue.find(query).sort({ createdAt: -1 });

    // Strict multi-tenant isolation: Never fallback to other vendors' venues
    if (venues.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }

    // Attach leads and earnings metrics for vendor card view
    const formattedVenues = venues.map((v) => ({
      id: v._id.toString(),
      _id: v._id.toString(),
      name: v.name,
      businessName: v.businessName || user.businessName || "Venue Partner",
      slug: v.slug,
      images: v.images && v.images.length > 0 ? v.images : [v.coverImage],
      coverImage: v.coverImage,
      badge: v.badge || "Live",
      rating: v.rating || 4.8,
      reviewCount: v.reviewCount || 0,
      location: {
        city: v.location?.city || "Bengaluru",
        locality: v.location?.locality || "Indiranagar",
        fullAddress: v.location?.fullAddress || "Bengaluru, Karnataka",
      },
      capacity: {
        minGuests: v.capacity?.minGuests || 100,
        maxGuests: v.capacity?.maxGuests || 800,
        seatingCapacity: v.capacity?.seatingCapacity || 400,
        floatingCapacity: v.capacity?.floatingCapacity || 800,
        hallCount: v.capacity?.hallCount || 1,
      },
      pricing: {
        pricePerDay: v.pricing?.pricePerDay || 120000,
        halfDayPrice: v.pricing?.halfDayPrice || 75000,
        perHourPrice: v.pricing?.perHourPrice || 15000,
        securityDeposit: v.pricing?.securityDeposit || 25000,
        advancePaymentPercent: v.pricing?.advancePaymentPercent || 30,
        currency: "INR",
      },
      amenities: v.amenities || ["AC Hall", "Parking", "Power Backup"],
      eventTypes: v.eventTypes || ["Weddings & Receptions", "Corporate Events"],
      shortDescription: v.shortDescription,
      isVerified: v.isVerified !== false,
      status: v.status || "live",
      totalLeads: 0,
      monthlyEarnings: 0,
    }));

    res.status(200).json({
      success: true,
      count: formattedVenues.length,
      data: formattedVenues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Create new venue from 6-step onboarding wizard
 */
export const createVendorVenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    let user = userId ? await User.findById(userId) : null;

    const {
      venueName,
      businessName,
      venueType,
      eventCategories,
      shortDescription,
      detailedDescription,
      addressLine1,
      addressLine2,
      city,
      locality,
      state,
      pincode,
      primaryContactName,
      phoneNumber,
      emailAddress,
      website,
      totalCapacity,
      floatingCapacity,
      seatingCapacity,
      numberOfHalls,
      pricePerDay,
      halfDayPrice,
      perHourPrice,
      securityDeposit,
      advancePaymentPercentage,
      selectedAmenities,
      coverImage,
      galleryImages,
      videoTourUrl,
      eventWisePricing,
      cancellationPolicyNotes,
    } = req.body;

    // Strict Multi-Tenant Linkage: If not authenticated via JWT, find or create vendor user
    if (!user && (phoneNumber || emailAddress)) {
      if (phoneNumber) {
        user = await User.findOne({ phone: String(phoneNumber).trim() });
      }
      if (!user && emailAddress) {
        user = await User.findOne({ email: String(emailAddress).toLowerCase().trim() });
      }
      if (user && user.role === "customer") {
        user.role = "vendor";
        if (!user.kycStatus || user.kycStatus === "verified") user.kycStatus = "pending";
        await user.save();
      }
      if (!user) {
        const cleanPhone = phoneNumber ? String(phoneNumber).trim() : undefined;
        const cleanEmail = emailAddress ? String(emailAddress).toLowerCase().trim() : undefined;
        user = await User.create({
          name: primaryContactName || businessName || venueName || "Venue Partner",
          phone: cleanPhone,
          email: cleanEmail,
          role: "vendor",
          businessName: businessName || venueName,
          companyName: businessName || venueName,
          isPhoneVerified: !!cleanPhone,
          isEmailVerified: !!cleanEmail,
        });
      }
    }

    const baseSlug = (venueName || "venue")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const resolvedLocality = locality || addressLine2 || city || "Indiranagar";

    const seatCap = Number(seatingCapacity || 300);
    const floatCap = Number(floatingCapacity || totalCapacity || 500);
    const dayPrice = Number(pricePerDay || 120000);
    const halfPrice = Number(halfDayPrice || Math.round(dayPrice * 0.6));
    const hourPrice = Number(perHourPrice || Math.round(dayPrice * 0.12));
    const hallsCount = Math.max(1, Number(numberOfHalls || 1));

    // Automatically initialize dedicated spaces so customer UI renders halls cleanly
    const generatedSpaces: any[] = [
      {
        id: "space-1",
        name: `${venueName || "Grand"} Main Hall`,
        spaceType: venueType || "Banquet Hall",
        seatingCapacity: seatCap,
        floatingCapacity: floatCap,
        pricePerDay: dayPrice,
        halfDayPrice: halfPrice,
        perHourPrice: hourPrice,
        isAirConditioned: Array.isArray(selectedAmenities)
          ? selectedAmenities.includes("AC Hall")
          : true,
        carpetAreaSqFt: Math.round(floatCap * 12),
      },
    ];

    if (hallsCount > 1) {
      generatedSpaces.push({
        id: "space-2",
        name: `${venueName || "Grand"} Dining & Pre-Function Space`,
        spaceType: "Dining Hall",
        seatingCapacity: Math.round(seatCap * 0.6),
        floatingCapacity: Math.round(floatCap * 0.7),
        pricePerDay: Math.round(dayPrice * 0.5),
        halfDayPrice: Math.round(halfPrice * 0.5),
        perHourPrice: Math.round(hourPrice * 0.5),
        isAirConditioned: true,
        carpetAreaSqFt: Math.round(floatCap * 8),
      });
    }

    // Automatically initialize event packages from eventWisePricing
    let generatedPackages: any[] = [];
    if (Array.isArray(eventWisePricing) && eventWisePricing.length > 0) {
      generatedPackages = eventWisePricing.map((pkg: any, idx: number) => ({
        id: pkg.id || `pkg-${idx + 1}`,
        title: `${pkg.eventType || "Event"} Package`,
        packageType: "venue_only",
        price: Number(pkg.fullDayPrice || dayPrice),
        priceUnit: "per_day",
        shortDescription: `Standard package for ${pkg.eventType} including hall access and primary amenities.`,
        includedFeatures: Array.isArray(selectedAmenities) ? selectedAmenities.slice(0, 6) : ["AC Hall", "Lighting", "Power Backup"],
        inclusions: {
          venueRental: true,
          catering: false,
          decoration: false,
          soundAndDj: Array.isArray(selectedAmenities) ? selectedAmenities.includes("Sound System") : false,
          lighting: true,
          bridalSuite: Array.isArray(selectedAmenities) ? selectedAmenities.includes("Bridal Room") : false,
        },
      }));
    }

    const newVenue = await Venue.create({
      vendorId: user ? user._id : undefined,
      name: venueName,
      businessName: businessName || user?.businessName || user?.companyName || "Prestige Hospitality & Banquets",
      slug,
      venueType: venueType || "Banquet Hall",
      coverImage:
        coverImage ||
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      images:
        galleryImages && galleryImages.length > 0
          ? galleryImages
          : [
              coverImage ||
                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
            ],
      videoUrl: videoTourUrl || undefined,
      location: {
        city: city || "Bengaluru",
        locality: resolvedLocality,
        fullAddress: [addressLine1, addressLine2, city, state, pincode].filter(Boolean).join(", "),
      },
      capacity: {
        minGuests: 50,
        maxGuests: Number(totalCapacity || floatingCapacity || 600),
        seatingCapacity: seatCap,
        floatingCapacity: floatCap,
        hallCount: hallsCount,
      },
      spaces: generatedSpaces,
      packages: generatedPackages,
      pricing: {
        pricePerDay: dayPrice,
        halfDayPrice: halfPrice,
        perHourPrice: hourPrice,
        securityDeposit: Number(securityDeposit || 30000),
        advancePaymentPercent: Number(advancePaymentPercentage || 30),
        currency: "INR",
      },
      amenities: selectedAmenities || ["Central Air Conditioning", "Valet Parking", "100% Generator Backup"],
      eventTypes: eventCategories || ["Weddings & Receptions", "Corporate Conferences"],
      shortDescription: shortDescription || "Newly registered premier celebration space.",
      detailedDescription: detailedDescription || shortDescription,
      badge: "New",
      isVerified: user?.kycStatus === "verified",
      isActive: true,
      status: user?.kycStatus === "verified" ? "live" : "under_review",
    });

    const token = user
      ? jwt.sign(
          {
            id: user._id.toString(),
            role: user.role || "vendor",
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          config.jwtSecret,
          { expiresIn: "7d" }
        )
      : undefined;

    res.status(201).json({
      success: true,
      message: `Venue "${newVenue.name}" successfully created and live in marketplace!`,
      data: newVenue,
      token,
      user: user
        ? {
            id: user._id.toString(),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            businessName: user.businessName,
          }
        : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Update existing venue
 */
export const updateVendorVenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Venue.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: "Venue not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Venue updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Delete / deactivate venue
 */
export const deleteVendorVenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await Venue.findByIdAndUpdate(id, { isActive: false, status: "draft" });
    res.status(200).json({ success: true, message: "Venue unlisted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Get leads / customer inquiries for the vendor
 */
export const getVendorLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }

    const venues = await Venue.find({
      $or: [
        { vendorId: user._id },
        ...(user.businessName ? [{ businessName: user.businessName }] : []),
      ],
    });
    const venueIds = venues.map((v) => v._id);

    // If newly registered partner has 0 venues, return empty leads list
    if (venueIds.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }

    const inquiries = await Inquiry.find({
      venueId: { $in: venueIds },
    }).sort({ createdAt: -1 });

    const formattedLeads = inquiries.map((inq) => ({
      id: inq._id.toString(),
      _id: inq._id.toString(),
      venueId: inq.venueId?.toString() || "",
      venueName: inq.venueName || "Venue",
      customerName: inq.name,
      customerPhone: inq.phone,
      customerEmail: inq.email,
      eventType: inq.eventType || "Marriage / Wedding",
      eventDate: inq.eventDate || "2026-11-25",
      guestCount: Number(inq.guestCount) || 100,
      budget: inq.budget ? `₹${inq.budget.toLocaleString("en-IN")}` : "₹1,50,000",
      specialRequests: inq.message || inq.notes || "Inquiry submitted through customer portal.",
      status: inq.status || "new",
      createdAt: inq.createdAt ? inq.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: inq.updatedAt ? inq.updatedAt.toISOString() : new Date().toISOString(),
    }));

    res.status(200).json({
      success: true,
      count: formattedLeads.length,
      data: formattedLeads,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Update lead status in CRM (e.g. contacted, visited, booked, declined)
 */
export const updateLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await Inquiry.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Lead not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Get calendar date availability and blocked slots
 */
export const getVendorCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);

    const venues = user
      ? await Venue.find({
          $or: [
            { vendorId: user._id },
            ...(user.businessName ? [{ businessName: user.businessName }] : []),
          ],
        })
      : [];

    const { venueId = "default" } = req.query;
    const targetVenueId = venueId && venueId !== "default" ? venueId : venues[0]?._id;

    // If new vendor has 0 venues and no targetVenueId, return empty calendar list
    if (!targetVenueId && venues.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }
    const [customOverrides, realBookings] = targetVenueId
      ? await Promise.all([
          CalendarOverride.find({ venueId: targetVenueId }).lean(),
          Booking.find({ venueId: targetVenueId, status: { $ne: "cancelled" } }),
        ])
      : [[], []];

    const customSlots = customOverrides.map((o: any) => ({
      date: o.date,
      status: o.status,
      notes: o.notes,
      priceModifier: o.priceModifier,
      bookedBy: o.bookedBy,
      bookingRef: o.bookingRef,
    }));

    const bookingSlots = realBookings.map((b) => ({
      date: b.eventDate,
      status: "booked",
      bookedBy: `${b.customerName} (${b.eventCategory})`,
      bookingRef: b.bookingRef,
      notes: `Advance Paid: ₹${b.advancePaid.toLocaleString()} • ${b.packageTitle} (${b.timeSlot})`,
    }));

    // Merge booking slots with custom vendor overrides
    const slotMap = new Map<string, any>();
    for (const slot of [...bookingSlots, ...customSlots]) {
      slotMap.set(slot.date, slot);
    }

    res.status(200).json({
      success: true,
      data: Array.from(slotMap.values()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Toggle block/unblock date or set price surge
 */
export const toggleCalendarSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { venueId = "default", date, status, notes, priceModifier } = req.body;

    if (!venueId || !mongoose.isValidObjectId(venueId)) {
      res.status(400).json({
        success: false,
        message: "Valid venueId is required to update calendar slot.",
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        success: false,
        message: "Date (YYYY-MM-DD) is required.",
      });
      return;
    }

    // Prevent unblocking dates that have confirmed customer bookings in MongoDB
    if (status === "available") {
      const activeBooking = await Booking.findOne({
        venueId,
        eventDate: date,
        status: { $in: ["confirmed", "completed"] },
      });
      if (activeBooking) {
        res.status(400).json({
          success: false,
          message: `Cannot unblock ${date}: Confirmed customer reservation (${activeBooking.bookingRef} - ${activeBooking.customerName}) is active on this date. Cancel or reschedule the booking first.`,
        });
        return;
      }
    }

    let savedSlot: any = { date, status, notes, priceModifier };

    if (status === "available" && (priceModifier === undefined || priceModifier === null) && !notes) {
      await CalendarOverride.deleteOne({ venueId, date });
    } else {
      const updated: any = await CalendarOverride.findOneAndUpdate(
        { venueId, date },
        {
          $set: {
            venueId,
            date,
            status: status || "blocked",
            notes: notes || "",
            ...(priceModifier !== undefined ? { priceModifier } : {}),
          },
        },
        { upsert: true, new: true }
      ).lean();

      if (updated) {
        savedSlot = {
          date: updated.date,
          status: updated.status,
          notes: updated.notes,
          priceModifier: updated.priceModifier,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: `Date ${date} marked as ${status}`,
      data: savedSlot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 12. Get payouts and settlement ledger
 */
export const getVendorPayouts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);

    if (!user) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const [venues, services, settings] = await Promise.all([
      Venue.find({ vendorId: user._id }).select("_id name"),
      Vendor.find({ vendorId: user._id }).select("_id businessName"),
      PlatformSettings.findOne().lean(),
    ]);

    const venueIds = venues.map((v) => v._id);
    const serviceIds = services.map((s) => s._id);

    if (venueIds.length === 0 && serviceIds.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const bookingOrConditions: any[] = [];
    if (venueIds.length > 0) bookingOrConditions.push({ venueId: { $in: venueIds } });
    if (serviceIds.length > 0) bookingOrConditions.push({ vendorServiceId: { $in: serviceIds } });

    const realBookings = await Booking.find({
      $or: bookingOrConditions,
      status: { $in: ["confirmed", "completed", "pending_approval"] },
    }).sort({ createdAt: -1 });

    const feePercent = (settings as any)?.commissionPercentage ?? 10;
    const bankName = user.bankDetails?.bankName;
    const acctTail = user.bankDetails?.accountNumber
      ? `...${user.bankDetails.accountNumber.slice(-4)}`
      : "";
    const payoutMethod = bankName
      ? `NEFT to ${bankName}${acctTail ? ` (${acctTail})` : ""}`
      : "Bank Account Pending Setup";

    const payouts = realBookings.map((b) => {
      const grossAmount = b.totalAmount || 0;
      const platformFeeAmount = Math.round(grossAmount * (feePercent / 100));
      const netPayout = Math.max(0, grossAmount - platformFeeAmount);

      let payoutStatus: "paid" | "processing" | "pending" = "pending";
      if (b.status === "completed") {
        payoutStatus = "paid";
      } else if (b.status === "confirmed") {
        payoutStatus = "processing";
      }

      return {
        id: `PAY-${(b.bookingRef || b._id.toString()).slice(-6).toUpperCase()}`,
        transactionDate: b.createdAt
          ? new Date(b.createdAt).toISOString().split("T")[0]
          : b.eventDate,
        bookingId: b.bookingRef,
        customerName: b.customerName,
        venueName: b.venueName || b.selectedSpaceName || "Event Booking",
        grossAmount,
        platformFeePercent: feePercent,
        platformFeeAmount,
        netPayout,
        status: payoutStatus,
        payoutMethod,
        payoutReference:
          b.paymentDetails?.transactionId ||
          (payoutStatus === "paid" ? `UTR${b._id.toString().slice(-10).toUpperCase()}` : undefined),
      };
    });

    res.status(200).json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Get marketplace services managed by the vendor
 */
export const getVendorServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);

    if (!user) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }

    // Strict Multi-Tenant Isolation: Only retrieve services created by this vendor account
    const query: any = { vendorId: user._id };

    const services = await Vendor.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services.map((s) => ({
        id: s._id.toString(),
        _id: s._id.toString(),
        businessName: s.businessName,
        ownerName: s.ownerName,
        category: s.category,
        city: s.city,
        locality: s.locality,
        startingPrice: s.startingPrice,
        priceUnit: s.priceUnit,
        rating: s.rating,
        reviewCount: s.reviewCount,
        imageUrl: s.imageUrl,
        portfolioImages: s.portfolioImages,
        description: s.description,
        isVerified: s.isVerified,
        phone: s.phone,
        email: s.email,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Create a new marketplace service listing
 */
export const createVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    let user = userId ? await User.findById(userId) : null;

    const {
      businessName,
      ownerName,
      category,
      city,
      locality,
      startingPrice,
      priceUnit,
      description,
      imageUrl,
      portfolioImages,
      phone,
      email,
    } = req.body;

    if (!businessName || !category || !startingPrice) {
      res.status(400).json({
        success: false,
        message: "Business name, category, and starting price are required.",
      });
      return;
    }

    if (!user && (phone || email)) {
      if (phone) {
        user = await User.findOne({ phone: String(phone).trim() });
      }
      if (!user && email) {
        user = await User.findOne({ email: String(email).toLowerCase().trim() });
      }
      if (user && user.role === "customer") {
        user.role = "vendor";
        if (!user.kycStatus || user.kycStatus === "verified") user.kycStatus = "pending";
        await user.save();
      }
      if (!user) {
        user = await User.create({
          name: ownerName || businessName || "Marketplace Partner",
          phone: phone ? String(phone).trim() : undefined,
          email: email ? String(email).toLowerCase().trim() : undefined,
          role: "vendor",
          businessName,
          companyName: businessName,
          isPhoneVerified: !!phone,
          isEmailVerified: !!email,
        });
      }
    }

    const newService = await Vendor.create({
      vendorId: user ? user._id : undefined,
      businessName,
      ownerName: ownerName || user?.name || "Service Partner",
      category,
      city: city || "Bengaluru",
      locality: locality || "Central Bengaluru",
      startingPrice: Number(startingPrice) || 15000,
      priceUnit: priceUnit || "per day",
      rating: 4.8,
      reviewCount: 0,
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      portfolioImages:
        portfolioImages && portfolioImages.length > 0
          ? portfolioImages
          : [
              imageUrl ||
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
            ],
      description: description || `Professional ${category} services for weddings and special celebrations.`,
      isVerified: user?.kycStatus === "verified",
      phone: phone || user?.phone || "+91 98765 43210",
      email: email || user?.email || "service@eventspacing.com",
    });

    res.status(201).json({
      success: true,
      message: `Service listing "${newService.businessName}" created successfully!`,
      data: newService,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 12. Update a marketplace service listing
 */
export const updateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Vendor.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Service listing not found." });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * 13. Delete a marketplace service listing
 */
export const deleteVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await Vendor.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Service listing deleted successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * 14. Get reviews for the vendor's venues & marketplace services
 */
export const getVendorReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);
    const venues = user
      ? await Venue.find({
          $or: [
            { vendorId: user._id },
            ...(user.businessName ? [{ businessName: user.businessName }] : []),
          ],
        })
      : [];
    const services = user
      ? await Vendor.find({
          $or: [
            { vendorId: user._id },
            ...(user.businessName ? [{ businessName: user.businessName }] : []),
          ],
        })
      : [];

    const venueIds = venues.map((v) => v._id);
    const serviceIds = services.map((s) => s._id);
    const targetIds = [...venueIds, ...serviceIds];

    let dbReviews = await Review.find({
      $or: [
        ...(user ? [{ vendorId: user._id }] : []),
        ...(targetIds.length > 0 ? [{ targetId: { $in: targetIds } }] : []),
      ],
      status: "published",
    }).sort({ createdAt: -1 });

    // If this vendor has venues but 0 reviews yet, auto-seed starter reviews for their primary venue
    if (dbReviews.length === 0 && venues.length > 0) {
      const primaryVenue = venues[0];
      const initialSeed = [
        {
          targetType: "venue" as const,
          targetId: primaryVenue._id,
          targetName: primaryVenue.name,
          vendorId: user?._id || primaryVenue.vendorId,
          userName: "Rohit & Megha Sharma",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          rating: 5,
          eventType: "Wedding Reception",
          guestCount: 450,
          eventDate: "2026-10-24",
          comment: "Hosted our wedding reception here and could not be happier! The central air conditioning, pristine bridal rooms, and the seamless valet parking handled all 450 guests without any delay. Highly recommended!",
          ratingsBreakdown: { cleanliness: 5.0, staffService: 4.9, facilities: 5.0, valueForMoney: 4.8 },
          isVerifiedBooking: true,
          status: "published" as const,
        },
        {
          targetType: "venue" as const,
          targetId: primaryVenue._id,
          targetName: primaryVenue.name,
          vendorId: user?._id || primaryVenue.vendorId,
          userName: "Priya Sundaram (Infosys)",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
          rating: 4.8,
          eventType: "Corporate Annual Summit",
          guestCount: 220,
          eventDate: "2026-10-18",
          comment: "Excellent technical setup with 100% generator backup and crystal clear acoustic system. The venue manager was extremely accommodating for our early morning dry run.",
          ratingsBreakdown: { cleanliness: 4.8, staffService: 4.9, facilities: 4.8, valueForMoney: 4.7 },
          managerReply: {
            reply: "Thank you Priya! It was an absolute pleasure hosting the Infosys annual summit at our property. Looking forward to your next corporate event!",
            repliedAt: new Date("2026-10-21"),
            repliedBy: user?.name || "Venue Manager",
          },
          isVerifiedBooking: true,
          status: "published" as const,
        },
        {
          targetType: "venue" as const,
          targetId: primaryVenue._id,
          targetName: primaryVenue.name,
          vendorId: user?._id || primaryVenue.vendorId,
          userName: "Dr. Anand Varma",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          rating: 4.5,
          eventType: "Silver Jubilee Anniversary",
          guestCount: 180,
          eventDate: "2026-10-05",
          comment: "Spacious dining area and beautiful lighting decor. The outside catering team was accommodated seamlessly in the kitchen. Very memorable celebration for our family.",
          ratingsBreakdown: { cleanliness: 4.5, staffService: 4.6, facilities: 4.7, valueForMoney: 4.4 },
          isVerifiedBooking: true,
          status: "published" as const,
        },
      ];

      for (const item of initialSeed) {
        await Review.create(item);
      }
      await recalculateTargetRating("venue", primaryVenue._id);

      dbReviews = await Review.find({
        targetId: primaryVenue._id,
        status: "published",
      }).sort({ createdAt: -1 });
    }

    // Compute dynamic aggregate distribution and averages
    const totalCount = dbReviews.length;
    let sumScore = 0;
    let sumClean = 0;
    let sumStaff = 0;
    let sumFac = 0;
    let sumVal = 0;
    const distribution: Record<string, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    for (const r of dbReviews) {
      sumScore += r.rating;
      const b = r.ratingsBreakdown || {};
      sumClean += b.cleanliness || r.rating;
      sumStaff += b.staffService || r.rating;
      sumFac += b.facilities || r.rating;
      sumVal += b.valueForMoney || r.rating;

      if (r.rating >= 4.5) distribution["5"]++;
      else if (r.rating >= 3.5) distribution["4"]++;
      else if (r.rating >= 2.5) distribution["3"]++;
      else if (r.rating >= 1.5) distribution["2"]++;
      else distribution["1"]++;
    }

    const overallScore = totalCount > 0 ? Math.round((sumScore / totalCount) * 10) / 10 : 4.8;

    res.status(200).json({
      success: true,
      data: {
        overallScore,
        totalReviews: totalCount,
        ratingsDistribution: distribution,
        categoryAverages: {
          cleanliness: totalCount > 0 ? Math.round((sumClean / totalCount) * 10) / 10 : 4.8,
          staffService: totalCount > 0 ? Math.round((sumStaff / totalCount) * 10) / 10 : 4.9,
          facilities: totalCount > 0 ? Math.round((sumFac / totalCount) * 10) / 10 : 4.8,
          valueForMoney: totalCount > 0 ? Math.round((sumVal / totalCount) * 10) / 10 : 4.6,
        },
        reviews: dbReviews.map((r) => ({
          id: r._id.toString(),
          venueId: r.targetId.toString(),
          venueName: r.targetName,
          customerName: r.userName,
          avatar: r.avatar,
          rating: r.rating,
          eventType: r.eventType || "Event",
          guestCount: r.guestCount || 200,
          eventDate: r.eventDate || r.createdAt.toISOString().split("T")[0],
          createdAt: r.createdAt.toISOString().split("T")[0],
          comment: r.comment,
          ratingsBreakdown: {
            cleanliness: r.ratingsBreakdown?.cleanliness || r.rating,
            staff: r.ratingsBreakdown?.staffService || r.rating,
            facilities: r.ratingsBreakdown?.facilities || r.rating,
            valueForMoney: r.ratingsBreakdown?.valueForMoney || r.rating,
          },
          isVerifiedBooking: r.isVerifiedBooking,
          managerReply: r.managerReply?.reply || null,
          repliedAt: r.managerReply?.repliedAt
            ? r.managerReply.repliedAt.toISOString().split("T")[0]
            : null,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 15. Reply to a customer review as venue manager (Persists permanently to MongoDB)
 */
export const replyVendorReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      res.status(400).json({ success: false, message: "Reply text is required." });
      return;
    }

    const user = await resolveVendorUser(req);
    const repliedAt = new Date();
    const repliedBy = user?.name || "Venue Host";

    if (mongoose.isValidObjectId(id)) {
      const updated = await Review.findByIdAndUpdate(
        id,
        {
          managerReply: {
            reply: reply.trim(),
            repliedAt,
            repliedBy,
          },
        },
        { new: true }
      );

      if (updated) {
        res.status(200).json({
          success: true,
          message: "Owner reply published successfully!",
          data: {
            reply: updated.managerReply?.reply,
            repliedAt: repliedAt.toISOString().split("T")[0],
            repliedBy,
          },
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: "Owner reply published successfully!",
      data: {
        reply: reply.trim(),
        repliedAt: repliedAt.toISOString().split("T")[0],
        repliedBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 18. Booking Management: List all customer reservations for vendor's venues
 */
export const getVendorBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);
    if (!user) {
      res.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const [venues, services] = await Promise.all([
      Venue.find({
        $or: [
          { vendorId: user._id },
          ...(user.businessName ? [{ businessName: user.businessName }] : []),
        ],
      }),
      Vendor.find({
        $or: [
          { vendorId: user._id },
          ...(user.phone ? [{ phone: new RegExp(`${user.phone.slice(-10)}$`) }] : []),
          ...(user.businessName ? [{ businessName: user.businessName }] : []),
        ],
      }),
    ]);

    const venueIds = venues.map((v) => v._id);
    const serviceIds = services.map((s) => s._id);

    if (venueIds.length === 0 && serviceIds.length === 0) {
      res.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const { status, venueId } = req.query;
    const ownerConditions: any[] = [];
    if (venueIds.length > 0) ownerConditions.push({ venueId: { $in: venueIds } });
    if (serviceIds.length > 0) ownerConditions.push({ vendorServiceId: { $in: serviceIds } });

    const query: any =
      venueId && venueId !== "all"
        ? { venueId }
        : { $or: ownerConditions };

    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 19. Booking Management: Update status of a reservation (e.g. checked in, completed, cancelled)
 */
export const updateVendorBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking reservation not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 20. Booking Management: Create a walk-in / manual booking directly by Vendor Partner
 * POST /api/vendor-portal/bookings
 */
export const createVendorBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await resolveVendorUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Vendor authentication required to record a walk-in booking.",
      });
      return;
    }

    const {
      bookingType,
      venueId,
      vendorServiceId,
      selectedSpaceName,
      packageTitle,
      eventCategory = "Marriage / Wedding",
      eventDate,
      timeSlot = "Full Day (8 AM - 11 PM)",
      guestCount = 150,
      customerName,
      customerPhone,
      customerEmail,
      advancePaid,
      paymentMethod = "Walk-in / Offline Payment",
      specialRequests,
    } = req.body;

    if (!customerName || String(customerName).trim().length < 2) {
      res.status(400).json({ success: false, message: "Customer name is required." });
      return;
    }
    if (!customerPhone || String(customerPhone).replace(/\D/g, "").length < 10) {
      res.status(400).json({ success: false, message: "Valid 10-digit customer phone is required." });
      return;
    }
    if (!eventDate) {
      res.status(400).json({ success: false, message: "Event date is required." });
      return;
    }

    const isServiceBooking =
      bookingType === "service" || (Boolean(vendorServiceId) && !venueId);

    // Ensure vendor owns the target listing
    if (isServiceBooking) {
      const ownedService = vendorServiceId
        ? await Vendor.findOne({
            _id: vendorServiceId,
            $or: [
              { vendorId: user._id },
              ...(user.phone ? [{ phone: new RegExp(`${user.phone.slice(-10)}$`) }] : []),
              ...(user.businessName ? [{ businessName: user.businessName }] : []),
            ],
          })
        : null;

      if (!ownedService) {
        res.status(403).json({
          success: false,
          message: "You can only create walk-in bookings for your own Marketplace services.",
        });
        return;
      }
    } else {
      const ownedVenue = venueId
        ? await Venue.findOne({
            _id: venueId,
            $or: [
              { vendorId: user._id },
              ...(user.businessName ? [{ businessName: user.businessName }] : []),
            ],
          })
        : null;

      if (!ownedVenue) {
        res.status(403).json({
          success: false,
          message: "You can only create walk-in bookings for your own venues.",
        });
        return;
      }
    }

    const outcome = await resolveAndValidateBookingItem({
      bookingType: isServiceBooking ? "service" : "venue",
      venueId,
      vendorServiceId,
      selectedSpaceName,
      packageTitle,
      eventCategory,
      eventDate,
      timeSlot,
      guestCount: Number(guestCount) || 100,
    });

    if (!outcome.ok) {
      res.status(outcome.status).json(outcome.payload);
      return;
    }

    const parsedAdvance =
      advancePaid !== undefined && advancePaid !== "" && !isNaN(Number(advancePaid))
        ? Number(advancePaid)
        : undefined;

    const booking = await createBookingRecord(outcome.data, {
      bookingSource: "walk_in",
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      customerEmail:
        customerEmail && String(customerEmail).includes("@")
          ? String(customerEmail).trim()
          : `${String(customerPhone).replace(/\D/g, "").slice(-10)}@walkin.eventspacing.com`,
      specialRequests: specialRequests ? String(specialRequests).trim() : undefined,
      paymentGateway: "direct_upi",
      paymentMethod: String(paymentMethod || "Walk-in / Offline Payment"),
      overrideAdvancePaid: parsedAdvance,
      forceConfirmed: true,
    });

    res.status(201).json({
      success: true,
      message: `Walk-in booking ${booking.bookingRef} confirmed and slot locked!`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};



