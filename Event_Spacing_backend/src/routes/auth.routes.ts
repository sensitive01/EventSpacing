import { Router } from "express";
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", validate({ body: loginSchema }), login);
router.post("/send-otp", validate({ body: sendOtpSchema }), sendOtp);
router.post("/verify-otp", validate({ body: verifyOtpSchema }), verifyOtp);
router.get("/me", protect, getMe);
router.put("/profile", protect, validate({ body: updateProfileSchema }), updateProfile);
router.put("/change-password", protect, validate({ body: changePasswordSchema }), changePassword);

export default router;

