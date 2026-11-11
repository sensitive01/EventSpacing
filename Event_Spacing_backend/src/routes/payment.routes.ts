import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment.controller";

const router = Router();

// 1. Create Razorpay Order
router.post("/razorpay/order", createRazorpayOrder);

// 2. Verify Razorpay Payment Signature
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;

