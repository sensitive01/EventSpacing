import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Review, IReview } from "../models/Review";
import { Venue } from "../models/Venue";
import { MarketplaceService } from "../models/MarketplaceService";
import { Booking } from "../models/Booking";

/**
 * Recalculates average rating and review count for a target venue or service.
 */
export async function recalculateTargetRating(
  targetType: "venue" | "service",
  targetId: mongoose.Types.ObjectId | string
): Promise<{ rating: number; reviewCount: number }> {
  const objectId = typeof targetId === "string" ? new mongoose.Types.ObjectId(targetId) : targetId;

  const stats = await Review.aggregate([
    {
      $match: {
        targetType,
        targetId: objectId,
        status: "published",
      },
    },
    {
      $group: {
        _id: "$targetId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 4.8;
  const reviewCount = stats.length > 0 ? stats[0].count : 0;

  if (targetType === "venue") {
    await Venue.findByIdAndUpdate(objectId, { rating, reviewCount });
  } else if (targetType === "service") {
    await MarketplaceService.findByIdAndUpdate(objectId, { rating, reviewCount });
  }

  return { rating, reviewCount };
}

/**
 * 1. Submit a Customer Review for a Venue or Marketplace Service
 * POST /api/reviews
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      targetType,
      targetId,
      bookingId,
      rating,
      comment,
      cleanliness,
      staffService,
      facilities,
      valueForMoney,
      eventType,
      guestCount,
      eventDate,
      photos,
      name,
      email,
      phone,
    } = req.body;

    if (!targetType || !["venue", "service"].includes(targetType)) {
      res.status(400).json({ success: false, message: "targetType must be 'venue' or 'service'." });
      return;
    }

    if (!targetId || !mongoose.isValidObjectId(targetId)) {
      res.status(400).json({ success: false, message: "Valid targetId is required." });
      return;
    }

    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
      return;
    }

    if (!comment || !String(comment).trim()) {
      res.status(400).json({ success: false, message: "Review comment text is required." });
      return;
    }

    // Resolve target details
    let targetName = "";
    let vendorId: mongoose.Types.ObjectId | undefined;

    if (targetType === "venue") {
      const v = await Venue.findById(targetId);
      if (!v) {
        res.status(404).json({ success: false, message: "Venue not found." });
        return;
      }
      targetName = v.name;
      vendorId = v.vendorId;
    } else {
      const s = await MarketplaceService.findById(targetId);
      if (!s) {
        res.status(404).json({ success: false, message: "Marketplace service not found." });
        return;
      }
      targetName = s.businessName;
      vendorId = s.vendorId;
    }

    // Resolve user session if authenticated
    const authUser = (req as any).user;
    const authorName = authUser?.name || name || "Verified Guest";
    const authorEmail = authUser?.email || email;
    const authorPhone = authUser?.phone || phone;
    const authorAvatar =
      authUser?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

    // Check if author has verified booking
    let isVerifiedBooking = false;
    let resolvedBookingId: mongoose.Types.ObjectId | undefined;

    if (bookingId && mongoose.isValidObjectId(bookingId)) {
      resolvedBookingId = new mongoose.Types.ObjectId(bookingId);
      const b = await Booking.findById(resolvedBookingId);
      if (b && (b.status === "confirmed" || b.status === "completed")) {
        isVerifiedBooking = true;
      }
    } else if (authUser?._id) {
      const pastBooking = await Booking.findOne({
        userId: authUser._id,
        ...(targetType === "venue" ? { venueId: targetId } : { vendorServiceId: targetId }),
        status: { $in: ["confirmed", "completed"] },
      });
      if (pastBooking) {
        isVerifiedBooking = true;
        resolvedBookingId = pastBooking._id as mongoose.Types.ObjectId;
      }
    }

    const review = await Review.create({
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      targetName,
      vendorId,
      bookingId: resolvedBookingId,
      userId: authUser?._id,
      userName: authorName,
      userEmail: authorEmail,
      userPhone: authorPhone,
      avatar: authorAvatar,
      rating: ratingNum,
      ratingsBreakdown: {
        cleanliness: Number(cleanliness) || ratingNum,
        staffService: Number(staffService) || ratingNum,
        facilities: Number(facilities) || ratingNum,
        valueForMoney: Number(valueForMoney) || ratingNum,
      },
      eventType: eventType || "Celebration",
      guestCount: Number(guestCount) || 100,
      eventDate: eventDate || new Date().toISOString().split("T")[0],
      comment: String(comment).trim(),
      photos: Array.isArray(photos) ? photos : [],
      isVerifiedBooking,
      status: "published",
    });

    // Auto-update average rating & reviewCount on target
    await recalculateTargetRating(targetType, targetId);

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been published.",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Public Reviews & Aggregate Statistics for a Venue or Marketplace Service
 * GET /api/reviews/target/:targetType/:targetId
 */
export const getTargetReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetType = String(req.params.targetType);
    const targetId = String(req.params.targetId);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    if (!["venue", "service"].includes(targetType) || !mongoose.isValidObjectId(targetId)) {
      res.status(400).json({ success: false, message: "Invalid targetType or targetId." });
      return;
    }

    const objectId = new mongoose.Types.ObjectId(targetId);
    const query = { targetType, targetId: objectId, status: "published" };

    const [reviews, totalCount, aggregateStats] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            cleanliness: { $avg: "$ratingsBreakdown.cleanliness" },
            staffService: { $avg: "$ratingsBreakdown.staffService" },
            facilities: { $avg: "$ratingsBreakdown.facilities" },
            valueForMoney: { $avg: "$ratingsBreakdown.valueForMoney" },
            star5: { $sum: { $cond: [{ $gte: ["$rating", 4.5] }, 1, 0] } },
            star4: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 3.5] }, { $lt: ["$rating", 4.5] }] }, 1, 0] } },
            star3: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 2.5] }, { $lt: ["$rating", 3.5] }] }, 1, 0] } },
            star2: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 1.5] }, { $lt: ["$rating", 2.5] }] }, 1, 0] } },
            star1: { $sum: { $cond: [{ $lt: ["$rating", 1.5] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const stats = aggregateStats[0] || {};
    const overallScore = stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : 4.8;

    res.status(200).json({
      success: true,
      data: {
        overallScore,
        totalReviews: totalCount,
        ratingsDistribution: {
          5: stats.star5 || 0,
          4: stats.star4 || 0,
          3: stats.star3 || 0,
          2: stats.star2 || 0,
          1: stats.star1 || 0,
        },
        categoryAverages: {
          cleanliness: stats.cleanliness ? Math.round(stats.cleanliness * 10) / 10 : 4.8,
          staffService: stats.staffService ? Math.round(stats.staffService * 10) / 10 : 4.9,
          facilities: stats.facilities ? Math.round(stats.facilities * 10) / 10 : 4.8,
          valueForMoney: stats.valueForMoney ? Math.round(stats.valueForMoney * 10) / 10 : 4.7,
        },
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
        reviews: reviews.map((r) => ({
          id: r._id.toString(),
          venueId: r.targetId.toString(),
          venueName: r.targetName,
          customerName: r.userName,
          avatar: r.avatar,
          rating: r.rating,
          eventType: r.eventType || "Celebration",
          guestCount: r.guestCount || 150,
          eventDate: r.eventDate || r.createdAt.toISOString().split("T")[0],
          createdAt: r.createdAt.toISOString().split("T")[0],
          comment: r.comment,
          ratingsBreakdown: r.ratingsBreakdown || {
            cleanliness: r.rating,
            staff: r.rating,
            facilities: r.rating,
            valueForMoney: r.rating,
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
 * 3. Customer reviews authored by current user
 * GET /api/reviews/my-reviews
 */
export const getMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
