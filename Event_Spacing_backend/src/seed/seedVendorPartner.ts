import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Venue } from "../models/Venue";
import { Inquiry } from "../models/Inquiry";

export const ensureVendorPartner = async () => {
  try {
    await connectDB();

    console.log("[Vendor Seed] Checking vendor partner user...");
    let partner = await User.findOne({ email: "partner@prestigevenues.com" });

    if (!partner) {
      partner = await User.create({
        name: "Vikramaditya Rao",
        email: "partner@prestigevenues.com",
        phone: "9845012345",
        password: "PrestigePartner2026!",
        role: "vendor",
        businessName: "Prestige Hospitality & Banquets",
        companyName: "Prestige Hospitality & Banquets",
        gstNumber: "29AABCP1234F1Z8",
        
        panNumber: "AABCP1234F",
        bankDetails: {
          accountNumber: "91802003456789",
          ifscCode: "HDFC0000123",
          accountHolder: "Prestige Hospitality LLP",
          bankName: "HDFC Bank, Indiranagar",
        },
        kycStatus: "verified",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      console.log("[Vendor Seed] Created vendor partner user:", partner.email);
    } else {
      partner.role = "vendor";
      partner.businessName = "Prestige Hospitality & Banquets";
      partner.companyName = "Prestige Hospitality & Banquets";
      partner.password = "PrestigePartner2026!";
      partner.phone = "9845012345";
      await partner.save();
      console.log("[Vendor Seed] Updated existing vendor partner user:", partner.email);
    }

    // Link existing venues to this vendor if they match or have no vendorId
    const venues = await Venue.find({});
    for (let i = 0; i < venues.length; i++) {
      const v = venues[i];
      if (!v.vendorId) {
        v.vendorId = partner._id as any;
        v.status = "live";
        await v.save();
        console.log(`[Vendor Seed] Linked venue "${v.name}" to vendor ${partner.name}`);
      }
    }

    // Ensure venue-specific customer inquiries exist for partner venues
    const venueInquiryCount = await Inquiry.countDocuments({ inquiryType: "venue" });
    if (venueInquiryCount === 0 && venues.length > 0) {
      await Inquiry.create([
        {
          inquiryType: "venue",
          venueId: venues[0]._id,
          venueName: venues[0].name,
          name: "Aishwarya Shenoy",
          phone: "+91 97412 88910",
          email: "aishwarya.s@gmail.com",
          eventType: "Wedding & Reception",
          eventDate: "2026-11-18",
          guestCount: 650,
          budget: 350000,
          message: "Requires Jain catering options and dedicated entrance arch for baraat.",
          status: "new",
        },
        {
          inquiryType: "venue",
          venueId: venues[0]._id,
          venueName: venues[0].name,
          name: "Karthik Subramaniam",
          phone: "+91 99001 23488",
          email: "karthik.subra@infosys.com",
          eventType: "Annual Corporate Gala",
          eventDate: "2026-12-05",
          guestCount: 450,
          budget: 275000,
          message: "Projector stage with dual confidence monitors and live webcast support.",
          status: "contacted",
        },
        {
          inquiryType: "venue",
          venueId: venues.length > 1 ? venues[1]._id : venues[0]._id,
          venueName: venues.length > 1 ? venues[1].name : venues[0].name,
          name: "Dr. Rohini Menon",
          phone: "+91 98860 55123",
          email: "rohini.menon@apollo.org",
          eventType: "Engagement & Cocktail Party",
          eventDate: "2026-11-28",
          guestCount: 220,
          budget: 180000,
          message: "Fairy light canopies across the entire lawn and live acoustic band stage.",
          status: "visited",
        },
        {
          inquiryType: "venue",
          venueId: venues[0]._id,
          venueName: venues[0].name,
          name: "Anand & Divya Hegde",
          phone: "+91 98451 90212",
          email: "anand.hegde@techcorp.in",
          eventType: "Grand Wedding",
          eventDate: "2026-11-10",
          guestCount: 850,
          budget: 520000,
          message: "2-day booking including Sangeet evening and morning Muhurtham.",
          status: "booked",
        },
      ]);
      console.log("[Vendor Seed] Created 4 venue leads for partner.");
    }

    console.log("[Vendor Seed] Completed successfully.");
  } catch (err) {
    console.error("[Vendor Seed] Error:", err);
  }
};

if (require.main === module) {
  ensureVendorPartner().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
