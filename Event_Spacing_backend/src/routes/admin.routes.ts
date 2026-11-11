import { Router } from "express";
import {
  getAdminMetrics,
  getAdminTransactions,
  getAdminVenues,
  toggleVenueVerified,
  getVenueApprovals,
  approveVenue,
  rejectVenue,
} from "../controllers/admin.controller";

const router = Router();

router.get("/metrics", getAdminMetrics);
router.get("/transactions", getAdminTransactions);
router.get("/venues", getAdminVenues);
router.put("/venues/:id/verify", toggleVenueVerified);
router.get("/venues/approvals", getVenueApprovals);
router.put("/venues/:id/approve", approveVenue);
router.put("/venues/:id/reject", rejectVenue);

export default router;

