import { Router } from "express";
import { getUpiSettings, updateUpiSettings } from "../controllers/settings.controller";

const router = Router();

// Public: Fetch active UPI configuration for customer checkout
router.get("/upi", getUpiSettings);

// Admin: Update UPI configuration
router.put("/upi", updateUpiSettings);

export default router;

