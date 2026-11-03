"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security Middleware
    app.use((0, helmet_1.default)());
    // CORS Configuration
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps or curl) or if origin is in allowed list
            if (!origin || env_1.config.corsOrigins.includes(origin) || env_1.config.corsOrigins.includes("*")) {
                return callback(null, true);
            }
            callback(null, true); // Dev-friendly permissive CORS
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
    // Request Logging
    if (env_1.config.nodeEnv !== "test") {
        app.use((0, morgan_1.default)(env_1.config.nodeEnv === "development" ? "dev" : "combined"));
    }
    // Body Parsing Middleware
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    // Healthcheck Route
    app.get("/api/health", (req, res) => {
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "Event Spacing Backend API",
            uptime: process.uptime(),
        });
    });
    // Mount API Routes
    app.use("/api", routes_1.default);
    // 404 Handler
    app.use(errorHandler_middleware_1.notFoundHandler);
    // Central Error Handler
    app.use(errorHandler_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
