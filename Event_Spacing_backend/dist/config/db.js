"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.config.mongodbUri);
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    }
    catch (error) {
        console.error("[MongoDB] Connection error:", error);
        process.exit(1);
    }
    mongoose_1.default.connection.on("error", (err) => {
        console.error("[MongoDB] Runtime error:", err);
    });
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("[MongoDB] Disconnected from database");
    });
};
exports.connectDB = connectDB;
