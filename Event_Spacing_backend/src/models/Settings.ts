import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUpiSettings {
  upiId: string;
  payeeName: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
}

export interface IPlatformSettings extends Document {
  key: string;
  upiSettings: IUpiSettings;
  createdAt: Date;
  updatedAt: Date;
}

const UpiSettingsSchema = new Schema<IUpiSettings>({
  upiId: { type: String, default: "eventspacing@okhdfcbank", trim: true },
  payeeName: { type: String, default: "Event Spacing Venues Pvt Ltd", trim: true },
  bankName: { type: String, default: "HDFC Bank Ltd", trim: true },
  accountNumber: { type: String, default: "50200088192831", trim: true },
  ifscCode: { type: String, default: "HDFC0001234", trim: true },
  qrCodeUrl: { type: String, default: "" },
  isEnabled: { type: Boolean, default: true },
});

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: { type: String, required: true, unique: true, default: "platform_config" },
    upiSettings: {
      type: UpiSettingsSchema,
      default: () => ({
        upiId: "eventspacing@okhdfcbank",
        payeeName: "Event Spacing Venues Pvt Ltd",
        bankName: "HDFC Bank Ltd",
        accountNumber: "50200088192831",
        ifscCode: "HDFC0001234",
        isEnabled: true,
      }),
    },
  },
  { timestamps: true }
);

export const PlatformSettings: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema);

