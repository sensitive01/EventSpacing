/**
 * @file TrustMetrics.tsx
 * @description Trust metrics and social proof counters bar.
 */

import React from "react";
import { Building2, MapPin, Users2, CalendarCheck, ShieldCheck } from "lucide-react";

/**
 * TrustMetrics component renders proof counters in gold & royal purple.
 *
 * @returns React JSX element
 */
export const TrustMetrics: React.FC = () => {
  const metrics = [
    {
      icon: <Building2 className="w-6 h-6 text-gold-400" />,
      value: "1,000+",
      label: "Verified Venues",
    },
    {
      icon: <MapPin className="w-6 h-6 text-gold-400" />,
      value: "50+",
      label: "Cities",
    },
    {
      icon: <Users2 className="w-6 h-6 text-gold-400" />,
      value: "25,000+",
      label: "Happy Customers",
    },
    {
      icon: <CalendarCheck className="w-6 h-6 text-gold-400" />,
      value: "10,000+",
      label: "Events Hosted",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-gold-400" />,
      value: "4.8/5",
      label: "Average Rating",
    },
  ];

  return (
    <section className="bg-brand-950 text-white py-6 border-y border-brand-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          {metrics.map((item, index) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center pt-4 md:pt-0 ${
                index === 0 ? "pt-0" : ""
              } ${index === 4 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-brand-900 border border-gold-400/20 flex items-center justify-center mb-2 shadow-inner">
                {item.icon}
              </div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {item.value}
              </span>
              <span className="text-xs uppercase tracking-wider text-gold-300/80 font-medium mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
