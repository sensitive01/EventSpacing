"use client";

/**
 * @file LeadContact.tsx
 * @description Contact and lead inquiry section with direct contact cards and booking request form connected to backend API.
 */

import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

/**
 * LeadContact component allowing users to directly submit custom event specifications.
 *
 * @returns React JSX element
 */
export const LeadContact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    eventDate: "",
    guestCount: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("es_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setFormData((prev) => ({
            ...prev,
            name: u.name || prev.name,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
          }));
        } catch {}
      }
    }
  }, []);

  /**
   * Updates state on form input change.
   *
   * @param e - Input change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles enquiry form submission via backend API.
   *
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await api.inquiries.submitConcierge({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        guestCount: formData.guestCount ? parseInt(formData.guestCount, 10) : undefined,
        message: formData.message,
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-gradient-to-b from-gray-50/60 to-brand-50/40 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Info & Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
                GET IN TOUCH
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-950 tracking-tight">
                Plan Your Event with Us
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Need help finding the perfect venue? Our dedicated event concierge
                team is here to assist you at no extra fee.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-soft hover:border-brand-300 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-900 text-brand-800 group-hover:text-gold-400 flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Direct Hotline</div>
                  <div className="text-sm font-bold text-brand-950">+91 98765 43210</div>
                </div>
              </a>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-soft hover:border-emerald-300 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">WhatsApp Concierge</div>
                  <div className="text-sm font-bold text-brand-950">+91 98765 43210</div>
                </div>
              </a>

              <a
                href="mailto:concierge@eventspacing.com"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-soft hover:border-brand-300 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-900 text-brand-800 group-hover:text-gold-400 flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Email Desk</div>
                  <div className="text-sm font-bold text-brand-950">concierge@eventspacing.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Lead Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-950 mb-1">
              Custom Event Specification
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Share your requirements and get verified quotes from top Bangalore venues within 2 hours.
            </p>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-brand-950">
                  Enquiry Received!
                </h4>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Thank you! Our dedicated venue specialist has received your event specification and will reach out to <strong>{formData.phone}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate Events">Corporate Event</option>
                      <option value="Birthday Parties">Birthday Party</option>
                      <option value="Get Together">Get Together</option>
                      <option value="Presentations">Presentation</option>
                      <option value="Social Events">Social Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    />
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Guest Count
                    </label>
                    <input
                      type="number"
                      name="guestCount"
                      placeholder="e.g. 250"
                      value={formData.guestCount}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Tell us any specific requirements (catering, lawn area, budget, dates)..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending to Concierge...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <Send className="w-4 h-4 text-gold-400" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
