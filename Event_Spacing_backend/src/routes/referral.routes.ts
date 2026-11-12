import { Router } from "express";
import { applyReferralCode, getMyReferrals } from "../controllers/referral.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", protect, getMyReferrals);
router.post("/apply", protect, applyReferralCode);

export default router;

