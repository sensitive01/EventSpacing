/**
 * @file wizard.ts
 * @description Type definitions for the 6-Step Multi-Step Venue Onboarding Wizard.
 */

/**
 * Step 1: Basic Information form fields.
 */
export interface Step1Data {
  venueName: string;
  businessName: string;
  venueType: string;
  eventCategories: string[];
  shortDescription: string; // Max 300 characters
  detailedDescription: string; // Max 1000 characters
}

/**
 * Step 2: Location and Contact Information form fields.
 */
export interface Step2Data {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  mapCoordinates: {
    lat: number;
    lng: number;
  };
  primaryContactName: string;
  phoneNumber: string;
  emailAddress: string;
  alternateContactNumber?: string;
  website?: string;
  showContactOnListing: boolean;
}

/**
 * Step 3: Amenities and Capacity details.
 */
export interface Step3Data {
  selectedAmenities: string[];
  totalCapacity: number;
  seatingCapacity: number;
  floatingCapacity: number;
  numberOfHalls: number;
  otherFacilities: string; // Max 500 characters
}

/**
 * Single row inside the event-wise package pricing table.
 */
export interface EventPricingRow {
  id: string;
  eventType: string;
  fullDayPrice: number;
  halfDayPrice: number;
  perHourPrice: number;
}

/**
 * Step 4: Pricing packages, deposits, and policy tabs.
 */
export interface Step4Data {
  activeTab: "pricing_packages" | "availability_calendar" | "time_slots" | "cancellation_policy";
  pricingType: "Per Day" | "Per Hour" | "Per Event";
  startingPrice: number;
  securityDeposit: number;
  advancePaymentPercentage: number;
  eventWisePricing: EventPricingRow[];
  cancellationPolicyNotes?: string;
  hasFreeVenueCateringOption?: boolean;
  freeVenueMinGuests?: number;
  freeVenuePlateStartingPrice?: number;
}

/**
 * Single photo record in Step 5 media gallery.
 */
export interface UploadedPhoto {
  id: string;
  url: string;
  tag: string;
  isCover: boolean;
  fileSize?: string;
}

/**
 * Step 5: Photos & Media uploads.
 */
export interface Step5Data {
  activeTab: "venue_photos" | "video_tour" | "floor_plans" | "documents";
  photos: UploadedPhoto[];
  videoTourUrl?: string;
  floorPlanFiles: string[];
  verificationDocuments: string[];
}

/**
 * Step 6: Final declarations and verification acceptance.
 */
export interface Step6Data {
  isInformationAccurate: boolean;
  agreeToTermsAndPrivacy: boolean;
  understandVerificationReview: boolean;
  submissionStatus: "draft" | "submitted" | "approved";
}

/**
 * Entire unified state of the venue registration wizard.
 */
export interface VenueWizardState {
  currentStep: number;
  completedSteps: number[];
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
}
