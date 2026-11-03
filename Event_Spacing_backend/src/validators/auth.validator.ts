import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["organizer", "vendor"]).default("organizer"),
  companyName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  password: z.string().min(1, "Password is required"),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  name: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  companyName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});


