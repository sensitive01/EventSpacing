import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/User";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/event_spacing";
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected.");

  const result = await User.updateMany(
    { role: "organizer" },
    { $set: { role: "customer" } }
  );

  console.log(`Updated ${result.modifiedCount} users from 'organizer' to 'customer'.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
