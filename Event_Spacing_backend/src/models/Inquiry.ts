import mongoose, { Document, Schema, Model } from "mongoose";

export interface IInquiry extends Document {
  inquiryType: "concierge" | "venue" | "corporate" | "vendor";
  name: string;
  email: string;
  phone: string;
  eventType?: string;
  eventDate?: string;
  guestCount?: number | string;
  budget?: number;
  message?: string;
  venueId?: mongoose.Types.ObjectId;
  venueName?: string;
  vendorId?: mongoose.Types.ObjectId;
  vendorName?: string;
  companyName?: string;
  status:
    | "new"
    | "contacted"
    | "visited"
    | "booked"
    | "declined"
    | "in_discussion"
    | "converted"
    | "closed";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    inquiryType: {
      type: String,
      enum: ["concierge", "venue", "corporate", "vendor"],
      default: "concierge",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    eventType: { type: String },
    eventDate: { type: String },
    guestCount: { type: Schema.Types.Mixed },
    budget: { type: Number },
    message: { type: String },
    venueId: { type: Schema.Types.ObjectId, ref: "Venue" },
    venueName: { type: String },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
    companyName: { type: String },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "visited",
        "booked",
        "declined",
        "in_discussion",
        "converted",
        "closed",
      ],
      default: "new",
      index: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Inquiry: Model<IInquiry> = mongoose.model<IInquiry>("Inquiry", InquirySchema);

