import mongoose, { Document, Schema, Model } from "mongoose";

export interface IManagerReply {
  reply: string;
  repliedAt: Date;
  repliedBy?: string;
}

export interface IReviewRatingsBreakdown {
  cleanliness?: number;
  staffService?: number;
  facilities?: number;
  valueForMoney?: number;
}

export interface IReview extends Document {
  bookingId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  avatar?: string;
  targetType: "venue" | "service";
  targetId: mongoose.Types.ObjectId;
  targetName: string;
  vendorId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  ratingsBreakdown?: IReviewRatingsBreakdown;
  eventType?: string;
  guestCount?: number;
  eventDate?: string;
  comment: string;
  photos?: string[];
  isVerifiedBooking: boolean;
  managerReply?: IManagerReply;
  status: "published" | "pending_moderation" | "flagged" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

const ManagerReplySchema = new Schema<IManagerReply>(
  {
    reply: { type: String, required: true, trim: true },
    repliedAt: { type: Date, default: Date.now },
    repliedBy: { type: String, trim: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: false,
    },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, trim: true, lowercase: true },
    userPhone: { type: String, trim: true },
    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    targetType: {
      type: String,
      enum: ["venue", "service"],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetName: { type: String, required: true, trim: true },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: false,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    ratingsBreakdown: {
      cleanliness: { type: Number, default: 5.0 },
      staffService: { type: Number, default: 4.9 },
      facilities: { type: Number, default: 4.8 },
      valueForMoney: { type: Number, default: 4.8 },
    },
    eventType: { type: String, trim: true },
    guestCount: { type: Number },
    eventDate: { type: String },
    comment: { type: String, required: true, trim: true },
    photos: [{ type: String }],
    isVerifiedBooking: { type: Boolean, default: false },
    managerReply: { type: ManagerReplySchema, required: false },
    status: {
      type: String,
      enum: ["published", "pending_moderation", "flagged", "hidden"],
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

ReviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
ReviewSchema.index({ vendorId: 1, status: 1 });
ReviewSchema.index({ createdAt: -1 });

export const Review: Model<IReview> = mongoose.model<IReview>(
  "Review",
  ReviewSchema,
  "reviews"
);
