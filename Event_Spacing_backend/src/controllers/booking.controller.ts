import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { Venue } from "../models/Venue";
import { PlatformSettings } from "../models/Settings";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { venueCalendarOverrides } from "./vendorPortal.controller";

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      venueId,
      selectedSpaceName,
      packageTitle,
      eventCategory,
      eventDate,
      timeSlot,
      guestCount,
      customerName,
      customerPhone,
      customerEmail,
      specialRequests,
      transactionId,
      paymentMethod,
      paymentGateway = "direct_upi",
      utrNumber,
      paymentProofUrl,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
      return;
    }

    // 1. Resolve Target Space & Perform Atomic Slot Conflict Check
    const targetSpace = selectedSpaceName || venue.spaces?.[0]?.name || "Main Banquet Hall";

    let slotConflictCondition: any = {};
    if (timeSlot === "Full Day (8 AM - 11 PM)") {
      slotConflictCondition = {
        $in: [
          "Full Day (8 AM - 11 PM)",
          "Morning Slot (8 AM - 3 PM)",
          "Evening Slot (4 PM - 11 PM)",
        ],
      };
    } else {
      slotConflictCondition = {
        $in: ["Full Day (8 AM - 11 PM)", timeSlot],
      };
    }

    const existingConflict = await Booking.findOne({
      venueId: venue._id,
      selectedSpaceName: targetSpace,
      eventDate: eventDate,
      timeSlot: slotConflictCondition,
      status: { $in: ["confirmed", "completed"] },
    });

    if (existingConflict) {
      res.status(409).json({
        success: false,
        message: `Slot Conflict: "${targetSpace}" is already booked for ${existingConflict.timeSlot} on ${eventDate}. Please choose an alternative slot, hall, or date.`,
        conflict: {
          bookingRef: existingConflict.bookingRef,
          spaceName: existingConflict.selectedSpaceName,
          eventDate: existingConflict.eventDate,
          timeSlot: existingConflict.timeSlot,
        },
      });
      return;
    }

    // Determine package pricing
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

    // Calculate Advance & Balance
    const advancePercent = venue.pricing.advancePaymentPercent || 30;
    const advancePaid = Math.round((totalAmount * advancePercent) / 100);
    const balanceDue = totalAmount - advancePaid;
    const securityDeposit = venue.pricing.securityDeposit || 25000;

    // Generate unique reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `ES-BLR-2026-${randomSuffix}`;

    const isDirectUpi = paymentGateway === "direct_upi";

    // Validate if Direct UPI mode is allowed by platform administrator
    if (isDirectUpi) {
      const platformSettings = await PlatformSettings.findOne({ key: "platform_config" });
      if (platformSettings?.upiSettings && platformSettings.upiSettings.isEnabled === false) {
        res.status(400).json({
          success: false,
          message:
            "Direct UPI payment mode is currently paused by platform administrator. Please complete payment via online payment gateway.",
        });
        return;
      }
    }

    const booking = await Booking.create({
      bookingRef,
      userId: req.user ? req.user._id : undefined,
      venueId: venue._id,
      venueName: venue.name,
      venueCoverImage: venue.coverImage,
      locality: venue.location.locality,
      city: venue.location.city,
      selectedSpaceName: selectedSpaceName || venue.spaces?.[0]?.name || "Main Banquet Hall",
      packageTitle,
      eventCategory,
      eventDate,
      timeSlot,
      guestCount,
      totalAmount,
      advancePaid,
      balanceDue,
      securityDeposit,
      status: isDirectUpi ? "pending_approval" : "confirmed",
      paymentStatus: isDirectUpi ? "verification_pending" : "paid",
      utrNumber: utrNumber || transactionId,
      paymentProofUrl,
      cancellationPolicy: {
        refundableUntilDate: "14 days prior to event",
        refundPercentage: 85,
        termsSummary:
          "85% refund of advance deposit if cancelled 14+ days prior. 50% refund between 7-14 days. Non-refundable under 7 days.",
      },
      customerName,
      customerPhone,
      customerEmail,
      specialRequests,
      paymentGateway,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentDetails: {
        transactionId: transactionId || utrNumber || `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        paymentMethod: paymentMethod || (isDirectUpi ? "Direct UPI (QR Payment)" : "Razorpay Gateway"),
        paidAt: new Date(),
        invoiceNumber: `INV-2026-${randomSuffix}`,
      },
    });

    // If online verified (e.g. Razorpay), lock date slot in venue calendar immediately
    if (!isDirectUpi) {
      const venueKey = venue._id.toString();
      if (!venueCalendarOverrides[venueKey]) {
        venueCalendarOverrides[venueKey] = [];
      }
      const existingSlotIdx = venueCalendarOverrides[venueKey].findIndex((s) => s.date === eventDate);
      const slotEntry = {
        date: eventDate,
        status: "booked",
        bookedBy: customerName,
        bookingRef,
        notes: `Confirmed: ${packageTitle} (${guestCount} guests)`,
      };
      if (existingSlotIdx >= 0) {
        venueCalendarOverrides[venueKey][existingSlotIdx] = slotEntry;
      } else {
        venueCalendarOverrides[venueKey].push(slotEntry);
      }
    }

    res.status(201).json({
      success: true,
      message: isDirectUpi
        ? `Booking request ${bookingRef} received! Pending admin verification of your UPI transfer.`
        : `Booking ${bookingRef} has been confirmed successfully!`,
      data: booking,
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

    // Lock date slot in venue calendar overrides
    const venueKey = booking.venueId.toString();
    if (!venueCalendarOverrides[venueKey]) {
      venueCalendarOverrides[venueKey] = [];
    }
    const existingSlotIdx = venueCalendarOverrides[venueKey].findIndex((s) => s.date === booking.eventDate);
    const slotEntry = {
      date: booking.eventDate,
      status: "booked",
      bookedBy: booking.customerName,
      bookingRef: booking.bookingRef,
      notes: `Confirmed: ${booking.packageTitle} (${booking.guestCount} guests)`,
    };
    if (existingSlotIdx >= 0) {
      venueCalendarOverrides[venueKey][existingSlotIdx] = slotEntry;
    } else {
      venueCalendarOverrides[venueKey].push(slotEntry);
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
