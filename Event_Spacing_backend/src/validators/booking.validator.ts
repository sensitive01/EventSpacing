import { z } from "zod";

export const createBookingSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
  selectedSpaceName: z.string().optional(),
  packageTitle: z.string().min(1, "Package title is required"),
  eventCategory: z.string().min(1, "Event category is required"),
  eventDate: z.string().min(1, "Event date is required"),
  timeSlot: z.enum([
    "Full Day (8 AM - 11 PM)",
    "Morning Slot (8 AM - 3 PM)",
    "Evening Slot (4 PM - 11 PM)",
  ]),
  guestCount: z.number().int().positive("Guest count must be positive"),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required"),
  specialRequests: z.string().optional(),
  transactionId: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentGateway: z.enum(["razorpay", "direct_upi"]).optional(),
  utrNumber: z.string().optional(),
  paymentProofUrl: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

