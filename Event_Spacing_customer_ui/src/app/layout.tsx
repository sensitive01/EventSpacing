import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

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
  title: "Event Spacing - Perfect Spaces for Every Occasion",
  description:
    "Find and book the best wedding halls, banquet spaces, conference rooms, lawns, and party venues in Bengaluru. Direct booking with verified venues.",
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * Root Layout component wrapping all pages with global fonts, Header, and Footer.
 *
 * @param children - Active page components
 * @returns Root HTML structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-[#fbf9fc] selection:bg-gold-500/30 selection:text-brand-950">
        {/* Global Navigation Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full">{children}</main>

        {/* Global Master Footer */}
        <Footer />
      </body>
    </html>
  );
}
