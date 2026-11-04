import React from "react";
import VenueDetailsClient from "./VenueDetailsClient";

/**
 * Static route parameter generator for Next.js static HTML export (output: 'export').
 * Returns known venue slugs from MongoDB Atlas and platform listings.
 */
export async function generateStaticParams() {
  return [
    { slug: "the-royal-grandeur" },
    { slug: "the-royal-grandeur-indiranagar" },
    { slug: "heritage-courtyard-kalyana-mantapa" },
    { slug: "emerald-canopy-lawn-resort" },
    { slug: "silicon-oasis-convention-hall" },
    { slug: "grand-palace-banquet" },
    { slug: "grand-palace-banquet-koramangala" },
    { slug: "zenith-sky-lounge-rooftop" },
    { slug: "skyline-rooftop-lounge-mg-road" },
    { slug: "summit-convention-centre-whitefield" },
    { slug: "serene-palms-resort-lawn-sarjapur" },
  ];
}

export default function VenueDetailsPage() {
  return <VenueDetailsClient />;
}
