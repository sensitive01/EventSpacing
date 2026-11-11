import { Request, Response, NextFunction } from "express";
import { PlatformSettings } from "../models/Settings";

// Default settings fallback
const DEFAULT_UPI_SETTINGS = {
  upiId: "eventspacing@okhdfcbank",
  payeeName: "Event Spacing Venues Pvt Ltd",
  bankName: "HDFC Bank Ltd",
  accountNumber: "50200088192831",
  ifscCode: "HDFC0001234",
  qrCodeUrl: "",
  isEnabled: true,
};

export const getUpiSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await PlatformSettings.findOne({ key: "platform_config" });
    if (!settings) {
      settings = await PlatformSettings.create({
        key: "platform_config",
        upiSettings: DEFAULT_UPI_SETTINGS,
      });
    }

    res.status(200).json({
      success: true,
      data: settings.upiSettings || DEFAULT_UPI_SETTINGS,
    });
  } catch (error) {
    console.error("Error fetching UPI settings:", error);
    // Return resilient fallback
    res.status(200).json({
      success: true,
      data: DEFAULT_UPI_SETTINGS,
    });
  }
};

export const updateUpiSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { upiId, payeeName, bankName, accountNumber, ifscCode, qrCodeUrl, isEnabled } = req.body;

    const updated = await PlatformSettings.findOneAndUpdate(
      { key: "platform_config" },
      {
        $set: {
          "upiSettings.upiId": upiId || DEFAULT_UPI_SETTINGS.upiId,
          "upiSettings.payeeName": payeeName || DEFAULT_UPI_SETTINGS.payeeName,
          "upiSettings.bankName": bankName ?? DEFAULT_UPI_SETTINGS.bankName,
          "upiSettings.accountNumber": accountNumber ?? DEFAULT_UPI_SETTINGS.accountNumber,
          "upiSettings.ifscCode": ifscCode ?? DEFAULT_UPI_SETTINGS.ifscCode,
          "upiSettings.qrCodeUrl": qrCodeUrl ?? "",
          "upiSettings.isEnabled": isEnabled !== undefined ? isEnabled : true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "UPI Settings updated successfully.",
      data: updated.upiSettings,
    });
  } catch (error) {
    next(error);
  }
};

