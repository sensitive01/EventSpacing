import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { Venue } from "../models/Venue";
import { Vendor } from "../models/Vendor";
import { PlatformSettings } from "../models/Settings";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { venueCalendarOverrides } from "./vendorPortal.controller";

export function resolveSlotConflictCondition(timeSlot: string): Record<string, unknown> {
  if (timeSlot === "Full Day (8 AM - 11 PM)") {
    return {
      $in: [
        "Full Day (8 AM - 11 PM)",
        "Morning Slot (8 AM - 3 PM)",
        "Evening Slot (4 PM - 11 PM)",
      ],
    };
  }
  return {
    $in: ["Full Day (8 AM - 11 PM)", timeSlot],
  };
}

export function syncVenueCalendarSlot(
  venueId: string,
  details: {
    eventDate: string;
    customerName: string;
    bookingRef: string;
    packageTitle: string;
    guestCount: number;
  }
): void {
  if (!venueCalendarOverrides[venueId]) {
    venueCalendarOverrides[venueId] = [];
  }
  const existingIdx = venueCalendarOverrides[venueId].findIndex((s) => s.date === details.eventDate);
  const slotEntry = {
    date: details.eventDate,
    status: "booked",
    bookedBy: details.customerName,
    bookingRef: details.bookingRef,
    notes: `Confirmed: ${details.packageTitle} (${details.guestCount} guests)`,
  };
  if (existingIdx >= 0) {
    venueCalendarOverrides[venueId][existingIdx] = slotEntry;
  } else {
    venueCalendarOverrides[venueId].push(slotEntry);
  }
}

export interface BookingItemInput {
  bookingType?: "venue" | "service";
  venueId?: string;
  vendorServiceId?: string;
  selectedSpaceName?: string;
  packageTitle?: string;
  eventCategory: string;
  eventDate: string;
  timeSlot: "Full Day (8 AM - 11 PM)" | "Morning Slot (8 AM - 3 PM)" | "Evening Slot (4 PM - 11 PM)";
  guestCount: number;
}

export interface ResolvedBookingItem {
  isServiceBooking: boolean;
  resolvedVenueId?: mongoose.Types.ObjectId;
  resolvedServiceId?: mongoose.Types.ObjectId;
  serviceCategory?: string;
  entityName: string;
  entityCoverImage: string;
  entityLocality: string;
  entityCity: string;
  targetSpace: string;
  resolvedPackageTitle: string;
  eventCategory: string;
  eventDate: string;
  timeSlot: "Full Day (8 AM - 11 PM)" | "Morning Slot (8 AM - 3 PM)" | "Evening Slot (4 PM - 11 PM)";
  guestCount: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  securityDeposit: number;
}

type ResolveOutcome =
  | { ok: true; data: ResolvedBookingItem }
  | { ok: false; status: number; payload: Record<string, unknown> };

export async function resolveAndValidateBookingItem(
  input: BookingItemInput
): Promise<ResolveOutcome> {
  const {
    bookingType,
    venueId,
    vendorServiceId,
    selectedSpaceName,
    packageTitle,
    eventCategory,
    eventDate,
    timeSlot,
    guestCount,
  } = input;

  const isServiceBooking =
    bookingType === "service" || (Boolean(vendorServiceId) && !venueId);
  const slotConflictCondition = resolveSlotConflictCondition(timeSlot);

  if (isServiceBooking) {
    if (!vendorServiceId || !mongoose.isValidObjectId(vendorServiceId)) {
      return {
        ok: false,
        status: 400,
        payload: { success: false, message: "Valid Marketplace Service ID is required." },
      };
    }

    const service = await Vendor.findById(vendorServiceId);
    if (!service) {
      return {
        ok: false,
        status: 404,
        payload: { success: false, message: "Marketplace service provider not found." },
      };
    }

    const existingConflict = await Booking.findOne({
      vendorServiceId: service._id,
      eventDate,
      timeSlot: slotConflictCondition,
      status: { $in: ["confirmed", "completed"] },
    });

    if (existingConflict) {
      return {
        ok: false,
        status: 409,
        payload: {
          success: false,
          message: `Slot Conflict: "${service.businessName}" (${service.category}) is already booked for ${existingConflict.timeSlot} on ${eventDate}. Please choose an alternative slot or date.`,
          conflict: {
            bookingRef: existingConflict.bookingRef,
            spaceName: existingConflict.selectedSpaceName,
            eventDate: existingConflict.eventDate,
            timeSlot: existingConflict.timeSlot,
          },
        },
      };
    }

    const unit = (service.priceUnit || "").toLowerCase();
    const totalAmount =
      unit.includes("plate") || unit.includes("person")
        ? service.startingPrice * guestCount
        : service.startingPrice;
    const advancePaid = Math.round((totalAmount * 30) / 100);

    return {
      ok: true,
      data: {
        isServiceBooking: true,
        resolvedServiceId: service._id as mongoose.Types.ObjectId,
        serviceCategory: service.category,
        entityName: service.businessName,
        entityCoverImage: service.imageUrl,
        entityLocality: service.locality,
        entityCity: service.city || "Bengaluru",
        targetSpace: selectedSpaceName || service.category,
        resolvedPackageTitle: packageTitle || `${service.category} Standard Package`,
        eventCategory,
        eventDate,
        timeSlot,
        guestCount,
        totalAmount,
        advancePaid,
        balanceDue: totalAmount - advancePaid,
        securityDeposit: 0,
      },
    };
  }

  if (!venueId || !mongoose.isValidObjectId(venueId)) {
    return {
      ok: false,
      status: 400,
      payload: { success: false, message: "Valid Venue ID is required." },
    };
  }

  const venue = await Venue.findById(venueId);
  if (!venue) {
    return {
      ok: false,
      status: 404,
      payload: { success: false, message: "Venue not found." },
    };
  }

  const targetSpace = selectedSpaceName || venue.spaces?.[0]?.name || "Main Banquet Hall";
  const existingConflict = await Booking.findOne({
    venueId: venue._id,
    selectedSpaceName: targetSpace,
    eventDate,
    timeSlot: slotConflictCondition,
    status: { $in: ["confirmed", "completed"] },
  });

  if (existingConflict) {
    return {
      ok: false,
      status: 409,
      payload: {
        success: false,
        message: `Slot Conflict: "${targetSpace}" is already booked for ${existingConflict.timeSlot} on ${eventDate}. Please choose an alternative slot, hall, or date.`,
        conflict: {
          bookingRef: existingConflict.bookingRef,
          spaceName: existingConflict.selectedSpaceName,
          eventDate: existingConflict.eventDate,
          timeSlot: existingConflict.timeSlot,
        },
      },
    };
  }

  let totalAmount = venue.pricing.pricePerDay;
  const selectedPkg = venue.packages?.find((p) => p.title === packageTitle);
  if (selectedPkg) {
    if (selectedPkg.packageType === "free_venue_with_catering" && selectedPkg.cateringPricePerPlate) {
      totalAmount = selectedPkg.cateringPricePerPlate * guestCount;
    } else if (selectedPkg.priceUnit === "per_plate" || selectedPkg.priceUnit === "per_person") {
      totalAmount = selectedPkg.price * guestCount;
    } else {
      totalAmount = selectedPkg.price;
    }
  }

  const advancePercent = venue.pricing.advancePaymentPercent || 30;
  const advancePaid = Math.round((totalAmount * advancePercent) / 100);

  return {
    ok: true,
    data: {
      isServiceBooking: false,
      resolvedVenueId: venue._id as mongoose.Types.ObjectId,
      entityName: venue.name,
      entityCoverImage: venue.coverImage,
      entityLocality: venue.location.locality,
      entityCity: venue.location.city,
      targetSpace,
      resolvedPackageTitle: packageTitle || "Standard Venue Rental",
      eventCategory,
      eventDate,
      timeSlot,
      guestCount,
      totalAmount,
      advancePaid,
      balanceDue: totalAmount - advancePaid,
      securityDeposit: venue.pricing.securityDeposit ?? 25000,
    },
  };
}

export async function createBookingRecord(
  resolved: ResolvedBookingItem,
  opts: {
    userId?: mongoose.Types.ObjectId;
    bookingSource?: "online" | "walk_in";
    cartGroupId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    specialRequests?: string;
    paymentGateway?: "razorpay" | "direct_upi";
    transactionId?: string;
    paymentMethod?: string;
    utrNumber?: string;
    paymentProofUrl?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    overrideAdvancePaid?: number;
    forceConfirmed?: boolean;
  }
) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingRef = `ES-BLR-2026-${randomSuffix}`;
  const isDirectUpi = !opts.forceConfirmed && (opts.paymentGateway || "direct_upi") === "direct_upi";

  const advancePaid =
    typeof opts.overrideAdvancePaid === "number" && opts.overrideAdvancePaid >= 0
      ? Math.min(opts.overrideAdvancePaid, resolved.totalAmount)
      : resolved.advancePaid;
  const balanceDue = Math.max(0, resolved.totalAmount - advancePaid);

  const booking = await Booking.create({
    bookingRef,
    bookingType: resolved.isServiceBooking ? "service" : "venue",
    bookingSource: opts.bookingSource || "online",
    cartGroupId: opts.cartGroupId,
    userId: opts.userId,
    venueId: resolved.resolvedVenueId,
    vendorServiceId: resolved.resolvedServiceId,
    serviceCategory: resolved.serviceCategory,
    venueName: resolved.entityName,
    venueCoverImage: resolved.entityCoverImage,
    locality: resolved.entityLocality,
    city: resolved.entityCity,
    selectedSpaceName: resolved.targetSpace,
    packageTitle: resolved.resolvedPackageTitle,
    eventCategory: resolved.eventCategory,
    eventDate: resolved.eventDate,
    timeSlot: resolved.timeSlot,
    guestCount: resolved.guestCount,
    totalAmount: resolved.totalAmount,
    advancePaid,
    balanceDue,
    securityDeposit: resolved.securityDeposit,
    status: isDirectUpi ? "pending_approval" : "confirmed",
    paymentStatus: isDirectUpi ? "verification_pending" : "paid",
    utrNumber: opts.utrNumber || opts.transactionId,
    paymentProofUrl: opts.paymentProofUrl,
    cancellationPolicy: {
      refundableUntilDate: "14 days prior to event",
      refundPercentage: 85,
      termsSummary:
        "85% refund of advance deposit if cancelled 14+ days prior. 50% refund between 7-14 days. Non-refundable under 7 days.",
    },
    customerName: opts.customerName,
    customerPhone: opts.customerPhone,
    customerEmail: opts.customerEmail,
    specialRequests: opts.specialRequests,
    paymentGateway: opts.paymentGateway || "direct_upi",
    razorpayOrderId: opts.razorpayOrderId,
    razorpayPaymentId: opts.razorpayPaymentId,
    razorpaySignature: opts.razorpaySignature,
    paymentDetails: {
      transactionId:
        opts.transactionId ||
        opts.utrNumber ||
        `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod:
        opts.paymentMethod ||
        (isDirectUpi ? "Direct UPI (QR Payment)" : "Razorpay Gateway"),
      paidAt: new Date(),
      invoiceNumber: `INV-2026-${randomSuffix}`,
    },
  });

  if (!isDirectUpi && resolved.resolvedVenueId) {
    syncVenueCalendarSlot(resolved.resolvedVenueId.toString(), {
      eventDate: resolved.eventDate,
      customerName: opts.customerName,
      bookingRef,
      packageTitle: resolved.resolvedPackageTitle,
      guestCount: resolved.guestCount,
    });
  }

  return booking;
}

async function ensureDirectUpiAllowed(paymentGateway: string): Promise<boolean> {
  if (paymentGateway !== "direct_upi") return true;
  const platformSettings = await PlatformSettings.findOne({ key: "platform_config" });
  return !(platformSettings?.upiSettings && platformSettings.upiSettings.isEnabled === false);
}

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paymentGateway = req.body.paymentGateway || "direct_upi";
    if (!(await ensureDirectUpiAllowed(paymentGateway))) {
      res.status(400).json({
        success: false,
        message:
          "Direct UPI payment mode is currently paused by platform administrator. Please complete payment via online payment gateway.",
      });
      return;
    }

    const outcome = await resolveAndValidateBookingItem(req.body);
    if (!outcome.ok) {
      res.status(outcome.status).json(outcome.payload);
      return;
    }

    const booking = await createBookingRecord(outcome.data, {
      userId: req.user ? (req.user._id as mongoose.Types.ObjectId) : undefined,
      bookingSource: "online",
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerEmail: req.body.customerEmail,
      specialRequests: req.body.specialRequests,
      paymentGateway,
      transactionId: req.body.transactionId,
      paymentMethod: req.body.paymentMethod,
      utrNumber: req.body.utrNumber,
      paymentProofUrl: req.body.paymentProofUrl,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
    });

    const isDirectUpi = paymentGateway === "direct_upi";
    res.status(201).json({
      success: true,
      message: isDirectUpi
        ? `Booking request ${booking.bookingRef} received! Pending admin verification of your UPI transfer.`
        : `Booking ${booking.bookingRef} has been confirmed successfully!`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const checkoutCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items = [], paymentGateway = "direct_upi" } = req.body;

    if (!(await ensureDirectUpiAllowed(paymentGateway))) {
      res.status(400).json({
        success: false,
        message:
          "Direct UPI payment mode is currently paused by platform administrator. Please complete payment via online payment gateway.",
      });
      return;
    }

    // Validate & check slot conflicts across ALL items before committing any reservation
    const resolvedItems: ResolvedBookingItem[] = [];
    for (const item of items) {
      const outcome = await resolveAndValidateBookingItem(item);
      if (!outcome.ok) {
        res.status(outcome.status).json(outcome.payload);
        return;
      }
      resolvedItems.push(outcome.data);
    }

    const cartGroupId = `CART-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdBookings = [];

    for (const resolved of resolvedItems) {
      const booking = await createBookingRecord(resolved, {
        userId: req.user ? (req.user._id as mongoose.Types.ObjectId) : undefined,
        bookingSource: "online",
        cartGroupId,
        customerName: req.body.customerName,
        customerPhone: req.body.customerPhone,
        customerEmail: req.body.customerEmail,
        specialRequests: req.body.specialRequests,
        paymentGateway,
        transactionId: req.body.transactionId,
        paymentMethod: req.body.paymentMethod,
        utrNumber: req.body.utrNumber,
        paymentProofUrl: req.body.paymentProofUrl,
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId,
        razorpaySignature: req.body.razorpaySignature,
      });
      createdBookings.push(booking);
    }

    const summary = createdBookings.reduce(
      (acc, b) => ({
        count: acc.count + 1,
        totalAmount: acc.totalAmount + b.totalAmount,
        advancePaid: acc.advancePaid + b.advancePaid,
        balanceDue: acc.balanceDue + b.balanceDue,
      }),
      { count: 0, totalAmount: 0, advancePaid: 0, balanceDue: 0 }
    );

    res.status(201).json({
      success: true,
      message: `${createdBookings.length} booking(s) submitted successfully!`,
      cartGroupId,
      summary,
      data: createdBookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    let query: any = {};

    if (user) {
      const matchCriteria: any[] = [{ userId: user._id }];
      if (user.email) matchCriteria.push({ customerEmail: user.email.toLowerCase() });
      if (user.phone) matchCriteria.push({ customerPhone: user.phone });
      query = { $or: matchCriteria };
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
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

export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = (req.params.id as string) || "";

    let booking = null;
    if (id.startsWith("ES-")) {
      booking = await Booking.findOne({ bookingRef: id });
    } else if (mongoose.isValidObjectId(id)) {
      booking = await Booking.findById(id);
    } else {
      booking = await Booking.findOne({ bookingRef: id });
    }

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking reservation not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = (req.params.id as string) || "";

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
      return;
    }

    if (booking.status === "cancelled" || booking.status === "refunded") {
      res.status(400).json({
        success: false,
        message: "This booking is already cancelled.",
      });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingRef} has been cancelled. Refund processing initiated as per policy terms.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Fetch all bookings pending Direct UPI payment verification
 */
export const getPendingApprovals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find({
      $or: [
        { status: "pending_approval" },
        { paymentGateway: "direct_upi", paymentStatus: "verification_pending" },
      ],
    }).sort({ createdAt: -1 });

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
 * Admin: Approve Direct UPI advance payment and confirm reservation
 */
export const approveBookingPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = (req.params.id as string) || "";
    let booking = null;
    if (id.startsWith("ES-")) {
      booking = await Booking.findOne({ bookingRef: id });
    } else if (mongoose.isValidObjectId(id)) {
      booking = await Booking.findById(id);
    } else {
      booking = await Booking.findOne({ bookingRef: id });
    }

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.approvedAt = new Date();
    booking.approvedBy = req.body.approvedBy || "Operations SuperAdmin";
    booking.adminApprovalNotes = req.body.notes || "Approved via Admin Control Deck";

    // Ensure invoice number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    if (!booking.paymentDetails) {
      booking.paymentDetails = {
        paidAt: new Date(),
        invoiceNumber: `INV-2026-${randomSuffix}`,
        paymentMethod: "Direct UPI (Approved)",
      };
    } else if (!booking.paymentDetails.invoiceNumber) {
      booking.paymentDetails.invoiceNumber = `INV-2026-${randomSuffix}`;
    }

    await booking.save();

    // Lock date slot in venue calendar overrides if this is a venue reservation
    if (booking.venueId) {
      syncVenueCalendarSlot(booking.venueId.toString(), {
        eventDate: booking.eventDate,
        customerName: booking.customerName,
        bookingRef: booking.bookingRef,
        packageTitle: booking.packageTitle,
        guestCount: booking.guestCount,
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingRef} payment approved and reservation confirmed!`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Reject Direct UPI payment
 */
export const rejectBookingPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = (req.params.id as string) || "";
    let booking = null;
    if (id.startsWith("ES-")) {
      booking = await Booking.findOne({ bookingRef: id });
    } else if (mongoose.isValidObjectId(id)) {
      booking = await Booking.findById(id);
    } else {
      booking = await Booking.findOne({ bookingRef: id });
    }

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    booking.status = "rejected";
    booking.paymentStatus = "failed";
    booking.adminApprovalNotes =
      req.body.reason || "Payment proof verification could not be validated with bank.";
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingRef} payment rejected.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
