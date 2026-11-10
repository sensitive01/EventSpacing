import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";

export const createApp = (): Application => {
  const app: Application = express();

  // Security Middleware
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps or curl) or if origin is in allowed list
        if (!origin || config.corsOrigins.includes(origin) || config.corsOrigins.includes("*")) {
          return callback(null, true);
        }
        callback(null, true); // Dev-friendly permissive CORS
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-vendor-id",
        "x-vendor-phone",
        "x-vendor-email",
        "x-vendor-name",
        "X-Vendor-Id",
        "X-Vendor-Phone",
        "X-Vendor-Email",
        "X-Vendor-Name",
      ],
    })
  );

  // Request Logging
  if (config.nodeEnv !== "test") {
    app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
  }

  // Body Parsing Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Healthcheck Route
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Event Spacing Backend API",
      uptime: process.uptime(),
    });
  });

  // Mount API Routes
  app.use("/api", apiRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};

