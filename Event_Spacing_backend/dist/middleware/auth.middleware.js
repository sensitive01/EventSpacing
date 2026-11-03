"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access denied. Authentication token required.",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User session expired or user no longer exists.",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.protect = protect;
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.id);
        if (user) {
            req.user = user;
        }
        next();
    }
    catch {
        // Silently continue for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
