import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Venue } from "../models/Venue";
import { Booking } from "../models/Booking";
import { Inquiry } from "../models/Inquiry";
import { Vendor } from "../models/Vendor";

export const purgeData = async () => {
  try {
    await connectDB();

    console.log("[Data Purge] Starting database cleanup...");

    // 1. Delete all demo venues
    const deletedVenues = await Venue.deleteMany({});
    console.log(`[Data Purge] Deleted ${deletedVenues.deletedCount} venues.`);

    // 2. Delete all demo inquiries
    const deletedInquiries = await Inquiry.deleteMany({});
    console.log(`[Data Purge] Deleted ${deletedInquiries.deletedCount} inquiries.`);

    // 3. Delete all demo customer bookings
    const deletedBookings = await Booking.deleteMany({});
    console.log(`[Data Purge] Deleted ${deletedBookings.deletedCount} bookings.`);

    // 4. Delete all demo marketplace vendors
    const deletedVendors = await Vendor.deleteMany({});
    console.log(`[Data Purge] Deleted ${deletedVendors.deletedCount} vendors.`);

    // 5. Delete demo users (keep admin)
    const deletedUsers = await User.deleteMany({
      email: { $ne: "admin@eventspacing.com" },
    });
    console.log(`[Data Purge] Deleted ${deletedUsers.deletedCount} demo user accounts.`);

    // 6. Ensure System Admin account exists
    let admin = await User.findOne({ email: "admin@eventspacing.com" });
    if (!admin) {
      admin = await User.create({
        name: "System Admin",
        email: "admin@eventspacing.com",
        phone: "+91 98450 00000",
        password: "Admin@123",
        role: "admin",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      console.log("[Data Purge] Created System Admin (admin@eventspacing.com / Admin@123)");
    } else {
      console.log("[Data Purge] Preserved System Admin account (admin@eventspacing.com)");
    }

    console.log("\n✅ [Data Purge] Database is now completely clean and ready for real vendor & customer operations!");
    process.exit(0);
  } catch (error) {
    console.error("❌ [Data Purge] Error during purge:", error);
    process.exit(1);
  }
};

purgeData();

