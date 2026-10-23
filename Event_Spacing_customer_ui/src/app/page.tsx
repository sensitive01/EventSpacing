"use client";

import { HeroSearch } from "@/components/home/HeroSearch";
import { CategoryBar } from "@/components/home/CategoryBar";
import { TrustMetrics } from "@/components/home/TrustMetrics";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { VendorAddons } from "@/components/home/VendorAddons";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqSection } from "@/components/home/FaqSection";
import { LeadContact } from "@/components/home/LeadContact";


/**
 * Marketplace Homepage component matching Screen 1 design.
 *
 * @returns React JSX Page element
 */
export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Search Banner */}
      <HeroSearch />

      {/* 2. Category Quick Strip */}
      <CategoryBar />

      {/* 3. Trust & Proof Counters */}
      <TrustMetrics />

      {/* 4. Featured Venues Section */}
      <FeaturedVenues />

      {/* 5. Event Add-ons Vendor Services */}
      <VendorAddons />

      {/* 6. How Event Spacing Works (4 Steps) */}
      <HowItWorks />

      {/* 7. Customer Testimonials */}
      <Testimonials />

      {/* 8. Frequently Asked Questions Accordion */}
      <FaqSection />

      {/* 9. Direct Concierge & Enquiry Form */}
      <LeadContact />
    </div>
  );
}
