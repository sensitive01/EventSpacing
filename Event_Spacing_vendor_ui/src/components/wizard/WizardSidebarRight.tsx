"use client";

/**
 * @file WizardSidebarRight.tsx
 * @description Contextual right rail displaying step-specific tips for Steps 1–5, and the Live Preview card for Step 6.
 */

import React from "react";
import {
  Lightbulb,
  Building2,
  CheckCircle,
  FileText,
  Camera,
  Tag,
  ShieldCheck,
  MapPin,
  Compass,
  PhoneCall,
  Mail,
  Globe,
  Snowflake,
  Users,
  Key,
  Calendar,
  Percent,
  Layers,
  Video,
  Sparkles,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";
import { VenueLivePreviewCard } from "./VenueLivePreviewCard";

/**
 * WizardSidebarRight component dynamically switching contextual guidance tips and live preview.
 *
 * @returns React JSX element
 */
export const WizardSidebarRight: React.FC = () => {
  const { state } = useVenueWizard();
  const { currentStep } = state;

  // On Step 6, render the Live Customer Preview
  if (currentStep === 6) {
    return <VenueLivePreviewCard />;
  }

  /**
   * Helper returning tips array for steps 1 through 5.
   */
  const getTipsData = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Onboarding Tips",
          tips: [
            {
              icon: <Building2 className="w-4 h-4 text-purple-600" />,
              title: "Use a clear and attractive venue name",
              desc: "Keep it short, professional and easily memorable.",
            },
            {
              icon: <CheckCircle className="w-4 h-4 text-amber-600" />,
              title: "Select all relevant event categories",
              desc: "This helps matching customers find your venue easily.",
            },
            {
              icon: <FileText className="w-4 h-4 text-blue-600" />,
              title: "Write a detailed description",
              desc: "Highlight unique features, location access, rules, etc.",
            },
            {
              icon: <Camera className="w-4 h-4 text-pink-600" />,
              title: "Upload high quality photos",
              desc: "Showcase your venue with crisp, well-lit real images.",
            },
            {
              icon: <Tag className="w-4 h-4 text-emerald-600" />,
              title: "Set accurate pricing and availability",
              desc: "Keep your calendar up to date to avoid booking conflicts.",
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
              title: "Complete all steps to get verified",
              desc: "Our verification team will review and fast-track your listing.",
            },
          ],
        };
      case 2:
        return {
          title: "Location Tips",
          tips: [
            {
              icon: <Building2 className="w-4 h-4 text-purple-600" />,
              title: "Enter complete and accurate address",
              desc: "Helps customers locate your venue easily on Google Maps.",
            },
            {
              icon: <Compass className="w-4 h-4 text-amber-600" />,
              title: "Add a nearby landmark",
              desc: "Mention prominent metro stations or tech parks nearby.",
            },
            {
              icon: <MapPin className="w-4 h-4 text-emerald-600" />,
              title: "Pin the exact location on map",
              desc: "Ensure the marker is precisely placed on the entrance gate.",
            },
            {
              icon: <PhoneCall className="w-4 h-4 text-blue-600" />,
              title: "Use a valid contact number",
              desc: "So customers and our operations team can reach you directly.",
            },
            {
              icon: <Mail className="w-4 h-4 text-pink-600" />,
              title: "Provide an active email address",
              desc: "You will receive booking alerts and customer inquiries here.",
            },
            {
              icon: <Globe className="w-4 h-4 text-teal-600" />,
              title: "Add your website (if available)",
              desc: "Showcase additional portfolio details about your venue.",
            },
          ],
        };
      case 3:
        return {
          title: "Amenities Tips",
          tips: [
            {
              icon: <Snowflake className="w-4 h-4 text-blue-600" />,
              title: "Select all applicable amenities",
              desc: "This helps customers filter by their specific venue needs.",
            },
            {
              icon: <Users className="w-4 h-4 text-purple-600" />,
              title: "Mention accurate capacity",
              desc: "Include seating and floating capacity without exaggeration.",
            },
            {
              icon: <Key className="w-4 h-4 text-amber-600" />,
              title: "Add key facilities",
              desc: "Like AC, parking, WiFi, power backup, changing rooms, etc.",
            },
            {
              icon: <Layers className="w-4 h-4 text-pink-600" />,
              title: "Highlight special features",
              desc: "Stage, projector, bridal room, lawns, and outdoor spaces.",
            },
            {
              icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
              title: "Be accurate and genuine",
              desc: "Accuracy builds customer trust and leads to higher 5-star ratings.",
            },
          ],
        };
      case 4:
        return {
          title: "Pricing Tips",
          tips: [
            {
              icon: <Building2 className="w-4 h-4 text-purple-600" />,
              title: "Research similar venues",
              desc: "Keep your prices competitive with nearby alternatives.",
            },
            {
              icon: <Tag className="w-4 h-4 text-blue-600" />,
              title: "Offer event-wise packages",
              desc: "Attract more bookings with tailored wedding vs corporate pricing.",
            },
            {
              icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
              title: "Be transparent",
              desc: "Clearly mention what amenities are included in the base rate.",
            },
            {
              icon: <Percent className="w-4 h-4 text-amber-600" />,
              title: "Keep advance payment reasonable",
              desc: "20% - 30% advance deposit builds trust with prospective hosts.",
            },
            {
              icon: <Calendar className="w-4 h-4 text-teal-600" />,
              title: "Update availability regularly",
              desc: "Block booked dates immediately to avoid double booking conflicts.",
            },
          ],
        };
      case 5:
        return {
          title: "Photo Upload Tips",
          tips: [
            {
              icon: <Camera className="w-4 h-4 text-purple-600" />,
              title: "Upload high-quality images",
              desc: "Use clear, bright, and professional high-resolution photos.",
            },
            {
              icon: <Building2 className="w-4 h-4 text-blue-600" />,
              title: "Include all important areas",
              desc: "Show main hall, stage, dining, washrooms, and rooms.",
            },
            {
              icon: <Layers className="w-4 h-4 text-amber-600" />,
              title: "Use landscape orientation",
              desc: "Recommended dimensions: 1920 x 1080 for best desktop & mobile display.",
            },
            {
              icon: <Sparkles className="w-4 h-4 text-gold-600" />,
              title: "Add a cover photo",
              desc: "Select the most visually stunning shot as your main photo.",
            },
            {
              icon: <Video className="w-4 h-4 text-teal-600" />,
              title: "Add a virtual video tour",
              desc: "Video tours significantly increase conversion and trust.",
            },
          ],
        };
      default:
        return { title: "Tips", tips: [] };
    }
  };

  const currentTips = getTipsData();

  return (
    <aside className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-soft space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
          <Lightbulb className="w-4 h-4" />
        </div>
        <h3 className="font-serif text-base font-bold text-brand-950">
          {currentTips.title}
        </h3>
      </div>

      <div className="space-y-4">
        {currentTips.tips.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
