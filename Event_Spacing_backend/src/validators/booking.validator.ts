import { z } from "zod";

export const timeSlotEnum = z.enum([
  "Full Day (8 AM - 11 PM)",
  "Morning Slot (8 AM - 3 PM)",
  "Evening Slot (4 PM - 11 PM)",
]);

export const bookingItemSchema = z
  .object({
    bookingType: z.enum(["venue", "service"]).optional(),
    venueId: z.string().optional(),
    vendorServiceId: z.string().optional(),
    selectedSpaceName: z.string().optional(),
    packageTitle: z.string().min(1, "Package title is required"),
    eventCategory: z.string().min(1, "Event category is required"),
    eventDate: z.string().min(1, "Event date is required"),
    timeSlot: timeSlotEnum,
    guestCount: z.number().int().positive("Guest count must be positive"),
  })
  .refine((data) => Boolean(data.venueId || data.vendorServiceId), {
    message: "Either Venue ID or Marketplace Service ID is required",
    path: ["venueId"],
  });

const customerPaymentFieldsSchema = z.object({
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

export const createBookingSchema = bookingItemSchema.and(customerPaymentFieldsSchema);

export const checkoutCartSchema = customerPaymentFieldsSchema.extend({
  items: z.array(bookingItemSchema).min(1, "At least one booking item is required in cart"),
});
