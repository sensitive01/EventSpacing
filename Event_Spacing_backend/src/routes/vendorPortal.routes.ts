import { Router } from "express";
import {
  getVendorProfile,
  updateVendorProfile,
  getVendorStats,
  getVendorVenues,
  createVendorVenue,
  updateVendorVenue,
  deleteVendorVenue,
  getVendorLeads,
  updateLeadStatus,
  getVendorCalendar,
  toggleCalendarSlot,
  getVendorPayouts,
} from "../controllers/vendorPortal.controller";
import { optionalAuth, protect } from "../middleware/auth.middleware";

const router = Router();

// Profile & Governance
router.get("/profile", optionalAuth, getVendorProfile);
router.put("/profile", optionalAuth, updateVendorProfile);

// Dashboard KPI Metrics
router.get("/stats", optionalAuth, getVendorStats);

// Venue Portfolio Management
router.get("/venues", optionalAuth, getVendorVenues);
router.post("/venues", optionalAuth, createVendorVenue);
router.put("/venues/:id", optionalAuth, updateVendorVenue);
router.delete("/venues/:id", optionalAuth, deleteVendorVenue);

// Leads & Inquiry CRM
router.get("/leads", optionalAuth, getVendorLeads);
router.patch("/leads/:id/status", optionalAuth, updateLeadStatus);

// Calendar & Slot Availability
router.get("/calendar", optionalAuth, getVendorCalendar);
router.post("/calendar/slot", optionalAuth, toggleCalendarSlot);

// Financial Payouts Ledger
router.get("/payouts", optionalAuth, getVendorPayouts);

export default router;

