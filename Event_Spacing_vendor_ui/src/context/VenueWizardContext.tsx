"use client";

/**
 * @file VenueWizardContext.tsx
 * @description React Context managing the unified state across all 6 steps of the "List Your Venue" onboarding flow.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  VenueWizardState,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
} from "@/types/wizard";

/**
 * Default initial state for Step 1: Basic Information.
 */
const initialStep1: Step1Data = {
  venueName: "The Grand Celebration Hall",
  businessName: "Grand Events Pvt Ltd",
  venueType: "Banquet Hall",
  eventCategories: ["Wedding", "Corporate Events", "Birthday Parties", "Get Together"],
  shortDescription: "Luxurious banquet hall with modern amenities, royal ambiance, and ample parking space.",
  detailedDescription: "The Grand Celebration Hall is an exquisite event destination located in the prime area of Indiranagar. Featuring opulent decor, customizable banquet configurations, state-of-the-art acoustics, and dedicated culinary spaces, it is designed to create unforgettable experiences for weddings, corporate conferences, and gala evenings.",
};

/**
 * Default initial state for Step 2: Location and Contact.
 */
const initialStep2: Step2Data = {
  addressLine1: "123, MG Road",
  addressLine2: "Near Metro Station, Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560038",
  mapCoordinates: { lat: 12.9784, lng: 77.6408 },
  primaryContactName: "Rajesh Kumar",
  phoneNumber: "9876543210",
  emailAddress: "info@grandvenue.com",
  alternateContactNumber: "9876543211",
  website: "https://www.grandvenue.com",
  showContactOnListing: true,
};

/**
 * Default initial state for Step 3: Amenities and Facilities.
 */
const initialStep3: Step3Data = {
  selectedAmenities: [
    "AC Hall",
    "Parking",
    "WiFi",
    "Power Backup",
    "Stage",
    "Sound System",
    "Dining Area",
    "Bridal Room",
    "Projector / AV Setup",
    "CCTV Security",
    "Valet Parking",
    "Elevator",
  ],
  totalCapacity: 500,
  seatingCapacity: 350,
  floatingCapacity: 500,
  numberOfHalls: 2,
  otherFacilities: "Grand chandeliers, private green room for artists, separate catering kitchen, generator backup.",
};

/**
 * Default initial state for Step 4: Pricing and Availability.
 */
const initialStep4: Step4Data = {
  activeTab: "pricing_packages",
  pricingType: "Per Day",
  startingPrice: 75000,
  securityDeposit: 10000,
  advancePaymentPercentage: 30,
  eventWisePricing: [
    { id: "p-1", eventType: "Wedding", fullDayPrice: 75000, halfDayPrice: 50000, perHourPrice: 12000 },
    { id: "p-2", eventType: "Corporate Event", fullDayPrice: 45000, halfDayPrice: 30000, perHourPrice: 8000 },
    { id: "p-3", eventType: "Birthday Party", fullDayPrice: 35000, halfDayPrice: 25000, perHourPrice: 6000 },
    { id: "p-4", eventType: "Get Together", fullDayPrice: 30000, halfDayPrice: 20000, perHourPrice: 5000 },
  ],
  cancellationPolicyNotes: "100% refund if cancelled 30 days prior. 50% refund up to 15 days prior.",
};

/**
 * Default initial state for Step 5: Photos and Media.
 */
const initialStep5: Step5Data = {
  activeTab: "venue_photos",
  photos: [
    {
      id: "ph-1",
      url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80",
      tag: "Main Hall",
      isCover: true,
      fileSize: "2.4 MB",
    },
    {
      id: "ph-2",
      url: "https://images.unsplash.com/photo-1545232979-fbf6c63a6a12?auto=format&fit=crop&w=600&q=80",
      tag: "Stage Setup",
      isCover: false,
      fileSize: "1.8 MB",
    },
    {
      id: "ph-3",
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
      tag: "Dining Area",
      isCover: false,
      fileSize: "3.1 MB",
    },
    {
      id: "ph-4",
      url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
      tag: "Outdoor Lawn",
      isCover: false,
      fileSize: "2.7 MB",
    },
    {
      id: "ph-5",
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80",
      tag: "Entrance",
      isCover: false,
      fileSize: "1.9 MB",
    },
    {
      id: "ph-6",
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80",
      tag: "Bridal Room",
      isCover: false,
      fileSize: "2.2 MB",
    },
    {
      id: "ph-7",
      url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
      tag: "Parking Area",
      isCover: false,
      fileSize: "1.5 MB",
    },
    {
      id: "ph-8",
      url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
      tag: "Conference Setup",
      isCover: false,
      fileSize: "2.8 MB",
    },
  ],
  videoTourUrl: "https://www.youtube.com/watch?v=example",
  floorPlanFiles: ["Main_Hall_Floor_Plan_v1.pdf"],
  verificationDocuments: ["Trade_License.pdf", "Fire_Safety_NOC.pdf"],
};

/**
 * Default initial state for Step 6: Review & Submit.
 */
const initialStep6: Step6Data = {
  isInformationAccurate: true,
  agreeToTermsAndPrivacy: true,
  understandVerificationReview: true,
  submissionStatus: "draft",
};

/**
 * Context properties and dispatcher methods interface.
 */
export interface VenueWizardContextType {
  state: VenueWizardState;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep3: (data: Partial<Step3Data>) => void;
  updateStep4: (data: Partial<Step4Data>) => void;
  updateStep5: (data: Partial<Step5Data>) => void;
  updateStep6: (data: Partial<Step6Data>) => void;
  resetWizard: () => void;
}

const VenueWizardContext = createContext<VenueWizardContextType | undefined>(undefined);

const STORAGE_KEY = "event_spacing_venue_draft";

/**
 * Provider component wrapping the venue onboarding funnel.
 * Handles client-side hydration, local persistence, step transitions, and validation.
 *
 * @param children - Child components rendering the wizard steps
 */
export const VenueWizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VenueWizardState>(() => {
    return {
      currentStep: 1,
      completedSteps: [],
      step1: initialStep1,
      step2: initialStep2,
      step3: initialStep3,
      step4: initialStep4,
      step5: initialStep5,
      step6: initialStep6,
    };
  });

  // Attempt restoring saved draft on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch {
      // Ignore storage errors in private browsing or SSR
    }
  }, []);

  // Sync state to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  /**
   * Navigates directly to a target step if valid.
   *
   * @param stepNumber - The step index (1-6) to navigate to
   */
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= 6) {
      setState((prev) => ({ ...prev, currentStep: stepNumber }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * Advances forward to the next step, marking the current step as completed.
   */
  const nextStep = () => {
    setState((prev) => {
      const nextStepNum = Math.min(prev.currentStep + 1, 6);
      const updatedCompleted = Array.from(new Set([...prev.completedSteps, prev.currentStep]));
      return {
        ...prev,
        currentStep: nextStepNum,
        completedSteps: updatedCompleted,
      };
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Moves back to the preceding step.
   */
  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Merges partial updates into Step 1 data.
   *
   * @param data - Partial fields for Step 1
   */
  const updateStep1 = (data: Partial<Step1Data>) => {
    setState((prev) => ({ ...prev, step1: { ...prev.step1, ...data } }));
  };

  /**
   * Merges partial updates into Step 2 data.
   *
   * @param data - Partial fields for Step 2
   */
  const updateStep2 = (data: Partial<Step2Data>) => {
    setState((prev) => ({ ...prev, step2: { ...prev.step2, ...data } }));
  };

  /**
   * Merges partial updates into Step 3 data.
   *
   * @param data - Partial fields for Step 3
   */
  const updateStep3 = (data: Partial<Step3Data>) => {
    setState((prev) => ({ ...prev, step3: { ...prev.step3, ...data } }));
  };

  /**
   * Merges partial updates into Step 4 data.
   *
   * @param data - Partial fields for Step 4
   */
  const updateStep4 = (data: Partial<Step4Data>) => {
    setState((prev) => ({ ...prev, step4: { ...prev.step4, ...data } }));
  };

  /**
   * Merges partial updates into Step 5 data.
   *
   * @param data - Partial fields for Step 5
   */
  const updateStep5 = (data: Partial<Step5Data>) => {
    setState((prev) => ({ ...prev, step5: { ...prev.step5, ...data } }));
  };

  /**
   * Merges partial updates into Step 6 data.
   *
   * @param data - Partial fields for Step 6
   */
  const updateStep6 = (data: Partial<Step6Data>) => {
    setState((prev) => ({ ...prev, step6: { ...prev.step6, ...data } }));
  };

  /**
   * Resets wizard to clean initial values.
   */
  const resetWizard = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setState({
      currentStep: 1,
      completedSteps: [],
      step1: initialStep1,
      step2: initialStep2,
      step3: initialStep3,
      step4: initialStep4,
      step5: initialStep5,
      step6: initialStep6,
    });
  };

  return (
    <VenueWizardContext.Provider
      value={{
        state,
        goToStep,
        nextStep,
        prevStep,
        updateStep1,
        updateStep2,
        updateStep3,
        updateStep4,
        updateStep5,
        updateStep6,
        resetWizard,
      }}
    >
      {children}
    </VenueWizardContext.Provider>
  );
};

/**
 * Custom React hook for accessing the Venue Wizard Context.
 * Throws an error if invoked outside of VenueWizardProvider.
 *
 * @returns VenueWizardContextType object
 */
export const useVenueWizard = (): VenueWizardContextType => {
  const context = useContext(VenueWizardContext);
  if (!context) {
    throw new Error("useVenueWizard must be used within a VenueWizardProvider");
  }
  return context;
};
