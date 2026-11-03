import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/booking.controller";
import { protect, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createBookingSchema } from "../validators/booking.validator";

const router = Router();

router.post("/", optionalAuth, validate({ body: createBookingSchema }), createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", getBookingById);
router.post("/:id/cancel", protect, cancelBooking);

export default router;

