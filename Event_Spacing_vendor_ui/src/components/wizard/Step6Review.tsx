"use client";

/**
 * @file Step6Review.tsx
 * @description Final verification step displaying comprehensive summaries of all entered venue details, legal declarations, and submission.
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Send,
  Building,
  MapPin,
  Sparkles,
  IndianRupee,
  Camera,
  Check,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";

/**
 * Step 6: Review & Submit component matching Step 6 screenshot.
 *
 * @returns React JSX element
 */
export const Step6Review: React.FC = () => {
  const { state, updateStep6, goToStep, prevStep } = useVenueWizard();
  const { step1, step2, step3, step4, step5, step6 } = state;

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  /**
   * Finalizes submission after validating declaration checkboxes.
   *
   * @param e - Form submit event
   */
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !step6.isInformationAccurate ||
      !step6.agreeToTermsAndPrivacy ||
      !step6.understandVerificationReview
    ) {
      alert("Please accept all terms and verification declarations before submitting.");
      return;
    }
    updateStep6({ submissionStatus: "submitted" });
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
      {/* Step Header with Edit Jump Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
            Step 6 of 6
          </span>
          <h2 className="font-serif text-2xl font-bold text-brand-950">
            Review & Submit
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Please review all the details before submitting your venue for verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => goToStep(1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5 text-brand-700" />
          <span>Edit Details</span>
        </button>
      </div>

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* 1. Basic Information Review Card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-brand-950 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-800" />
              <span>Basic Information</span>
            </h3>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 font-medium">Venue Name:</span>{" "}
              <strong className="text-gray-900">{step1.venueName}</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Business Name:</span>{" "}
              <strong className="text-gray-900">{step1.businessName}</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Venue Type:</span>{" "}
              <strong className="text-gray-900">{step1.venueType}</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Event Categories:</span>{" "}
              <span className="text-gray-800 font-medium">
                {step1.eventCategories.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Location & Contact Review Card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-brand-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-800" />
              <span>Location & Contact</span>
            </h3>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 font-medium">Address:</span>{" "}
              <span className="text-gray-900 font-medium">
                {step2.addressLine1}, {step2.addressLine2 ? `${step2.addressLine2}, ` : ""}{step2.city}, {step2.state} - {step2.pincode}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Phone:</span>{" "}
              <strong className="text-gray-900">+91 {step2.phoneNumber}</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Email:</span>{" "}
              <span className="text-gray-900 font-medium">{step2.emailAddress}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Website:</span>{" "}
              <span className="text-brand-800 underline font-medium">
                {step2.website || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Amenities & Facilities Review Card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-brand-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-800" />
              <span>Amenities & Facilities</span>
            </h3>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {step3.selectedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-gray-200 text-brand-950 px-2.5 py-1 rounded-lg"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                {amenity}
              </span>
            ))}
          </div>

          <div className="text-xs text-gray-700 pt-2 border-t border-gray-200/60">
            <span className="text-gray-400 font-medium">Capacity:</span>{" "}
            <strong>{step3.totalCapacity} People</strong> (Seating: {step3.seatingCapacity} | Floating: {step3.floatingCapacity} | Halls: {step3.numberOfHalls})
          </div>
        </div>

        {/* 4. Pricing & Availability Review Card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-brand-950 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-brand-800" />
              <span>Pricing & Availability</span>
            </h3>
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 font-medium">Base Starting Price:</span>{" "}
              <strong>₹ {new Intl.NumberFormat("en-IN").format(step4.startingPrice)} / Day</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Security Deposit:</span>{" "}
              <strong>₹ {new Intl.NumberFormat("en-IN").format(step4.securityDeposit)}</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Advance Payment:</span>{" "}
              <strong>{step4.advancePaymentPercentage}%</strong>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Cancellation Policy:</span>{" "}
              <span className="text-gray-800 font-medium">Standard flexible cancellation</span>
            </div>
          </div>
        </div>

        {/* 5. Photos & Media Review Card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-brand-950 flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-800" />
              <span>Photos & Media</span>
            </h3>
            <button
              type="button"
              onClick={() => goToStep(5)}
              className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {step5.photos.slice(0, 5).map((photo) => (
              <div
                key={photo.id}
                className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300"
              >
                <Image
                  src={photo.url}
                  alt={photo.tag}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ))}
            {step5.photos.length > 5 && (
              <div className="w-20 h-16 rounded-xl bg-brand-900 text-gold-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                +{step5.photos.length - 5} more
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200/60 flex-wrap">
            <span>✓ {step5.photos.length} Photos Uploaded</span>
            <span>✓ 1 Virtual Video Tour</span>
            <span>✓ Floor Plans Provided</span>
            <span>✓ Business Registration Documents Added</span>
          </div>
        </div>

        {/* 6. Terms & Declaration Checkboxes */}
        <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 space-y-2.5 text-xs text-gray-800">
          <div className="font-bold text-brand-950 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-800" />
            <span>Terms & Declaration</span>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={step6.isInformationAccurate}
              onChange={(e) =>
                updateStep6({ isInformationAccurate: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-800 accent-brand-800 mt-0.5"
            />
            <span>I confirm that all the information provided is accurate and up to date.</span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={step6.agreeToTermsAndPrivacy}
              onChange={(e) =>
                updateStep6({ agreeToTermsAndPrivacy: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-800 accent-brand-800 mt-0.5"
            />
            <span>
              I agree to the{" "}
              <Link href="/#terms" className="text-brand-800 underline font-semibold">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/#privacy" className="text-brand-800 underline font-semibold">
                Privacy Policy
              </Link>{" "}
              of Event Spacing.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={step6.understandVerificationReview}
              onChange={(e) =>
                updateStep6({ understandVerificationReview: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-800 accent-brand-800 mt-0.5"
            />
            <span>
              I understand that my listing will be reviewed and published after verification by the Event Spacing operations team.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-6 flex items-center justify-between border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <span>Submit for Verification</span>
            <Send className="w-4 h-4 text-gold-400" />
          </button>
        </div>
      </form>

      {/* Verification Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-brand-950">
              Venue Submitted for Verification!
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              Your venue <strong>&quot;{step1.venueName}&quot;</strong> has been successfully queued for compliance audit. Our hospitality team will review your photos and licensing within <strong>24–48 hours</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-brand-50 text-xs text-brand-950 text-left space-y-1">
              <div><strong>Application Reference:</strong> ES-BLR-{Date.now().toString().slice(-6)}</div>
              <div><strong>Registered Mobile:</strong> +91 {step2.phoneNumber}</div>
              <div><strong>Confirmation Email:</strong> {step2.emailAddress}</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/venues"
                className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs transition-colors"
              >
                Browse Marketplace
              </Link>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50"
              >
                Review Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
