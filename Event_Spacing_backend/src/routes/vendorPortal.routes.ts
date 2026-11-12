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
  getVendorServices,
  createVendorService,
  updateVendorService,
  deleteVendorService,
  getVendorReviews,
  replyVendorReview,
  getVendorBookings,
  createVendorBooking,
  updateVendorBookingStatus,
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

// Marketplace Services Management (Option 1: Unified Hub)
router.get("/services", optionalAuth, getVendorServices);
router.post("/services", optionalAuth, createVendorService);
router.put("/services/:id", optionalAuth, updateVendorService);
router.delete("/services/:id", optionalAuth, deleteVendorService);

// Customer Reviews & Feedback
router.get("/reviews", optionalAuth, getVendorReviews);
router.post("/reviews/:id/reply", optionalAuth, replyVendorReview);

// Booking Management
router.get("/bookings", optionalAuth, getVendorBookings);
router.post("/bookings", optionalAuth, createVendorBooking);
router.patch("/bookings/:id/status", optionalAuth, updateVendorBookingStatus);

export default router;

