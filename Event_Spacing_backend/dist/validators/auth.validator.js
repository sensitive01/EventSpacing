"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.verifyOtpSchema = exports.sendOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address").optional(),
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits").optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["organizer", "vendor"]).default("organizer"),
    companyName: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.sendOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits"),
});
exports.verifyOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits"),
    otp: zod_1.z.string().length(6, "OTP must be exactly 6 digits"),
    name: zod_1.z.string().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
    email: zod_1.z.string().email("Invalid email address").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 digits").optional().or(zod_1.z.literal("")),
    companyName: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
