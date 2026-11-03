"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCorporateInquiry = exports.submitConciergeInquiry = void 0;
const Inquiry_1 = require("../models/Inquiry");
const submitConciergeInquiry = async (req, res, next) => {
    try {
        const { name, email, phone, eventType, eventDate, guestCount, budget, message } = req.body;
        const inquiry = await Inquiry_1.Inquiry.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.submitConciergeInquiry = submitConciergeInquiry;
const submitCorporateInquiry = async (req, res, next) => {
    try {
        const { name, email, phone, companyName, eventType, eventDate, guestCount, budget, message } = req.body;
        const inquiry = await Inquiry_1.Inquiry.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.submitCorporateInquiry = submitCorporateInquiry;
