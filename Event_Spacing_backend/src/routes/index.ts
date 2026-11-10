import { Router } from "express";
import authRoutes from "./auth.routes";
import venueRoutes from "./venue.routes";
import bookingRoutes from "./booking.routes";
import inquiryRoutes from "./inquiry.routes";
import vendorRoutes from "./vendor.routes";
import vendorPortalRoutes from "./vendorPortal.routes";
import categoryRoutes from "./category.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/venues", venueRoutes);
router.use("/bookings", bookingRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/vendors", vendorRoutes);
router.use("/vendor-portal", vendorPortalRoutes);
router.use("/categories", categoryRoutes);

export default router;

