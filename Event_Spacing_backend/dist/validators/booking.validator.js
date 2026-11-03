"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    venueId: zod_1.z.string().min(1, "Venue ID is required"),
    selectedSpaceName: zod_1.z.string().optional(),
    packageTitle: zod_1.z.string().min(1, "Package title is required"),
    eventCategory: zod_1.z.string().min(1, "Event category is required"),
    eventDate: zod_1.z.string().min(1, "Event date is required"),
    timeSlot: zod_1.z.enum([
        "Full Day (8 AM - 11 PM)",
        "Morning Slot (8 AM - 3 PM)",
        "Evening Slot (4 PM - 11 PM)",
    ]),
    guestCount: zod_1.z.number().int().positive("Guest count must be positive"),
    customerName: zod_1.z.string().min(2, "Customer name is required"),
    customerPhone: zod_1.z.string().min(10, "Valid phone number required"),
    customerEmail: zod_1.z.string().email("Valid email required"),
    specialRequests: zod_1.z.string().optional(),
});
