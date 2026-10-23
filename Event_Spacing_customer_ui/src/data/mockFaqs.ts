/**
 * @file mockFaqs.ts
 * @description Frequently asked questions and answers for Event Spacing marketplace.
 */

import { FaqItem } from "@/types/venue";

/**
 * Frequently asked questions matching the homepage accordion in Screen 1.
 */
export const MOCK_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How do I book a venue?",
    answer: "You can search for venues by event type, location, date, and guest count. Once you find a suitable venue, you can either request a direct enquiry or initiate an instant booking with an advance deposit through our secure payment gateway.",
  },
  {
    id: "faq-2",
    question: "Can I visit the venue before booking?",
    answer: "Yes, absolutely! You can schedule a free in-person site visit through the venue details page or request our relationship manager to coordinate a guided walkthrough with the venue manager.",
  },
  {
    id: "faq-3",
    question: "Are vendors verified?",
    answer: "Every venue and vendor listed on Event Spacing undergoes a strict multi-point verification process including physical site audits, business registration checks, and fire safety compliance verification.",
  },
  {
    id: "faq-4",
    question: "What is the cancellation policy?",
    answer: "Cancellation terms are transparently specified on each venue's profile. Generally, cancellations made 30+ days prior to the event date receive an 80% to 100% refund of the advance deposit, depending on the venue policy.",
  },
  {
    id: "faq-5",
    question: "Do you provide event management services?",
    answer: "Yes! Along with venue bookings, we connect you with trusted empanelled partners for end-to-end event planning, stage decor, catering, professional sound/light engineering, and photography.",
  },
  {
    id: "faq-6",
    question: "How do payments work?",
    answer: "We support all major payment modes including UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, Net Banking, and Razorpay. A partial advance locks your date, with the balance payable upon check-in.",
  },
];
