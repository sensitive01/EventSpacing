import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { VendorLayout } from "@/components/layout/VendorLayout";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vendor Hub | Event Spacing - Manage Listings & Bookings",
  description:
    "Partner portal for venue hosts and event managers to manage venue listings, customer inquiries, calendar availability, and payouts.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-[#faf7fb]">
        <VendorLayout>{children}</VendorLayout>
      </body>
    </html>
  );
}
