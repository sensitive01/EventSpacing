import { Router } from "express";
import {
  getAdminMetrics,
  getAdminTransactions,
  getAdminVenues,
  toggleVenueVerified,
  getVenueApprovals,
  approveVenue,
  rejectVenue,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  toggleUserBlockStatus,
  deleteAdminUser,
  getAdminVendors,
  getVendorApprovals,
  approveVendorPartner,
  rejectVendorPartner,
  updateAdminVendorPartner,
  updateAdminVendor,
  deleteAdminVendor,
  getAdminInquiries,
  updateAdminInquiry,
  deleteAdminInquiry,
} from "../controllers/admin.controller";

const router = Router();

router.get("/metrics", getAdminMetrics);
router.get("/transactions", getAdminTransactions);
router.get("/venues", getAdminVenues);
router.put("/venues/:id/verify", toggleVenueVerified);
router.get("/venues/approvals", getVenueApprovals);
router.put("/venues/:id/approve", approveVenue);
router.put("/venues/:id/reject", rejectVenue);

router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserById);
router.put("/users/:id", updateAdminUser);
router.put("/users/:id/block", toggleUserBlockStatus);
router.delete("/users/:id", deleteAdminUser);

router.get("/vendors", getAdminVendors);
router.get("/vendors/approvals", getVendorApprovals);
router.put("/vendors/partner/:userId/approve", approveVendorPartner);
router.put("/vendors/partner/:userId/reject", rejectVendorPartner);
router.put("/vendors/partner/:userId", updateAdminVendorPartner);
router.put("/vendors/:id", updateAdminVendor);
router.delete("/vendors/:id", deleteAdminVendor);

router.get("/inquiries", getAdminInquiries);
router.put("/inquiries/:id", updateAdminInquiry);
router.delete("/inquiries/:id", deleteAdminInquiry);

export default router;

