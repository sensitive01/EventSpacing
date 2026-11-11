import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getPendingApprovals,
  approveBookingPayment,
  rejectBookingPayment,
} from "../controllers/booking.controller";
import { protect, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createBookingSchema } from "../validators/booking.validator";

const router = Router();

router.post("/", optionalAuth, validate({ body: createBookingSchema }), createBooking);
router.get("/pending-approvals", getPendingApprovals);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/approve", approveBookingPayment);
router.put("/:id/reject", rejectBookingPayment);
router.get("/:id", getBookingById);
router.post("/:id/cancel", protect, cancelBooking);

export default router;

