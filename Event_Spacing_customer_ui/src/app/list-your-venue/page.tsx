"use client";

/**
 * @file list-your-venue/page.tsx
 * @description Multi-Step Venue Onboarding Wizard page (Screens 3, 4, 5, 6) orchestrating the 6-step registration flow.
 */

import React from "react";
import {
  VenueWizardProvider,
  useVenueWizard,
} from "@/context/VenueWizardContext";
import { StepperHeader } from "@/components/wizard/StepperHeader";
import { WizardSidebarLeft } from "@/components/wizard/WizardSidebarLeft";
import { WizardSidebarRight } from "@/components/wizard/WizardSidebarRight";
import { Step1BasicInfo } from "@/components/wizard/Step1BasicInfo";
import { Step2Location } from "@/components/wizard/Step2Location";
import { Step3Amenities } from "@/components/wizard/Step3Amenities";
import { Step4Pricing } from "@/components/wizard/Step4Pricing";
import { Step5Media } from "@/components/wizard/Step5Media";
import { Step6Review } from "@/components/wizard/Step6Review";

/**
 * Inner wizard router that renders the active step component.
 *
 * @returns React JSX element
 */
const WizardFormSwitcher: React.FC = () => {
  const { state } = useVenueWizard();
  const { currentStep } = state;

  switch (currentStep) {
    case 1:
      return <Step1BasicInfo />;
    case 2:
      return <Step2Location />;
    case 3:
      return <Step3Amenities />;
    case 4:
      return <Step4Pricing />;
    case 5:
      return <Step5Media />;
    case 6:
      return <Step6Review />;
    default:
      return <Step1BasicInfo />;
  }
};

/**
 * Main Onboarding Workspace containing the 3-column layout:
 * Left value-props rail, Center active form step, and Right contextual guidance/preview rail.
 *
 * @returns React JSX element
 */
const WizardWorkspace: React.FC = () => {
  return (
    <div className="w-full bg-[#faf7fb] min-h-screen pb-24">
      {/* 1. Header Banner & Progress Stepper */}
      <StepperHeader />

      {/* 2. 3-Column Responsive Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Rail: Value Props & Helpline (3 cols) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <WizardSidebarLeft />
          </div>

          {/* Center Main Form Step (6 cols) */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <WizardFormSwitcher />
          </div>

          {/* Right Rail: Tips & Live Preview (3 cols) */}
          <div className="lg:col-span-3 order-3">
            <WizardSidebarRight />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Entry page component wrapped in VenueWizardProvider.
 *
 * @returns React JSX element
 */
export default function ListYourVenuePage() {
  return (
    <VenueWizardProvider>
      <WizardWorkspace />
    </VenueWizardProvider>
  );
}
