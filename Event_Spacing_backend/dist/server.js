"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    try {
        // Connect Database
        await (0, db_1.connectDB)();
        const app = (0, app_1.createApp)();
        const server = app.listen(env_1.config.port, () => {
            console.log(`===============================================`);
            console.log(`🚀 Event Spacing Backend is running!`);
            console.log(`📡 URL: http://localhost:${env_1.config.port}`);
            console.log(`🩺 Health: http://localhost:${env_1.config.port}/api/health`);
            console.log(`🌍 Environment: ${env_1.config.nodeEnv}`);
            console.log(`===============================================`);
        });
        const shutdown = (signal) => {
            console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
            server.close(() => {
                console.log("[Server] HTTP server closed.");
                process.exit(0);
            });
        };
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    }
    catch (error) {
        console.error("[Server] Failed to start:", error);
        process.exit(1);
    }
};
startServer();
