import { Router } from "express";
import {
  submitConciergeInquiry,
  submitCorporateInquiry,
} from "../controllers/inquiry.controller";
import { validate } from "../middleware/validate.middleware";
import {
  conciergeInquirySchema,
  corporateInquirySchema,
} from "../validators/inquiry.validator";

const router = Router();

router.post("/concierge", validate({ body: conciergeInquirySchema }), submitConciergeInquiry);
router.post("/corporate", validate({ body: corporateInquirySchema }), submitCorporateInquiry);

export default router;

