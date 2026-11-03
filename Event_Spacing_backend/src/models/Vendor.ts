import mongoose, { Document, Schema, Model } from "mongoose";

export interface IVendor extends Document {
  businessName: string;
  ownerName: string;
  category: string;
  city: string;
  locality: string;
  startingPrice: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  portfolioImages: string[];
  description: string;
  isVerified: boolean;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    city: { type: String, required: true, default: "Bengaluru" },
    locality: { type: String, required: true, index: true },
    startingPrice: { type: Number, required: true },
    priceUnit: { type: String, default: "per day" },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    portfolioImages: [{ type: String }],
    description: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
  },
  {
    timestamps: true,
  }
);

VendorSchema.index({ category: 1, city: 1, locality: 1 });
VendorSchema.index({
  businessName: "text",
  category: "text",
  locality: "text",
  description: "text",
});

export const Vendor: Model<IVendor> = mongoose.model<IVendor>("Vendor", VendorSchema);

