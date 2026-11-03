import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  type: "event_category" | "venue_type" | "vendor_category";
  name: string;
  slug: string;
  iconName?: string;
  imageUrl?: string;
  description?: string;
  count?: number;
  order: number;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    type: {
      type: String,
      enum: ["event_category", "venue_type", "vendor_category"],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    iconName: { type: String },
    imageUrl: { type: String },
    description: { type: String },
    count: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ type: 1, slug: 1 }, { unique: true });

export const Category: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);

