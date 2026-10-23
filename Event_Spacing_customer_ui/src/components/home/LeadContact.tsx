"use client";

/**
 * @file LeadContact.tsx
 * @description Contact and lead inquiry section with direct contact cards and booking request form.
 */

import React, { useState } from "react";
import { Phone, MessageSquare, Mail, Send, CheckCircle2 } from "lucide-react";

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

  const [isSubmitted, setIsSubmitted] = useState(false);

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
   * Handles enquiry form submission.
   *
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
              {/* Call Tile */}
              <a
                href="tel:+919876543210"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-soft hover:shadow-card hover:border-brand-700 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-900 group-hover:bg-brand-900 group-hover:text-gold-400 flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Call Us
                  </h4>
                  <div className="text-sm sm:text-base font-bold text-brand-950">
                    +91 98765 43210
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Mon - Sat, 9 AM - 7 PM
                  </span>
                </div>
              </a>

              {/* WhatsApp Tile */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-soft hover:shadow-card hover:border-emerald-600 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    WhatsApp Us
                  </h4>
                  <div className="text-sm sm:text-base font-bold text-brand-950">
                    Chat with Our Team
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Instant 15-minute quick support
                  </span>
                </div>
              </a>

              {/* Email Tile */}
              <a
                href="mailto:info@eventspacing.com"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-soft hover:shadow-card hover:border-brand-700 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-900 group-hover:bg-brand-900 group-hover:text-gold-400 flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Email Us
                  </h4>
                  <div className="text-sm sm:text-base font-bold text-brand-950">
                    info@eventspacing.com
                  </div>
                  <span className="text-[11px] text-gray-500">
                    We&apos;ll respond within 24 hours
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Lead Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-card">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-950 mb-1">
              Send an Enquiry
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Tell us what you are looking for and we will provide the best curated options.
            </p>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-brand-950">
                  Enquiry Submitted Successfully!
                </h4>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Thank you for reaching out, {formData.name || "valued customer"}!
                  Our event coordinator will contact you shortly on {formData.phone || "your provided phone"}.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-xl bg-brand-800 text-white font-semibold text-xs"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. priya@example.com"
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
                      Your Phone *
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
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 bg-white"
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
                  className="w-full bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Submit Enquiry</span>
                  <Send className="w-4 h-4 text-gold-400" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
