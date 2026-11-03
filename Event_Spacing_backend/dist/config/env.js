"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || "5000", 10),
    mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event_spacing",
    jwtSecret: process.env.JWT_SECRET || "event_spacing_fallback_secret_key_2026",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    corsOrigins: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
        : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    nodeEnv: process.env.NODE_ENV || "development",
};
