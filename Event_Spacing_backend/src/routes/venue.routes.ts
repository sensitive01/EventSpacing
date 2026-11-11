import { Router } from "express";
import {
  getVenues,
  getFeaturedVenues,
  getVenueBySlugOrId,
  getVenueBookedSlots,
  inquireVenue,
  onboardVenue,
  deleteVenue,
  purgeDemoVenues,
} from "../controllers/venue.controller";
import { validate } from "../middleware/validate.middleware";
import { venueInquirySchema } from "../validators/inquiry.validator";

const router = Router();

router.get("/", getVenues);
router.get("/featured", getFeaturedVenues);
router.post("/onboard", onboardVenue);
router.post("/purge-demo", purgeDemoVenues);
router.delete("/:id", deleteVenue);
router.get("/:slugOrId/booked-slots", getVenueBookedSlots);
router.get("/:slugOrId", getVenueBySlugOrId);
router.post("/:id/inquire", validate({ body: venueInquirySchema }), inquireVenue);

export default router;

