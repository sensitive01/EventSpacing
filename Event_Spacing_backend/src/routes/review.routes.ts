import { Router } from "express";
import { optionalAuth, protect } from "../middleware/auth.middleware";
import {
  createReview,
  getTargetReviews,
  getMyReviews,
} from "../controllers/review.controller";

const router = Router();

// Submit a new review (Public or Authenticated)
router.post("/", optionalAuth, createReview);

// Get public reviews and ratings statistics for a venue or service
router.get("/target/:targetType/:targetId", getTargetReviews);

// Get reviews authored by currently signed in user
router.get("/my-reviews", protect, getMyReviews);

export default router;
