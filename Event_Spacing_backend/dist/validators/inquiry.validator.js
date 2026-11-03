"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corporateInquirySchema = exports.venueInquirySchema = exports.conciergeInquirySchema = void 0;
const zod_1 = require("zod");
exports.conciergeInquirySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Valid email required"),
    phone: zod_1.z.string().min(10, "Valid phone number required"),
    eventType: zod_1.z.string().optional(),
    eventDate: zod_1.z.string().optional(),
    guestCount: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    budget: zod_1.z.number().optional(),
    message: zod_1.z.string().optional(),
});
exports.venueInquirySchema = exports.conciergeInquirySchema.extend({
    venueId: zod_1.z.string().optional(),
});
exports.corporateInquirySchema = exports.conciergeInquirySchema.extend({
    companyName: zod_1.z.string().min(2, "Company name is required"),
});
