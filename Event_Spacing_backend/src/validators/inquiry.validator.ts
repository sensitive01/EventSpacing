import { z } from "zod";

export const conciergeInquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.union([z.number(), z.string()]).optional(),
  budget: z.number().optional(),
  message: z.string().optional(),
});

export const venueInquirySchema = conciergeInquirySchema.extend({
  venueId: z.string().optional(),
});

export const corporateInquirySchema = conciergeInquirySchema.extend({
  companyName: z.string().min(2, "Company name is required"),
});

