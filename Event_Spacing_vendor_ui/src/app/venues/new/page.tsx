"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

const WizardWorkspace: React.FC = () => {
  return (
    <div className="w-full pb-20 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/venues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Venues</span>
        </Link>
        <span className="text-[11px] text-gray-400">
          Draft auto-saved to local workspace
        </span>
      </div>

      {/* 1. Header Banner & Progress Stepper */}
      <StepperHeader />

      {/* 2. 3-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Rail: Value Props & Verification Checklist (3 cols) */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <WizardSidebarLeft />
        </div>

        {/* Center Main Form Step (6 cols) */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <WizardFormSwitcher />
        </div>

        {/* Right Rail: Tips & Live Marketplace Card Preview (3 cols) */}
        <div className="lg:col-span-3 order-3">
          <WizardSidebarRight />
        </div>
      </div>
    </div>
  );
};

export default function NewVenueWizardPage() {
  return (
    <VenueWizardProvider>
      <WizardWorkspace />
    </VenueWizardProvider>
  );
}
