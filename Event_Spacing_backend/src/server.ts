import { createApp } from "./app";
import { connectDB } from "./config/db";
import { config } from "./config/env";

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`🚀 Event Spacing Backend is running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`===============================================`);
    });

    const shutdown = (signal: string) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("[Server] HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
};

startServer();

