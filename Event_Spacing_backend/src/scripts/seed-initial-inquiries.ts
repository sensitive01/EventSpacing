import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Inquiry } from "../models/Inquiry";
import { Venue } from "../models/Venue";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected.");

  const venues = await Venue.find({});
  const v1 = venues[0];
  const v2 = venues[1] || v1;

  const sampleInquiries = [
    {
      inquiryType: "corporate",
      name: "Siddharth Nambiar",
      companyName: "Google India Pvt Ltd",
      email: "snambiar@google.com",
      phone: "9845011223",
      eventType: "Annual Tech Developers Summit 2027",
      eventDate: "2027-01-20",
      guestCount: 350,
      budget: 850000,
      message: "Need high-speed WiFi, dual LED walls, and cocktail buffet setup. Requiring site inspection on Tuesday.",
      status: "new",
      notes: "Lead assigned to Corporate Concierge Team.",
    },
    {
      inquiryType: "corporate",
      name: "Radhika Kulkarni",
      companyName: "Deloitte Consulting",
      email: "rkulkarni@deloitte.com",
      phone: "9880123456",
      eventType: "Partner Leadership Gala Dinner",
      eventDate: "2026-12-18",
      guestCount: 200,
      budget: 550000,
      message: "Need luxury banqueting setup with private VIP lounge and acoustic stage.",
      status: "contacted",
      notes: "Called on 20th Nov. Sent brochure for Grand Pearl Palace. Scheduled call on Monday.",
    },
    {
      inquiryType: "concierge",
      name: "Amitabh & Shweta Singhania",
      email: "singhania.events@gmail.com",
      phone: "9790455667",
      eventType: "Luxury Destination Wedding & Sangeet",
      eventDate: "2027-02-14",
      guestCount: 500,
      budget: 2200000,
      message: "Looking for open-air lawn + indoor ballroom combo for 3-day wedding celebration with luxury bridal suites.",
      status: "visited",
      notes: "Visited Bk Hall on Saturday. Client loved the lawn, requested custom catering quote.",
    },
    {
      inquiryType: "venue",
      venueId: v1?._id,
      venueName: v1?.name || "Grand Banquet Hall",
      name: "Varun Chandrasekhar",
      email: "varun.cs@outlook.com",
      phone: "9534611111",
      eventType: "Silver Jubilee Anniversary Party",
      eventDate: "2026-12-28",
      guestCount: 150,
      budget: 280000,
      message: "Family gathering with live music and evening buffet. Need confirmation on outside decorator policy.",
      status: "in_discussion",
      notes: "Venue manager offered 10% discount on weekday package.",
    },
    {
      inquiryType: "concierge",
      name: "Meera Krishnan",
      email: "meera.k@gmail.com",
      phone: "9845099887",
      eventType: "1st Birthday & Naming Ceremony",
      eventDate: "2026-12-05",
      guestCount: 120,
      budget: 150000,
      message: "Theme decor: Little Prince / Stars. Need pure vegetarian traditional South Indian plantain leaf catering.",
      status: "booked",
      notes: "Booking confirmed! Advance deposit token paid via Direct UPI.",
    },
    {
      inquiryType: "vendor",
      name: "Deepak Choudhury",
      email: "deepak.c@yahoo.com",
      phone: "9945033445",
      eventType: "Wedding Catering Quote",
      eventDate: "2027-01-10",
      guestCount: 400,
      budget: 260000,
      message: "Need multi-cuisine buffet: North Indian, Chaat counter, and dessert spread.",
      status: "contacted",
      notes: "Shared menu tasting options with client.",
    },
  ];

  for (const inq of sampleInquiries) {
    const existing = await Inquiry.findOne({ phone: inq.phone, eventDate: inq.eventDate });
    if (!existing) {
      await Inquiry.create(inq);
      console.log(`Created inquiry for ${inq.name} (${inq.inquiryType})`);
    }
  }

  const total = await Inquiry.countDocuments();
  console.log(`Total inquiries in MongoDB: ${total}`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("Error seeding inquiries:", e);
  process.exit(1);
});
