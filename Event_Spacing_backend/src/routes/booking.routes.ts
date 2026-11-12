import { Router } from "express";
import {
  createBooking,
  checkoutCart,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getPendingApprovals,
  approveBookingPayment,
  rejectBookingPayment,
} from "../controllers/booking.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { checkoutCartSchema, createBookingSchema } from "../validators/booking.validator";

const router = Router();

router.post("/", protect, validate({ body: createBookingSchema }), createBooking);
router.post("/checkout-cart", protect, validate({ body: checkoutCartSchema }), checkoutCart);
router.get("/pending-approvals", getPendingApprovals);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/approve", approveBookingPayment);
router.put("/:id/reject", rejectBookingPayment);
router.get("/:id", getBookingById);
router.post("/:id/cancel", protect, cancelBooking);

export default router;

