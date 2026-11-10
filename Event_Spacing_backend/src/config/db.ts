import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn("[MongoDB] Primary connection failed, attempting local MongoDB fallback...");
    try {
      const fallbackUri = "mongodb://127.0.0.1:27017/event_spacing";
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[MongoDB] Connected to local fallback: ${conn.connection.host}/${conn.connection.name}`);
    } catch (fallbackError) {
      console.error("[MongoDB] Connection error:", error);
      process.exit(1);
    }
  }

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Runtime error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected from database");
  });
};

