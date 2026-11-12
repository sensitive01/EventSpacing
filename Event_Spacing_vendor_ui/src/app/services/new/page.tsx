"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Tag,
  DollarSign,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  HelpCircle,
  ChevronDown,
  Upload,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload";
import { VENDOR_MARKETPLACE_CATEGORIES, SERVICE_PRICE_UNITS } from "@/types/service";

// Preset curated Unsplash photos for quick demo selection per category
const CATEGORY_IMAGE_PRESETS: Record<string, string> = {
  Caterers: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  Decorators: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  Photographers: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
  Videographers: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
  DJs: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  Musicians: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  "Makeup Artists": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  "Mehendi Artists": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
  "Event Planners": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
  "Wedding Planners": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  "Anchors / MCs": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
  Florists: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
  "Invitation Providers": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
  "Cake Providers": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
  Security: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
  "Valet Parking": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
  "Chauffeur Services": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
  "Furniture Rental": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  "AV Equipment": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
  Lighting: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
  "Stage Providers": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
};

export default function NewServiceListingPage() {
  const router = useRouter();

  const [category, setCategory] = useState<string>("Photographers");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [locality, setLocality] = useState("Indiranagar");
  const [startingPrice, setStartingPrice] = useState("25000");
  const [priceUnit, setPriceUnit] = useState<string>("per day");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(CATEGORY_IMAGE_PRESETS["Photographers"]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const serviceFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Prepopulate vendor info from localStorage if available
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("es_vendor_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name && !ownerName) setOwnerName(u.name);
        if (u.phone && !phone) setPhone(u.phone);
        if (u.email && !email) setEmail(u.email);
        if (u.businessName && !businessName) setBusinessName(u.businessName);
      }
    } catch {}
  }, []);

  const handleCategorySelect = (selected: string) => {
    setCategory(selected);
    if (CATEGORY_IMAGE_PRESETS[selected]) {
      setImageUrl(CATEGORY_IMAGE_PRESETS[selected]);
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploadingImage(true);
    try {
      const uploaded = await uploadImageFile(file, "services");
      setImageUrl(uploaded.url);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to upload cover photo.");
    } finally {
      setIsUploadingImage(false);
      if (serviceFileInputRef.current) {
        serviceFileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!businessName.trim()) {
      setErrorMsg("Please enter your business or service name.");
      return;
    }
    if (!startingPrice || Number(startingPrice) <= 0) {
      setErrorMsg("Please enter a valid starting price.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.vendor.createService({
        category,
        businessName: businessName.trim(),
        ownerName: ownerName.trim() || businessName.trim(),
        phone: phone.trim() || "+91 98765 43210",
        email: email.trim() || "vendor@eventspacing.com",
        city: city.trim(),
        locality: locality.trim(),
        startingPrice: Number(startingPrice),
        priceUnit,
        description:
          description.trim() ||
          `Professional ${category} services with custom packages and verified high-quality event execution.`,
        imageUrl: imageUrl.trim(),
        portfolioImages: [imageUrl.trim()],
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/services");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to publish service listing. Please check connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Link & Header */}
      <div className="space-y-2">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services</span>
        </Link>
        <span className="text-xs uppercase font-bold text-gold-600 tracking-wider block">
          Marketplace Onboarding
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
          List Your Event Service
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Join Event Spacing's verified service marketplace across 21 event categories.
        </p>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Service Listed Successfully!</p>
            <p className="text-xs text-emerald-700">Redirecting to your services dashboard...</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Listing Error</p>
            <p className="text-xs text-red-700">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category Picker (21 Master Categories) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-950 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-600" />
                <span>1. Select Service Category *</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose from the 21 master event service categories.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-900 bg-brand-50 px-2.5 py-1 rounded-full">
              {category}
            </span>
          </div>

          <div className="relative">
            <select
              value={category}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full text-xs font-semibold p-3.5 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800 bg-white text-gray-900 appearance-none cursor-pointer"
            >
              {VENDOR_MARKETPLACE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Step 2: Business & Contact Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-950 flex items-center gap-2">
            <Store className="w-4 h-4 text-gold-600" />
            <span>2. Business & Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Business / Brand Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Royal Lens Photography, Spice Craft Caterers"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Owner / Lead Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Bharath Kumar"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Phone Number (For Customer Inquiries)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 97904 16823"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Locality / Area *
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Indiranagar, Whitefield, Koramangala"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Pricing & Bio */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-950 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gold-600" />
            <span>3. Pricing & Services Overview</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Starting Price (₹) *
              </label>
              <input
                type="number"
                required
                min={500}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="25000"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Price Unit
              </label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800 bg-white"
              >
                {SERVICE_PRICE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Service Description & Inclusions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight your experience, past events covered, equipment/crew details, and what is included in your standard package."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Cover Image / Portfolio URL
            </label>
            <input
              ref={serviceFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleServiceImageUpload}
              className="hidden"
            />
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="flex-1 min-w-[200px] text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => serviceFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-xl whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (CATEGORY_IMAGE_PRESETS[category]) {
                    setImageUrl(CATEGORY_IMAGE_PRESETS[category]);
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-brand-900 bg-brand-50 hover:bg-brand-100 rounded-xl whitespace-nowrap transition-colors"
              >
                Reset Default
              </button>
            </div>
            {imageUrl && (
              <div className="mt-2.5 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Service cover preview"
                  className="w-16 h-12 rounded-xl object-cover border border-gray-200 bg-gray-100"
                />
                <span className="text-[11px] text-gray-500">
                  Uploaded directly to Cloudinary (`eventspacing/services`) or custom HTTPS URL.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/services"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Publishing Service...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Publish Service to Marketplace</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

