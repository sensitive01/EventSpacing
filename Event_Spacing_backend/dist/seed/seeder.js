"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Venue_1 = require("../models/Venue");
const Booking_1 = require("../models/Booking");
const Inquiry_1 = require("../models/Inquiry");
const Vendor_1 = require("../models/Vendor");
const Category_1 = require("../models/Category");
const seedData_1 = require("./seedData");
const seed = async () => {
    try {
        await (0, db_1.connectDB)();
        console.log("[Seeder] Clearing old collections...");
        await Promise.all([
            User_1.User.deleteMany({}),
            Venue_1.Venue.deleteMany({}),
            Booking_1.Booking.deleteMany({}),
            Inquiry_1.Inquiry.deleteMany({}),
            Vendor_1.Vendor.deleteMany({}),
            Category_1.Category.deleteMany({}),
        ]);
        console.log("[Seeder] Old data purged.");
        // 1. Seed Demo Users
        console.log("[Seeder] Creating demo users...");
        const customer = await User_1.User.create({
            name: "Raghav Rao",
            email: "raghav.rao@gmail.com",
            phone: "+91 98450 12345",
            password: "Password@123",
            role: "organizer",
            companyName: "Rao Enterprises",
            isPhoneVerified: true,
            isEmailVerified: true,
        });
        await User_1.User.create({
            name: "System Admin",
            email: "admin@eventspacing.com",
            phone: "+91 98450 00000",
            password: "Admin@123",
            role: "admin",
            isPhoneVerified: true,
            isEmailVerified: true,
        });
        console.log(`[Seeder] Created demo customer (${customer.email}) and admin.`);
        // 2. Seed Taxonomies
        console.log("[Seeder] Seeding categories and venue types...");
        await Category_1.Category.insertMany(seedData_1.SEED_CATEGORIES);
        // 3. Seed Venues
        console.log("[Seeder] Seeding Bengaluru venues...");
        const createdVenues = await Venue_1.Venue.insertMany(seedData_1.SEED_VENUES);
        console.log(`[Seeder] Seeded ${createdVenues.length} venues.`);
        // 4. Seed Vendors
        console.log("[Seeder] Seeding marketplace vendors...");
        await Vendor_1.Vendor.insertMany(seedData_1.SEED_VENDORS);
        // 5. Seed Sample Customer Bookings for Raghav Rao
        console.log("[Seeder] Creating initial bookings for demo customer...");
        const royalGrandeur = createdVenues.find((v) => v.slug === "the-royal-grandeur") || createdVenues[0];
        const grandPalace = createdVenues.find((v) => v.slug === "grand-palace-banquet") || createdVenues[1];
        await Booking_1.Booking.create([
            {
                bookingRef: "ES-BLR-2026-8821",
                userId: customer._id,
                venueId: royalGrandeur._id,
                venueName: royalGrandeur.name,
                venueCoverImage: royalGrandeur.coverImage,
                locality: royalGrandeur.location.locality,
                city: royalGrandeur.location.city,
                selectedSpaceName: "Grand Imperial Ballroom",
                packageTitle: "FREE VENUE with Royal Catering Plan (350 Pax)",
                eventCategory: "Marriage / Wedding",
                eventDate: "November 18, 2026",
                timeSlot: "Full Day (8 AM - 11 PM)",
                guestCount: 350,
                totalAmount: 402500,
                advancePaid: 120750,
                balanceDue: 281750,
                securityDeposit: 35000,
                status: "confirmed",
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                cancellationPolicy: {
                    refundableUntilDate: "November 04, 2026 (14 days prior)",
                    refundPercentage: 85,
                    termsSummary: "85% refund of advance deposit if cancelled 14+ days prior. 50% refund between 7-14 days. Non-refundable under 7 days.",
                },
            },
            {
                bookingRef: "ES-BLR-2026-8711",
                userId: customer._id,
                venueId: grandPalace._id,
                venueName: grandPalace.name,
                venueCoverImage: grandPalace.coverImage,
                locality: grandPalace.location.locality,
                city: grandPalace.location.city,
                selectedSpaceName: "Crystal Banquet Hall",
                packageTitle: "All-Inclusive Birthday Fiesta Package (120 Pax)",
                eventCategory: "Birthday",
                eventDate: "December 05, 2026",
                timeSlot: "Evening Slot (4 PM - 11 PM)",
                guestCount: 120,
                totalAmount: 114000,
                advancePaid: 34200,
                balanceDue: 79800,
                securityDeposit: 20000,
                status: "confirmed",
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                cancellationPolicy: {
                    refundableUntilDate: "November 21, 2026 (14 days prior)",
                    refundPercentage: 85,
                    termsSummary: "85% refund of advance deposit if cancelled 14+ days prior. Non-refundable under 7 days.",
                },
            },
        ]);
        // 6. Seed Sample Initial Inquiries
        console.log("[Seeder] Creating sample inquiries...");
        await Inquiry_1.Inquiry.create([
            {
                inquiryType: "concierge",
                name: "Priya Sharma",
                email: "priya.sharma@outlook.com",
                phone: "+91 98860 11223",
                eventType: "Wedding Reception",
                eventDate: "December 12, 2026",
                guestCount: 450,
                budget: 500000,
                message: "Looking for an open-air lawn or grand ballroom near Indiranagar with in-house catering.",
                status: "new",
            },
            {
                inquiryType: "corporate",
                companyName: "Infosys Technologies",
                name: "Vikram Mehta",
                email: "vikram.mehta@infosys.com",
                phone: "+91 98451 99000",
                eventType: "Annual Leadership Conference",
                eventDate: "January 20, 2027",
                guestCount: 800,
                budget: 1500000,
                message: "Need plenary auditorium + 4 breakout rooms with 4K AV gear and executive dining.",
                status: "contacted",
            },
        ]);
        console.log("==================================================");
        console.log("✅ [Seeder] Database seeded successfully!");
        console.log("👉 Test Customer Credentials:");
        console.log("   Email: raghav.rao@gmail.com");
        console.log("   Password: Password@123");
        console.log("   Phone: +91 98450 12345");
        console.log("==================================================");
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
    catch (error) {
        console.error("[Seeder] Error seeding database:", error);
        process.exit(1);
    }
};
seed();
