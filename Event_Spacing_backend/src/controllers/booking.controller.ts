import { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking";
import { Venue } from "../models/Venue";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

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
    } = req.body;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      res.status(404).json({
        success: false,
        message: "Venue not found.",
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
      status: "confirmed",
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
    });

    res.status(201).json({
      success: true,
      message: `Booking ${bookingRef} has been confirmed successfully!`,
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
    } else {
      booking = await Booking.findById(id);
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
