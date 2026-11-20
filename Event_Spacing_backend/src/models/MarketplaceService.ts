import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMarketplaceService extends Document {
  vendorId?: mongoose.Types.ObjectId;
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

const MarketplaceServiceSchema = new Schema<IMarketplaceService>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
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
    collection: "marketplace_services",
  }
);

MarketplaceServiceSchema.index({ category: 1, city: 1, locality: 1 });
MarketplaceServiceSchema.index({
  businessName: "text",
  category: "text",
  locality: "text",
  description: "text",
});

export const MarketplaceService: Model<IMarketplaceService> =
  mongoose.model<IMarketplaceService>(
    "MarketplaceService",
    MarketplaceServiceSchema,
    "marketplace_services"
  );
