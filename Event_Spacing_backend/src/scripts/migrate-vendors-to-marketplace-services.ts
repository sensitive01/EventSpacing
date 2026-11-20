import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment.");
  }

  console.log("Connecting to MongoDB Atlas...");
  const conn = await mongoose.connect(uri);
  const db = conn.connection.db!;
  console.log("Connected successfully.");

  // 1. Check existing documents in 'vendors'
  const vendorsCol = db.collection("vendors");
  const sourceDocs = await vendorsCol.find({}).toArray();
  console.log(`Found ${sourceDocs.length} documents in 'vendors' collection.`);

  // 2. Ensure target collection 'marketplace_services'
  const targetCol = db.collection("marketplace_services");

  if (sourceDocs.length > 0) {
    for (const doc of sourceDocs) {
      await targetCol.updateOne(
        { _id: doc._id },
        { $set: doc },
        { upsert: true }
      );
    }
    console.log(`Upserted ${sourceDocs.length} documents into 'marketplace_services'.`);
  }

  // 3. Ensure indexes on 'marketplace_services'
  await targetCol.createIndex({ category: 1, city: 1, locality: 1 });
  await targetCol.createIndex({
    businessName: "text",
    category: "text",
    locality: "text",
    description: "text",
  });
  console.log("Created compound & text indexes on 'marketplace_services'.");

  // 4. Verify target count
  const targetCount = await targetCol.countDocuments();
  console.log(`Verification: 'marketplace_services' has ${targetCount} documents.`);

  await mongoose.disconnect();
  console.log("Migration finished successfully.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
