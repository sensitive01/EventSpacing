import { Router } from "express";
import authRoutes from "./auth.routes";
import venueRoutes from "./venue.routes";
import bookingRoutes from "./booking.routes";
import inquiryRoutes from "./inquiry.routes";
import vendorRoutes from "./vendor.routes";
import vendorPortalRoutes from "./vendorPortal.routes";
import categoryRoutes from "./category.routes";
import paymentRoutes from "./payment.routes";
import settingsRoutes from "./settings.routes";
import adminRoutes from "./admin.routes";
import uploadRoutes from "./upload.routes";
import referralRoutes from "./referral.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/venues", venueRoutes);
router.use("/bookings", bookingRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/vendors", vendorRoutes);
router.use("/vendor-portal", vendorPortalRoutes);
router.use("/categories", categoryRoutes);
router.use("/payments", paymentRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/referrals", referralRoutes);

export default router;

