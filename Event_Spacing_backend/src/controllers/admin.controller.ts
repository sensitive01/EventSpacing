import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Venue } from "../models/Venue";
import { Booking } from "../models/Booking";
import { Vendor } from "../models/Vendor";
import { User } from "../models/User";

/**
 * GET /api/admin/metrics
 * Aggregates live platform numbers from MongoDB Atlas
 */
export const getAdminMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalVenuesLive,
      venuesUnderReview,
      partnersList,
      confirmedBookings,
      pendingApprovalsCount,
    ] = await Promise.all([
      Venue.countDocuments({ status: { $ne: "suspended" } }),
      Venue.countDocuments({ isVerified: false }),
      buildUnifiedVendorPartners(),
      Booking.find({ status: { $in: ["confirmed", "completed"] } }),
      Booking.countDocuments({ status: "pending_approval" }),
    ]);

    const totalVendors = partnersList.length;

    const monthlyPlatformGMV = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );
    const monthlyCommissionEarned = Math.round(monthlyPlatformGMV * 0.1);
    const totalAdvanceReceived = confirmedBookings.reduce(
      (sum, b) => sum + (b.advancePaid || 0),
      0
    );
    const averageBookingValue =
      confirmedBookings.length > 0
        ? Math.round(monthlyPlatformGMV / confirmedBookings.length)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalVenuesLive,
        venuesUnderReview,
        totalVendors,
        totalCustomerInquiries: 0,
        monthlyPlatformGMV,
        monthlyCommissionEarned,
        totalAdvanceReceived,
        averageBookingValue,
        pendingApprovalsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/transactions
 * Returns live customer transactions formatted for the admin financial ledger
 */
export const getAdminTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    const transactions = bookings.map((b) => {
      const gross = b.totalAmount || 0;
      const commission = Math.round(gross * 0.1);
      const net = gross - commission;

      return {
        id: `TX-${b.bookingRef.slice(-4)}`,
        bookingRef: b.bookingRef,
        date: b.eventDate || new Date(b.createdAt).toISOString().split("T")[0],
        venueName: b.venueName,
        vendorName: "Verified Partner",
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        grossAmount: gross,
        advancePaid: b.advancePaid,
        balanceDue: b.balanceDue,
        commissionPercent: 10,
        commissionAmount: commission,
        netPayoutToVendor: net,
        paymentStatus:
          b.status === "confirmed" || b.status === "completed"
            ? "completed"
            : b.status === "pending_approval"
            ? "escrow_held"
            : "refunded",
        status: b.status,
        paymentGateway: b.paymentGateway,
        utrNumber: b.utrNumber,
      };
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/venues
 * Returns all venues for catalog management
 */
export const getAdminVenues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });

    const enriched = venues.map((v) => ({
      ...v.toObject(),
      vendorName: v.businessName || "Registered Partner",
      status: v.status || "live",
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/venues/:id/verify
 * Toggle venue verification checkmark or badge
 */
export const toggleVenueVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified, badge, status } = req.body;

    const updateFields: any = {};
    if (isVerified !== undefined) updateFields.isVerified = isVerified;
    if (badge !== undefined) updateFields.badge = badge;
    if (status !== undefined) updateFields.status = status;

    const venue = await Venue.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!venue) {
      res.status(404).json({ success: false, message: "Venue not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Venue updated successfully",
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/venues/approvals
 * Returns venues pending KYC compliance review
 */
export const getVenueApprovals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const venues = await Venue.find({
      $or: [{ isVerified: false }, { status: "pending" }],
    }).sort({ createdAt: -1 });

    const formatted = venues.map((v) => ({
      id: v._id.toString(),
      venueName: v.name,
      vendorId: v.vendorId?.toString() || "vend_unknown",
      vendorName: v.businessName || "Vendor Partner",
      vendorEmail: "partner@eventspacing.com",
      vendorPhone: "+91 98450 00000",
      submissionDate: new Date(v.createdAt).toLocaleDateString("en-IN"),
      venueType: v.venueType || "Banquet Hall",
      city: v.location?.city || "Bengaluru",
      locality: v.location?.locality || "Central",
      seatingCapacity: v.capacity?.seatingCapacity || 300,
      floatingCapacity: v.capacity?.floatingCapacity || 500,
      pricePerDay: v.pricing?.pricePerDay || 25000,
      coverImage: v.coverImage || "",
      photos: v.images || [],
      documents: [
        { type: "Trade License / NOC", fileName: "Municipal_NOC_2026.pdf", status: "verified" },
        { type: "Floor Plan", fileName: "Architect_Sanctioned_Layout.pdf", status: "verified" },
      ],
      amenities: v.amenities || [],
      eventTypes: v.eventTypes || [],
      status: v.isVerified ? "approved" : "pending",
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/venues/:id/approve
 */
export const approveVenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByIdAndUpdate(
      id,
      { $set: { isVerified: true, status: "live" } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Venue ${venue?.name} approved and marked live.`,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/venues/:id/reject
 */
export const rejectVenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByIdAndUpdate(
      id,
      { $set: { status: "rejected" } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Venue application rejected.`,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};


function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizePhoneTail(phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function buildUserMatchConditions(user: any): any[] {
  const conditions: any[] = [{ userId: user._id }];
  if (user.email) {
    conditions.push({ customerEmail: user.email.toLowerCase().trim() });
  }
  const tail = normalizePhoneTail(user.phone);
  if (tail.length >= 6) {
    conditions.push({ customerPhone: new RegExp(`${tail}$`) });
  }
  return conditions;
}

/**
 * GET /api/admin/users
 * Returns all registered User accounts enriched with venue and booking statistics.
 */
export const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [users, venues, bookings] = await Promise.all([
      User.find().select("-password -otpCode -otpExpiresAt").sort({ createdAt: -1 }),
      Venue.find({}, "vendorId businessName"),
      Booking.find({}, "userId customerEmail customerPhone totalAmount status"),
    ]);

    const venueCountByUserId = new Map<string, number>();
    const venueCountByBusiness = new Map<string, number>();
    for (const v of venues) {
      if (v.vendorId) {
        const key = v.vendorId.toString();
        venueCountByUserId.set(key, (venueCountByUserId.get(key) || 0) + 1);
      }
      if (v.businessName) {
        const bKey = v.businessName.trim().toLowerCase();
        venueCountByBusiness.set(bKey, (venueCountByBusiness.get(bKey) || 0) + 1);
      }
    }

    const bookingIdsByKey = new Map<string, Set<string>>();
    const bookingSpendById = new Map<string, number>();
    const addBookingKey = (key: string, bookingId: string) => {
      if (!key) return;
      let set = bookingIdsByKey.get(key);
      if (!set) {
        set = new Set<string>();
        bookingIdsByKey.set(key, set);
      }
      set.add(bookingId);
    };

    for (const b of bookings) {
      const bId = b._id.toString();
      const activeSpend = b.status !== "cancelled" && b.status !== "rejected";
      bookingSpendById.set(bId, activeSpend ? b.totalAmount || 0 : 0);

      if (b.userId) addBookingKey(`id:${b.userId.toString()}`, bId);
      if (b.customerEmail) addBookingKey(`email:${b.customerEmail.toLowerCase().trim()}`, bId);
      const tail = normalizePhoneTail(b.customerPhone);
      if (tail.length >= 6) addBookingKey(`phone:${tail}`, bId);
    }

    const enrichedUsers = users.map((u) => {
      const uid = u._id.toString();
      const bizKey = (u.businessName || u.companyName || "").trim().toLowerCase();
      const venuesCount =
        venueCountByUserId.get(uid) || (bizKey ? venueCountByBusiness.get(bizKey) || 0 : 0);

      const seenBookingIds = new Set<string>();
      const keys = [
        `id:${uid}`,
        u.email ? `email:${u.email.toLowerCase().trim()}` : "",
        normalizePhoneTail(u.phone).length >= 6 ? `phone:${normalizePhoneTail(u.phone)}` : "",
      ].filter(Boolean);

      for (const k of keys) {
        bookingIdsByKey.get(k)?.forEach((bId) => seenBookingIds.add(bId));
      }

      const bookingsCount = seenBookingIds.size;
      let totalSpent = 0;
      seenBookingIds.forEach((bId) => {
        totalSpent += bookingSpendById.get(bId) || 0;
      });

      return {
        id: uid,
        _id: uid,
        name: u.name,
        email: u.email || "",
        phone: u.phone || "",
        role: u.role,
        companyName: u.companyName || "",
        businessName: u.businessName || u.companyName || "",
        gstNumber: u.gstNumber || "",
        panNumber: u.panNumber || "",
        kycStatus: u.kycStatus || "verified",
        avatarUrl: u.avatarUrl || "",
        isPhoneVerified: Boolean(u.isPhoneVerified),
        isEmailVerified: Boolean(u.isEmailVerified),
        isBlocked: Boolean(u.isBlocked),
        blockedReason: u.blockedReason || "",
        blockedAt: u.blockedAt || null,
        venuesCount,
        bookingsCount,
        totalSpent,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    });

    const summary = {
      totalUsers: enrichedUsers.length,
      organizersCount: enrichedUsers.filter((u) => u.role === "organizer").length,
      vendorsCount: enrichedUsers.filter((u) => u.role === "vendor").length,
      adminsCount: enrichedUsers.filter((u) => u.role === "admin").length,
      blockedCount: enrichedUsers.filter((u) => u.isBlocked).length,
    };

    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      data: enrichedUsers,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Returns full profile details, recent bookings, and owned venues for a user.
 */
export const getAdminUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID format." });
      return;
    }

    const user = await User.findById(id).select("-password -otpCode -otpExpiresAt");
    if (!user) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    const [recentBookings, ownedVenues] = await Promise.all([
      Booking.find({ $or: buildUserMatchConditions(user) })
        .select("bookingRef venueName eventDate timeSlot totalAmount advancePaid status paymentGateway createdAt")
        .sort({ createdAt: -1 })
        .limit(10),
      Venue.find({
        $or: [
          { vendorId: user._id },
          ...(user.businessName ? [{ businessName: user.businessName }] : []),
        ],
      })
        .select("name slug venueType location.city location.locality status isVerified pricing.pricePerDay createdAt")
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email || "",
          phone: user.phone || "",
          role: user.role,
          companyName: user.companyName || "",
          businessName: user.businessName || user.companyName || "",
          gstNumber: user.gstNumber || "",
          panNumber: user.panNumber || "",
          bankDetails: user.bankDetails || {},
          kycStatus: user.kycStatus || "verified",
          avatarUrl: user.avatarUrl || "",
          isPhoneVerified: Boolean(user.isPhoneVerified),
          isEmailVerified: Boolean(user.isEmailVerified),
          isBlocked: Boolean(user.isBlocked),
          blockedReason: user.blockedReason || "",
          blockedAt: user.blockedAt || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        recentBookings,
        ownedVenues,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id
 * Updates a user's editable profile, role, KYC status, and verification flags.
 */
export const updateAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID format." });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    const {
      name,
      email,
      phone,
      role,
      companyName,
      businessName,
      gstNumber,
      panNumber,
      kycStatus,
      isPhoneVerified,
      isEmailVerified,
    } = req.body;

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail) {
        const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
        if (existingEmail) {
          res.status(409).json({
            success: false,
            message: "Another user already uses this email address.",
          });
          return;
        }
        user.email = cleanEmail;
      } else {
        user.email = undefined;
      }
    }

    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (cleanPhone) {
        const existingPhone = await User.findOne({ phone: cleanPhone, _id: { $ne: id } });
        if (existingPhone) {
          res.status(409).json({
            success: false,
            message: "Another user already uses this phone number.",
          });
          return;
        }
        user.phone = cleanPhone;
      } else {
        user.phone = undefined;
      }
    }

    if (role !== undefined && ["organizer", "vendor", "admin"].includes(role)) {
      user.role = role;
    }
    if (companyName !== undefined) user.companyName = String(companyName).trim();
    if (businessName !== undefined) user.businessName = String(businessName).trim();
    if (gstNumber !== undefined) user.gstNumber = String(gstNumber).trim();
    if (panNumber !== undefined) user.panNumber = String(panNumber).trim();
    if (kycStatus !== undefined && ["verified", "pending", "rejected"].includes(kycStatus)) {
      user.kycStatus = kycStatus;
    }
    if (typeof isPhoneVerified === "boolean") user.isPhoneVerified = isPhoneVerified;
    if (typeof isEmailVerified === "boolean") user.isEmailVerified = isEmailVerified;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User "${user.name}" updated successfully.`,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        companyName: user.companyName || "",
        businessName: user.businessName || user.companyName || "",
        gstNumber: user.gstNumber || "",
        panNumber: user.panNumber || "",
        kycStatus: user.kycStatus || "verified",
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/block
 * Blocks or unblocks a user account, storing moderation reason and timestamp.
 */
export const toggleUserBlockStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID format." });
      return;
    }

    const { isBlocked, blockedReason } = req.body;
    const nextBlocked = Boolean(isBlocked);

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBlocked: nextBlocked,
          blockedReason: nextBlocked ? String(blockedReason || "").trim() : "",
          blockedAt: nextBlocked ? new Date() : null,
        },
      },
      { new: true }
    ).select("-password -otpCode -otpExpiresAt");

    if (!user) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: nextBlocked
        ? `User "${user.name}" has been blocked.`
        : `User "${user.name}" has been unblocked.`,
      data: {
        id: user._id.toString(),
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason || "",
        blockedAt: user.blockedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Deletes a user account permanently (protects the last remaining admin account).
 */
export const deleteAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID format." });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          message: "Cannot delete the last remaining administrator account.",
        });
        return;
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregates registered vendor partner accounts along with ALL of their venues and marketplace services.
 */
async function buildUnifiedVendorPartners() {
  const [users, venues, services] = await Promise.all([
    User.find().select("-password -otpCode -otpExpiresAt").sort({ createdAt: -1 }),
    Venue.find().sort({ createdAt: -1 }),
    Vendor.find().sort({ createdAt: -1 }),
  ]);

  const userById = new Map<string, any>();
  const userByPhone = new Map<string, any>();
  const userByEmail = new Map<string, any>();
  const userByBusiness = new Map<string, any>();

  for (const u of users) {
    userById.set(u._id.toString(), u);
    const tail = normalizePhoneTail(u.phone);
    if (tail.length >= 6 && !userByPhone.has(tail)) userByPhone.set(tail, u);
    if (u.email && !userByEmail.has(u.email.toLowerCase().trim())) {
      userByEmail.set(u.email.toLowerCase().trim(), u);
    }
    const biz = (u.businessName || u.companyName || "").trim().toLowerCase();
    if (biz && !userByBusiness.has(biz)) userByBusiness.set(biz, u);
  }

  type GroupBucket = {
    key: string;
    user: any | null;
    venues: any[];
    services: any[];
  };

  const buckets = new Map<string, GroupBucket>();

  const ensureBucketForUser = (u: any): GroupBucket => {
    const key = `user:${u._id.toString()}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { key, user: u, venues: [], services: [] };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  // Seed all users explicitly registered with role === "vendor"
  for (const u of users) {
    if (u.role === "vendor") {
      ensureBucketForUser(u);
    }
  }

  const resolveOrCreateBucket = (entity: {
    vendorId?: any;
    phone?: string;
    email?: string;
    businessName?: string;
    _id: any;
  }, fallbackPrefix: string): GroupBucket => {
    const vId = entity.vendorId?.toString();
    const matchedUser =
      (vId && userById.get(vId)) ||
      (normalizePhoneTail(entity.phone).length >= 6 && userByPhone.get(normalizePhoneTail(entity.phone))) ||
      (entity.email && userByEmail.get(entity.email.toLowerCase().trim())) ||
      (entity.businessName && userByBusiness.get(entity.businessName.trim().toLowerCase())) ||
      null;

    if (matchedUser) {
      return ensureBucketForUser(matchedUser);
    }

    const tail = normalizePhoneTail(entity.phone);
    const fallbackKey =
      (tail.length >= 6 && `phone:${tail}`) ||
      (entity.email && `email:${entity.email.toLowerCase().trim()}`) ||
      (entity.businessName && `biz:${entity.businessName.trim().toLowerCase()}`) ||
      `${fallbackPrefix}:${entity._id.toString()}`;

    let bucket = buckets.get(fallbackKey);
    if (!bucket) {
      bucket = { key: fallbackKey, user: null, venues: [], services: [] };
      buckets.set(fallbackKey, bucket);
    }
    return bucket;
  };

  for (const venue of venues) {
    const bucket = resolveOrCreateBucket(
      {
        vendorId: venue.vendorId,
        businessName: venue.businessName,
        _id: venue._id,
      },
      "venue"
    );
    bucket.venues.push({
      id: venue._id.toString(),
      _id: venue._id.toString(),
      name: venue.name,
      slug: venue.slug,
      venueType: venue.venueType || "Banquet Hall",
      businessName: venue.businessName || "",
      city: venue.location?.city || "Bengaluru",
      locality: venue.location?.locality || "Central",
      pricePerDay: venue.pricing?.pricePerDay || 0,
      seatingCapacity: venue.capacity?.seatingCapacity || 0,
      floatingCapacity: venue.capacity?.floatingCapacity || 0,
      status: venue.status || "live",
      isVerified: Boolean(venue.isVerified),
      coverImage: venue.coverImage || "",
      rating: venue.rating || 4.5,
      reviewCount: venue.reviewCount || 0,
      createdAt: venue.createdAt,
    });
  }

  for (const svc of services) {
    const bucket = resolveOrCreateBucket(svc, "service");
    bucket.services.push({
      id: svc._id.toString(),
      _id: svc._id.toString(),
      businessName: svc.businessName,
      ownerName: svc.ownerName,
      category: svc.category,
      city: svc.city || "Bengaluru",
      locality: svc.locality || "Central",
      startingPrice: svc.startingPrice || 0,
      priceUnit: svc.priceUnit || "per day",
      rating: svc.rating || 4.8,
      reviewCount: svc.reviewCount || 0,
      imageUrl: svc.imageUrl || "",
      description: svc.description || "",
      isVerified: Boolean(svc.isVerified),
      phone: svc.phone || "",
      email: svc.email || "",
      createdAt: svc.createdAt,
    });
  }

  return Array.from(buckets.values())
    .map((bucket) => {
      const u = bucket.user;
      const primaryService = bucket.services[0];
      const primaryVenue = bucket.venues[0];

      const brandNames = Array.from(
        new Set(
          [
            u?.businessName,
            u?.companyName,
            ...bucket.services.map((s) => s.businessName),
            ...bucket.venues.map((v) => v.businessName),
          ]
            .map((v) => (v || "").trim())
            .filter(Boolean)
        )
      );

      const categories = Array.from(
        new Set(
          [
            ...bucket.services.map((s) => s.category),
            ...bucket.venues.map((v) => v.venueType),
          ].filter(Boolean)
        )
      );

      const localities = Array.from(
        new Set(
          [
            ...bucket.services.map((s) => s.locality),
            ...bucket.venues.map((v) => v.locality),
          ].filter(Boolean)
        )
      );

      const prices = [
        ...bucket.services.map((s) => Number(s.startingPrice || 0)),
        ...bucket.venues.map((v) => Number(v.pricePerDay || 0)),
      ].filter((p) => p > 0);

      const ratings = [
        ...bucket.services.map((s) => Number(s.rating || 0)),
        ...bucket.venues.map((v) => Number(v.rating || 0)),
      ].filter((r) => r > 0);

      const avgRating =
        ratings.length > 0
          ? Number((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1))
          : 4.8;

      const totalReviews =
        bucket.services.reduce((acc, s) => acc + (s.reviewCount || 0), 0) +
        bucket.venues.reduce((acc, v) => acc + (v.reviewCount || 0), 0);

      const isVerified = u
        ? u.kycStatus === "verified" &&
          (bucket.services.length === 0 || bucket.services.some((s) => s.isVerified))
        : Boolean(primaryService?.isVerified ?? primaryVenue?.isVerified);

      const partnerId = u?._id?.toString() || primaryService?.id || primaryVenue?.id || bucket.key;

      return {
        id: partnerId,
        _id: partnerId,
        userId: u?._id?.toString() || null,
        businessName: brandNames[0] || u?.name || "Vendor Partner",
        brandNames,
        ownerName: u?.name || primaryService?.ownerName || "Partner Manager",
        contactNames: Array.from(
          new Set([u?.name, ...bucket.services.map((s) => s.ownerName)].filter(Boolean))
        ),
        phone: u?.phone || primaryService?.phone || "",
        email: u?.email || primaryService?.email || "",
        city: primaryService?.city || primaryVenue?.city || "Bengaluru",
        locality: localities[0] || "Bengaluru",
        localities,
        category: categories[0] || "Banquet & Event Operations",
        categories,
        startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
        priceUnit: primaryService?.priceUnit || "per day",
        rating: avgRating,
        reviewCount: totalReviews,
        imageUrl: primaryService?.imageUrl || primaryVenue?.coverImage || "",
        kycStatus: u?.kycStatus || (isVerified ? "verified" : "pending"),
        isVerified,
        isBlocked: Boolean(u?.isBlocked),
        primaryServiceId: primaryService?.id || null,
        venues: bucket.venues,
        services: bucket.services,
        venuesCount: bucket.venues.length,
        servicesCount: bucket.services.length,
        createdAt: u?.createdAt || primaryService?.createdAt || primaryVenue?.createdAt || new Date(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * GET /api/admin/vendors
 * Returns unified vendor partners combining their registered account, owned venues, and marketplace services.
 */
export const getAdminVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const partners = await buildUnifiedVendorPartners();
    res.status(200).json({
      success: true,
      count: partners.length,
      data: partners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/vendors/partner/:userId
 * Updates a unified vendor partner account's details and syncs verification flags.
 */
export const updateAdminVendorPartner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    if (!isValidObjectId(userId)) {
      res.status(400).json({ success: false, message: "Invalid partner user ID format." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "Vendor partner account not found." });
      return;
    }

    const { ownerName, businessName, phone, email, isVerified } = req.body;

    if (typeof ownerName === "string" && ownerName.trim()) {
      user.name = ownerName.trim();
    }
    if (typeof businessName === "string" && businessName.trim()) {
      user.businessName = businessName.trim();
      user.companyName = businessName.trim();
    }
    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (cleanPhone) {
        const dupPhone = await User.findOne({ phone: cleanPhone, _id: { $ne: userId } });
        if (dupPhone) {
          res.status(409).json({ success: false, message: "Phone number already in use." });
          return;
        }
        user.phone = cleanPhone;
      }
    }
    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail) {
        const dupEmail = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
        if (dupEmail) {
          res.status(409).json({ success: false, message: "Email address already in use." });
          return;
        }
        user.email = cleanEmail;
      }
    }
    if (typeof isVerified === "boolean") {
      user.kycStatus = isVerified ? "verified" : "pending";
      await Promise.all([
        Vendor.updateMany({ vendorId: user._id }, { $set: { isVerified } }),
        Venue.updateMany({ vendorId: user._id }, { $set: { isVerified } }),
      ]);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Partner "${user.businessName || user.name}" updated successfully.`,
      data: {
        userId: user._id.toString(),
        ownerName: user.name,
        businessName: user.businessName || user.companyName || "",
        phone: user.phone || "",
        email: user.email || "",
        kycStatus: user.kycStatus,
        isVerified: user.kycStatus === "verified",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/vendors/:id
 * Updates marketplace vendor partner profile or verification status.
 */
export const updateAdminVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid vendor ID format." });
      return;
    }

    const {
      businessName,
      ownerName,
      category,
      city,
      locality,
      startingPrice,
      priceUnit,
      description,
      phone,
      email,
      isVerified,
    } = req.body;

    const updateFields: Record<string, any> = {};
    if (typeof businessName === "string" && businessName.trim()) {
      updateFields.businessName = businessName.trim();
    }
    if (typeof ownerName === "string" && ownerName.trim()) {
      updateFields.ownerName = ownerName.trim();
    }
    if (typeof category === "string" && category.trim()) updateFields.category = category.trim();
    if (typeof city === "string" && city.trim()) updateFields.city = city.trim();
    if (typeof locality === "string" && locality.trim()) updateFields.locality = locality.trim();
    if (startingPrice !== undefined && !Number.isNaN(Number(startingPrice))) {
      updateFields.startingPrice = Number(startingPrice);
    }
    if (typeof priceUnit === "string" && priceUnit.trim()) updateFields.priceUnit = priceUnit.trim();
    if (typeof description === "string") updateFields.description = description.trim();
    if (typeof phone === "string") updateFields.phone = phone.trim();
    if (typeof email === "string") updateFields.email = email.trim().toLowerCase();
    if (typeof isVerified === "boolean") updateFields.isVerified = isVerified;

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!vendor) {
      res.status(404).json({ success: false, message: "Vendor partner not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Vendor "${vendor.businessName}" updated successfully.`,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/vendors/:id
 * Deletes a vendor marketplace partner record.
 */
export const deleteAdminVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid vendor ID format." });
      return;
    }

    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      res.status(404).json({ success: false, message: "Vendor partner not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Vendor "${vendor.businessName}" removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
