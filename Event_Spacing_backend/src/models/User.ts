import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: "organizer" | "vendor" | "admin";
  companyName?: string;
  businessName?: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolder?: string;
    bankName?: string;
  };
  kycStatus?: "verified" | "pending" | "rejected";
  avatarUrl?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedAt?: Date | null;
  otpCode?: string;
  otpExpiresAt?: Date;
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId | null;
  referralCredits: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["organizer", "vendor", "admin"],
      default: "organizer",
    },
    companyName: {
      type: String,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    bankDetails: {
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },
    kycStatus: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      default: "verified",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    blockedReason: {
      type: String,
      trim: true,
      default: "",
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralCredits: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      name: this.name,
      email: this.email,
      phone: this.phone,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions
  );
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

