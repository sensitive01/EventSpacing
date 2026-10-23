import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AdminLayout } from "@/components/layout/AdminLayout";

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
  title: "Admin Control Deck | Event Spacing - Operations & Verification",
  description:
    "SuperAdmin and operations dashboard for venue approvals, vendor KYC compliance, catalog governance, and transaction settlements.",
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
      <body className="min-h-full flex flex-col font-sans bg-[#0d0413] text-gray-100">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
