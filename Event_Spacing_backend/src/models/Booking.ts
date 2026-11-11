import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICancellationPolicy {
  refundableUntilDate: string;
  refundPercentage: number;
  termsSummary: string;
}

export interface IBooking extends Document {
  bookingRef: string;
  userId?: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  venueName: string;
  venueCoverImage: string;
  locality: string;
  city: string;
  selectedSpaceName?: string;
  packageTitle: string;
  eventCategory: string;
  eventDate: string;
  timeSlot: "Full Day (8 AM - 11 PM)" | "Morning Slot (8 AM - 3 PM)" | "Evening Slot (4 PM - 11 PM)";
  guestCount: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  securityDeposit: number;
  status: "pending" | "pending_approval" | "confirmed" | "completed" | "cancelled" | "rejected" | "refunded";
  cancellationPolicy: ICancellationPolicy;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  specialRequests?: string;
  paymentGateway?: "razorpay" | "direct_upi";
  utrNumber?: string;
  paymentProofUrl?: string;
  paymentStatus?: "verification_pending" | "paid" | "failed";
  adminApprovalNotes?: string;
  approvedAt?: Date;
  approvedBy?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentDetails?: {
    transactionId?: string;
    paymentMethod?: string;
    paidAt?: Date;
    invoiceNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CancellationPolicySchema = new Schema<ICancellationPolicy>({
  refundableUntilDate: { type: String, required: true },
  refundPercentage: { type: Number, required: true, default: 85 },
  termsSummary: { type: String, required: true },
});

const BookingSchema = new Schema<IBooking>(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    venueId: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
      index: true,
    },
    venueName: { type: String, required: true },
    venueCoverImage: { type: String, required: true },
    locality: { type: String, required: true },
    city: { type: String, required: true, default: "Bengaluru" },
    selectedSpaceName: { type: String },
    packageTitle: { type: String, required: true },
    eventCategory: { type: String, required: true },
    eventDate: { type: String, required: true },
    timeSlot: {
      type: String,
      enum: [
        "Full Day (8 AM - 11 PM)",
        "Morning Slot (8 AM - 3 PM)",
        "Evening Slot (4 PM - 11 PM)",
      ],
      default: "Full Day (8 AM - 11 PM)",
    },
    guestCount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    advancePaid: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    securityDeposit: { type: Number, default: 25000 },
    status: {
      type: String,
      enum: ["pending", "pending_approval", "confirmed", "completed", "cancelled", "rejected", "refunded"],
      default: "confirmed",
    },
    cancellationPolicy: {
      type: CancellationPolicySchema,
      default: () => ({
        refundableUntilDate: "14 days prior to event",
        refundPercentage: 85,
        termsSummary:
          "85% refund of advance deposit if cancelled 14+ days prior. 50% refund between 7-14 days. Non-refundable under 7 days.",
      }),
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    specialRequests: { type: String },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "direct_upi"],
      default: "direct_upi",
    },
    utrNumber: { type: String, trim: true },
    paymentProofUrl: { type: String },
    paymentStatus: {
      type: String,
      enum: ["verification_pending", "paid", "failed"],
      default: "paid",
    },
    adminApprovalNotes: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentDetails: {
      transactionId: { type: String },
      paymentMethod: { type: String, default: "UPI" },
      paidAt: { type: Date, default: Date.now },
      invoiceNumber: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ customerEmail: 1, customerPhone: 1 });
BookingSchema.index({ status: 1 });

export const Booking: Model<IBooking> = mongoose.model<IBooking>("Booking", BookingSchema);

