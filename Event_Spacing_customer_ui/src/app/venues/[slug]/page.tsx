import React from "react";
import VenueDetailsClient from "./VenueDetailsClient";

export const dynamicParams = true;

/**
 * Static route parameter generator for Next.js prerendering.
 * Returns known venue slugs from MongoDB Atlas and platform listings.
 */
export async function generateStaticParams() {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://eventspacing.onrender.com/api";
    const apiUrl = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/$/, "")}/api`;
    const res = await fetch(`${apiUrl}/venues?limit=50`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        return json.data.map((v: any) => ({ slug: v.slug }));
      }
    }
  } catch {}

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
    { slug: "venuebk-0689" },
    { slug: "bk-hall-5028" },
  ];
}

export default function VenueDetailsPage() {
  return <VenueDetailsClient />;
}
