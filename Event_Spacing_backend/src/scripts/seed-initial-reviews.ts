import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Review } from "../models/Review";
import { Venue } from "../models/Venue";
import { recalculateTargetRating } from "../controllers/review.controller";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected.");

  const venues = await Venue.find({});
  console.log(`Found ${venues.length} venues.`);

  const sampleReviews = [
    {
      userName: "Rohit & Megha Sharma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      eventType: "Wedding Reception",
      guestCount: 450,
      eventDate: "2026-10-24",
      comment: "Hosted our wedding reception here and could not be happier! The central air conditioning, pristine bridal rooms, and the seamless valet parking handled all 450 guests without any delay. Highly recommended!",
      ratingsBreakdown: { cleanliness: 5.0, staffService: 4.9, facilities: 5.0, valueForMoney: 4.8 },
      isVerifiedBooking: true,
      managerReply: {
        reply: "Thank you Rohit & Megha! It was an absolute honor hosting your wedding reception. Wishing you both a lifetime of happiness!",
        repliedAt: new Date("2026-10-25"),
        repliedBy: "General Manager",
      },
    },
    {
      userName: "Priya Sundaram (Infosys)",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      rating: 4.8,
      eventType: "Corporate Annual Summit",
      guestCount: 220,
      eventDate: "2026-10-18",
      comment: "Excellent technical setup with 100% generator backup and crystal clear acoustic system. The venue manager was extremely accommodating for our early morning dry run.",
      ratingsBreakdown: { cleanliness: 4.8, staffService: 4.9, facilities: 4.8, valueForMoney: 4.7 },
      isVerifiedBooking: true,
      managerReply: {
        reply: "Thank you Priya! It was an absolute pleasure hosting the Infosys annual summit at our property. Looking forward to your next corporate event!",
        repliedAt: new Date("2026-10-21"),
        repliedBy: "Operations Team",
      },
    },
    {
      userName: "Dr. Anand Varma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      rating: 4.5,
      eventType: "Silver Jubilee Anniversary",
      guestCount: 180,
      eventDate: "2026-10-05",
      comment: "Spacious dining area and beautiful lighting decor. The outside catering team was accommodated seamlessly in the kitchen. Very memorable celebration for our family.",
      ratingsBreakdown: { cleanliness: 4.5, staffService: 4.6, facilities: 4.7, valueForMoney: 4.4 },
      isVerifiedBooking: true,
    },
  ];

  for (const v of venues) {
    const existing = await Review.countDocuments({ targetType: "venue", targetId: v._id });
    if (existing === 0) {
      console.log(`Seeding reviews for venue: ${v.name}`);
      for (const rev of sampleReviews) {
        await Review.create({
          targetType: "venue",
          targetId: v._id,
          targetName: v.name,
          vendorId: v.vendorId,
          ...rev,
          status: "published",
        });
      }
      await recalculateTargetRating("venue", v._id);
    }
  }

  const totalReviews = await Review.countDocuments();
  console.log(`Total reviews in MongoDB: ${totalReviews}`);

  await mongoose.disconnect();
  console.log("Seeding complete.");
}

run().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
