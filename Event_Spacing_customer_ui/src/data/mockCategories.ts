/**
 * @file mockCategories.ts
 * @description Master data for 20 event categories, 15 venue types, 21 vendor marketplace categories,
 * amenities, and localities according to the client PRD.
 */

import {
  EventCategory,
  Testimonial,
  EVENT_CATEGORIES as CATEGORY_NAMES,
  VENUE_TYPES as VENUE_TYPE_NAMES,
  VENDOR_MARKETPLACE_CATEGORIES as MARKETPLACE_CATEGORY_NAMES,
  MarketplaceVendor,
} from "@/types/venue";

/**
 * 20 Event categories according to client PRD
 */
export const EVENT_CATEGORIES: EventCategory[] = [
  { id: "cat-wedding", name: "Marriage / Wedding", iconName: "Heart", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80", count: 540 },
  { id: "cat-reception", name: "Reception", iconName: "Sparkles", imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80", count: 480 },
  { id: "cat-engagement", name: "Engagement", iconName: "Gem", imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80", count: 320 },
  { id: "cat-birthday", name: "Birthday", iconName: "Cake", imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80", count: 410 },
  { id: "cat-anniversary", name: "Anniversary", iconName: "Wine", imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80", count: 210 },
  { id: "cat-babyshower", name: "Baby shower", iconName: "Smile", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", count: 185 },
  { id: "cat-naming", name: "Naming ceremony", iconName: "Sun", imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80", count: 160 },
  { id: "cat-family", name: "Family functions", iconName: "Users", imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80", count: 290 },
  { id: "cat-corpmeetings", name: "Corporate meetings", iconName: "Briefcase", imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80", count: 340 },
  { id: "cat-conferences", name: "Conferences", iconName: "Mic", imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80", count: 275 },
  { id: "cat-seminars", name: "Seminars", iconName: "BookOpen", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80", count: 215 },
  { id: "cat-training", name: "Training programs", iconName: "Award", imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80", count: 190 },
  { id: "cat-launches", name: "Product launches", iconName: "Rocket", imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80", count: 145 },
  { id: "cat-exhibitions", name: "Exhibitions", iconName: "Store", imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=400&q=80", count: 130 },
  { id: "cat-award", name: "Award functions", iconName: "Trophy", imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=400&q=80", count: 155 },
  { id: "cat-teamoutings", name: "Team outings", iconName: "Compass", imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80", count: 220 },
  { id: "cat-workshops", name: "Workshops", iconName: "Wrench", imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=400&q=80", count: 175 },
  { id: "cat-parties", name: "Private parties", iconName: "PartyPopper", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80", count: 380 },
  { id: "cat-religious", name: "Religious/community events", iconName: "Home", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", count: 195 },
  { id: "cat-custom", name: "Other custom events", iconName: "Sparkle", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80", count: 110 },
];

/**
 * 15 Venue Types according to client PRD
 */
export const ALL_VENUE_TYPES = VENUE_TYPE_NAMES.map((name, i) => ({
  id: `vt-${i + 1}`,
  name,
  icon: "Building",
}));

/**
 * Event Add-ons for homepage display
 */
export const VENDOR_ADDONS = [
  {
    id: "add-decor",
    title: "Event Decoration",
    category: "Decor & Lighting",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    startingPrice: "₹15,000",
  },
  {
    id: "add-catering",
    title: "Catering Services",
    category: "Food & Beverage",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80",
    startingPrice: "₹450 / Plate",
  },
  {
    id: "add-photo",
    title: "Photography & Videography",
    category: "Media Coverage",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
    startingPrice: "₹25,000 / Day",
  },
  {
    id: "add-entertainment",
    title: "Entertainment (MC, DJ, Live Band)",
    category: "Music & Artists",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    startingPrice: "₹18,000",
  },
  {
    id: "add-planning",
    title: "Event Planning",
    category: "Full Coordination",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
    startingPrice: "₹35,000",
  },
  {
    id: "add-gifts",
    title: "Return Gifts & Favors",
    category: "Hampers & Favors",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
    startingPrice: "₹150 / Piece",
  },
];


/**
 * 21 Vendor Marketplace Categories according to client PRD
 */
export const ALL_MARKETPLACE_CATEGORIES = MARKETPLACE_CATEGORY_NAMES.map((name, i) => ({
  id: `vmc-${i + 1}`,
  name,
  icon: "Star",
}));

/**
 * Curated mock vendors for the 21 Vendor Marketplace categories
 */
export const MOCK_MARKETPLACE_VENDORS: MarketplaceVendor[] = [
  {
    id: "mv-01",
    businessName: "Royal Flavors Gourmet Catering",
    ownerName: "Chef Sanjeev Nambiar",
    category: "Caterers",
    city: "Bengaluru",
    locality: "Indiranagar",
    startingPrice: 650,
    priceUnit: "per plate",
    rating: 4.9,
    reviewCount: 182,
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
    portfolioImages: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    ],
    description: "Authentic South Indian Sadya, North Indian Royal Awadhi, and Pan-Asian live counters for grand weddings.",
    isVerified: true,
    phone: "+91 98450 77112",
    email: "events@royalflavors.in",
  },
  {
    id: "mv-02",
    businessName: "Artisan Blooms & Fairy Lights",
    ownerName: "Mira Swaminathan",
    category: "Decorators",
    city: "Bengaluru",
    locality: "Whitefield",
    startingPrice: 35000,
    priceUnit: "per setup",
    rating: 4.85,
    reviewCount: 96,
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    portfolioImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    ],
    description: "Bespoke floral mandaps, fairy light tunnels, rustic bohemian themes, and modern glasshouse decor.",
    isVerified: true,
    phone: "+91 99001 44551",
    email: "contact@artisanblooms.com",
  },
  {
    id: "mv-03",
    businessName: "Candid Moments Cinema & Photo",
    ownerName: "Akash & Tanya Verma",
    category: "Photographers",
    city: "Bengaluru",
    locality: "Koramangala",
    startingPrice: 45000,
    priceUnit: "per day",
    rating: 4.95,
    reviewCount: 215,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    portfolioImages: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    ],
    description: "Award-winning wedding cinematic films, drone coverage, 360 virtual reels, and coffee table albums.",
    isVerified: true,
    phone: "+91 97412 88200",
    email: "bookings@candidmoments.in",
  },
  {
    id: "mv-04",
    businessName: "Beats & Bass Entertainment",
    ownerName: "DJ Varun Saxena",
    category: "DJs",
    city: "Bengaluru",
    locality: "HSR Layout",
    startingPrice: 22000,
    priceUnit: "per evening",
    rating: 4.8,
    reviewCount: 88,
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    portfolioImages: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    ],
    description: "Commercial, Bollywood, Punjabi Dhol, and EDM party sets complete with Martin audio consoles and laser rigs.",
    isVerified: true,
    phone: "+91 96112 33445",
    email: "djvarun@beatsandbass.com",
  },
  {
    id: "mv-05",
    businessName: "Glamour Glow Bridal Makeovers",
    ownerName: "Shalini Kulkarni",
    category: "Makeup Artists",
    city: "Bengaluru",
    locality: "Jayanagar",
    startingPrice: 18000,
    priceUnit: "per look",
    rating: 4.9,
    reviewCount: 140,
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    portfolioImages: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    ],
    description: "HD & Airbrush bridal styling, saree draping, and party look packages with international cosmetics.",
    isVerified: true,
    phone: "+91 98860 99881",
    email: "shalini@glamourglow.com",
  },
  {
    id: "mv-06",
    businessName: "Elite Valet & Chauffeur Services",
    ownerName: "Raghavendra Hegde",
    category: "Valet Parking",
    city: "Bengaluru",
    locality: "CBD / MG Road",
    startingPrice: 12000,
    priceUnit: "per 4 hours",
    rating: 4.8,
    reviewCount: 65,
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
    portfolioImages: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
    ],
    description: "Uniformed, background-verified professional valet drivers with RFID token parking management.",
    isVerified: true,
    phone: "+91 99450 11223",
    email: "operations@elitevalet.in",
  },
];

/**
 * Master list of venue amenities
 */
export const ALL_AMENITIES = [
  { id: "ac_hall", name: "AC Hall", icon: "Snowflake" },
  { id: "parking", name: "Parking", icon: "Car" },
  { id: "wifi", name: "WiFi", icon: "Wifi" },
  { id: "power_backup", name: "Power Backup", icon: "Zap" },
  { id: "changing_rooms", name: "Changing Rooms", icon: "DoorOpen" },
  { id: "stage", name: "Stage", icon: "Layers" },
  { id: "sound_system", name: "Sound System", icon: "Volume2" },
  { id: "projector_av", name: "Projector / AV Setup", icon: "Monitor" },
  { id: "bridal_room", name: "Bridal Room", icon: "Gem" },
  { id: "dining_area", name: "Dining Area", icon: "UtensilsCrossed" },
  { id: "outdoor_space", name: "Outdoor Space", icon: "Sun" },
  { id: "elevator", name: "Elevator", icon: "ArrowUpDown" },
  { id: "wheelchair_access", name: "Wheelchair Access", icon: "Accessibility" },
  { id: "cctv_security", name: "CCTV Security", icon: "ShieldCheck" },
  { id: "valet_parking", name: "Valet Parking", icon: "KeyRound" },
];

/**
 * Localities in Bengaluru
 */
export const BENGALURU_LOCALITIES = [
  { name: "Bengaluru (All)", count: 1245 },
  { name: "Whitefield", count: 320 },
  { name: "Electronic City", count: 180 },
  { name: "Koramangala", count: 210 },
  { name: "Indiranagar", count: 160 },
  { name: "HSR Layout", count: 145 },
  { name: "Sarjapur Road", count: 110 },
  { name: "Yelahanka", count: 95 },
  { name: "Marathahalli", count: 85 },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Priya Sharma",
    role: "Wedding Customer",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    quote: "Found the perfect wedding hall with the Free Venue catering plan! The booking process was seamless and saved us nearly ₹2 Lakhs.",
    rating: 5,
  },
  {
    id: "test-2",
    name: "Rahul Mehta",
    role: "Corporate Customer",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    quote: "We booked a conference room and AV package for our annual tech summit. Transparent pricing and verified booking.",
    rating: 5,
  },
  {
    id: "test-3",
    name: "Sneha Iyer",
    role: "Birthday Party Customer",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    quote: "Excellent platform to compare venues and hire decorators & photographers in one place. Highly recommended!",
    rating: 5,
  },
];
