/**
 * @file Logo.tsx
 * @description Renders the signature Event Spacing royal crest emblem with lotus petals, golden filigree, arched banner, and dual typography.
 */

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

/**
 * Event Spacing royal emblem logo component matching the official navbar crest.
 *
 * @param className - Optional CSS classes for container
 * @param variant - Visual style variant ("light" for dark navbars/footers, "dark" for white cards)
 * @param size - Sizing token ("sm" | "md" | "lg")
 * @returns React JSX element linking to homepage
 */
export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-28 h-auto",
    md: "w-32 sm:w-36 h-auto",
    lg: "w-40 sm:w-44 h-auto",
  };

  return (
    <Link
      href="/"
      className={`inline-block group select-none transition-transform duration-200 hover:scale-105 ${className}`}
      title="Event Spacing - Find, Plan, Book, Celebrate"
    >
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 180 92"
          className={`${sizeClasses[size]} drop-shadow-md`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs for Gradients and Shadow Filters */}
          <defs>
            {/* Rich Warm Gold Gradient */}
            <linearGradient id="navGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff0d0" />
              <stop offset="35%" stopColor="#f5c469" />
              <stop offset="70%" stopColor="#d49b2c" />
              <stop offset="100%" stopColor="#966014" />
            </linearGradient>

            {/* Deep Royal Purple Gradient for Main Banner */}
            <linearGradient id="navPurple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#68187c" />
              <stop offset="45%" stopColor="#430f52" />
              <stop offset="100%" stopColor="#25052f" />
            </linearGradient>

            {/* Petal Inner Purple */}
            <linearGradient id="petalPurple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8d23a7" />
              <stop offset="100%" stopColor="#400b4f" />
            </linearGradient>

            {/* White-Cream Scroll Gradient */}
            <linearGradient id="whiteScroll" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f7f1fc" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* 1. Golden Filigree & Flourishes around the Crown/Petals */}
          {/* ======================================================== */}
          {/* Left Golden Swirls */}
          <path
            d="M60 30C52 24 58 14 68 18C72 19 75 24 74 27"
            stroke="url(#navGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M50 36C40 32 46 20 56 24C60 26 62 31 59 36"
            stroke="url(#navGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="43" cy="23" r="1.5" fill="#f5c469" />

          {/* Right Golden Swirls */}
          <path
            d="M120 30C128 24 122 14 112 18C108 19 105 24 106 27"
            stroke="url(#navGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M130 36C140 32 134 20 124 24C120 26 118 31 121 36"
            stroke="url(#navGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="137" cy="23" r="1.5" fill="#f5c469" />

          {/* ======================================================== */}
          {/* 2. Royal Lotus Petals (5 Core Teardrop Jewels)           */}
          {/* ======================================================== */}
          {/* Outer Left Petal */}
          <path
            d="M64 26C69 31 66 38 57 41C54 33 59 28 64 26Z"
            fill="url(#petalPurple)"
            stroke="url(#navGold)"
            strokeWidth="1"
          />

          {/* Inner Left Petal */}
          <path
            d="M77 16C85 24 85 34 74 39C69 29 73 20 77 16Z"
            fill="url(#petalPurple)"
            stroke="url(#navGold)"
            strokeWidth="1.2"
          />

          {/* Center Main Royal Petal */}
          <path
            d="M90 7C94 18 101 29 90 38C79 29 86 18 90 7Z"
            fill="url(#petalPurple)"
            stroke="url(#navGold)"
            strokeWidth="1.5"
          />
          {/* Center Petal Inner Glow Dot */}
          <circle cx="90" cy="24" r="2" fill="#ffd57a" />

          {/* Inner Right Petal */}
          <path
            d="M103 16C95 24 95 34 106 39C111 29 107 20 103 16Z"
            fill="url(#petalPurple)"
            stroke="url(#navGold)"
            strokeWidth="1.2"
          />

          {/* Outer Right Petal */}
          <path
            d="M116 26C111 31 114 38 123 41C126 33 121 28 116 26Z"
            fill="url(#petalPurple)"
            stroke="url(#navGold)"
            strokeWidth="1"
          />

          {/* ======================================================== */}
          {/* 3. Crown Base Jewels & Flourish                           */}
          {/* ======================================================== */}
          <circle cx="90" cy="38" r="2" fill="#ffd57a" />
          <circle cx="79" cy="40" r="1.5" fill="#ffd57a" />
          <circle cx="101" cy="40" r="1.5" fill="#ffd57a" />
          <circle cx="68" cy="42" r="1.2" fill="#ffd57a" />
          <circle cx="112" cy="42" r="1.2" fill="#ffd57a" />

          {/* ======================================================== */}
          {/* 4. Folded Ribbon Tails Left & Right                       */}
          {/* ======================================================== */}
          {/* Left Ribbon Tails */}
          <path
            d="M26 53L16 43L32 40L26 53Z"
            fill="#32073e"
            stroke="url(#navGold)"
            strokeWidth="1"
          />
          <path
            d="M28 60L14 52L26 53L28 60Z"
            fill="#1c0324"
            stroke="#966014"
            strokeWidth="0.8"
          />

          {/* Right Ribbon Tails */}
          <path
            d="M154 53L164 43L148 40L154 53Z"
            fill="#32073e"
            stroke="url(#navGold)"
            strokeWidth="1"
          />
          <path
            d="M152 60L166 52L154 53L152 60Z"
            fill="#1c0324"
            stroke="#966014"
            strokeWidth="0.8"
          />

          {/* ======================================================== */}
          {/* 5. Main Center Royal Arched Purple Banner ("EVENT")       */}
          {/* ======================================================== */}
          <path
            d="M24 50C58 41 122 41 156 50L150 67C120 60 60 60 30 67L24 50Z"
            fill="url(#navPurple)"
            stroke="url(#navGold)"
            strokeWidth="1.8"
          />

          {/* Banner Inner Delicate Gold Line */}
          <path
            d="M28 51.5C59 43.5 121 43.5 152 51.5L147 64.5C119 58.5 61 58.5 33 64.5L28 51.5Z"
            stroke="#f5d68b"
            strokeWidth="0.6"
            strokeDasharray="2 1"
          />

          {/* "EVENT" Text in Banner */}
          <text
            x="90"
            y="60"
            fill="url(#navGold)"
            textAnchor="middle"
            fontSize="15"
            fontWeight="900"
            fontFamily="Georgia, serif"
            letterSpacing="2.5"
            style={{
              textShadow: "0 1px 3px rgba(0,0,0,0.9)",
              filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.8))",
            }}
          >
            EVENT
          </text>

          {/* ======================================================== */}
          {/* 6. Lower White/Gold Curved Scroll ("Spacing")             */}
          {/* ======================================================== */}
          <path
            d="M48 68C72 64.5 108 64.5 132 68C126 77 114 80 90 80C66 80 54 77 48 68Z"
            fill="url(#whiteScroll)"
            stroke="url(#navGold)"
            strokeWidth="1.2"
          />

          {/* "Spacing" Text */}
          <text
            x="90"
            y="76.5"
            fill="#340b44"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fontFamily="Georgia, serif"
            letterSpacing="0.8"
          >
            Spacing
          </text>

          {/* ======================================================== */}
          {/* 7. Bottom Golden Filigree & Star Jewel                    */}
          {/* ======================================================== */}
          {/* Bottom Left Swirl */}
          <path
            d="M62 76C56 79 58 86 66 84C72 82 78 79 84 80"
            stroke="url(#navGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Bottom Right Swirl */}
          <path
            d="M118 76C124 79 122 86 114 84C108 82 102 79 96 80"
            stroke="url(#navGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Center Bottom Diamond Jewel */}
          <polygon
            points="90,81 92.5,85 96,85.5 93,88 93.8,91.5 90,89.5 86.2,91.5 87,88 84,85.5 87.5,85"
            fill="url(#navGold)"
          />
        </svg>
      </div>
    </Link>
  );
};
