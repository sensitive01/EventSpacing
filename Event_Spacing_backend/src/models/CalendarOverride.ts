import mongoose, { Document, Schema } from "mongoose";

export interface ICalendarOverride extends Document {
  venueId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: "available" | "blocked" | "booked";
  notes?: string;
  priceModifier?: number;
  bookedBy?: string;
  bookingRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarOverrideSchema = new Schema<ICalendarOverride>(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "blocked", "booked"],
      default: "available",
    },
    notes: {
      type: String,
      trim: true,
    },
    priceModifier: {
      type: Number,
    },
    bookedBy: {
      type: String,
      trim: true,
    },
    bookingRef: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "calendar_overrides",
  }
);

CalendarOverrideSchema.index({ venueId: 1, date: 1 }, { unique: true });

export const CalendarOverride =
  mongoose.models.CalendarOverride ||
  mongoose.model<ICalendarOverride>("CalendarOverride", CalendarOverrideSchema);
