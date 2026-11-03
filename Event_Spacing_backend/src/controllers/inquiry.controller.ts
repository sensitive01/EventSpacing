import { Request, Response, NextFunction } from "express";
import { Inquiry } from "../models/Inquiry";

export const submitConciergeInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, eventType, eventDate, guestCount, budget, message } = req.body;

    const inquiry = await Inquiry.create({
      inquiryType: "concierge",
      name,
      email,
      phone,
      eventType: eventType || "Custom Event",
      eventDate,
      guestCount,
      budget,
      message,
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your event inquiry has been received. Our concierge team will reach out within 2 hours.",
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const submitCorporateInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, companyName, eventType, eventDate, guestCount, budget, message } = req.body;

    const inquiry = await Inquiry.create({
      inquiryType: "corporate",
      name,
      email,
      phone,
      companyName,
      eventType: eventType || "Corporate Conference",
      eventDate,
      guestCount,
      budget,
      message,
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Corporate proposal request submitted successfully. An enterprise event consultant will connect with you.",
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

