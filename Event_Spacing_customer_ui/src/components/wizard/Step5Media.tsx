"use client";

/**
 * @file Step5Media.tsx
 * @description Step 5 form in the venue registration wizard managing photo uploads, cover photo selection, tagging, and media categories.
 */

import React, { useRef } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  X,
  GripVertical,
  Plus,
  Video,
  FileText,
  FileCheck,
  Camera,
  Star,
} from "lucide-react";
import { useVenueWizard } from "@/context/VenueWizardContext";
import { UploadedPhoto } from "@/types/wizard";

/**
 * Step 5: Photos & Media component matching Step 5 screenshot.
 *
 * @returns React JSX element
 */
export const Step5Media: React.FC = () => {
  const { state, updateStep5, nextStep, prevStep } = useVenueWizard();
  const { step5 } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Sets a specific photo as the primary cover photo for the listing.
   *
   * @param id - Photo ID
   */
  const handleSetCover = (id: string) => {
    const updated = step5.photos.map((p) => ({
      ...p,
      isCover: p.id === id,
    }));
    updateStep5({ photos: updated });
  };

  /**
   * Deletes a photo from the gallery.
   *
   * @param id - Photo ID
   */
  const handleDeletePhoto = (id: string) => {
    const updated = step5.photos.filter((p) => p.id !== id);
    // Ensure at least one photo remains cover if possible
    if (updated.length > 0 && !updated.some((p) => p.isCover)) {
      updated[0].isCover = true;
    }
    updateStep5({ photos: updated });
  };

  /**
   * Appends simulated sample photo uploads.
   */
  const handleAddSamplePhoto = () => {
    if (step5.photos.length >= 20) {
      alert("You can upload a maximum of 20 photos.");
      return;
    }
    const sampleUrls = [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
    ];
    const newPhoto: UploadedPhoto = {
      id: `ph-${Date.now()}`,
      url: sampleUrls[Math.floor(Math.random() * sampleUrls.length)],
      tag: "Additional Area",
      isCover: false,
      fileSize: "2.1 MB",
    };
    updateStep5({ photos: [...step5.photos, newPhoto] });
  };

  /**
   * Submits Step 5 after verifying at least one photo exists.
   *
   * @param e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step5.photos.length === 0) {
      alert("Please upload at least one photo of your venue.");
      return;
    }
    nextStep();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-soft">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 block mb-1">
          Step 5 of 6
        </span>
        <h2 className="font-serif text-2xl font-bold text-brand-950">
          Photos & Media
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Upload high-quality photos and videos to showcase your venue. Attractive images help you get more bookings.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => updateStep5({ activeTab: "venue_photos" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step5.activeTab === "venue_photos"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Venue Photos</span>
        </button>

        <button
          type="button"
          onClick={() => updateStep5({ activeTab: "video_tour" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step5.activeTab === "video_tour"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video Tour</span>
        </button>

        <button
          type="button"
          onClick={() => updateStep5({ activeTab: "floor_plans" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step5.activeTab === "floor_plans"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Floor Plans</span>
        </button>

        <button
          type="button"
          onClick={() => updateStep5({ activeTab: "documents" })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            step5.activeTab === "documents"
              ? "bg-brand-800 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Documents</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag & Drop Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/30 hover:bg-brand-50/60 p-8 text-center cursor-pointer transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleAddSamplePhoto}
          />
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-sm font-bold text-brand-950 mb-1">
            Drag & drop photos here or click to upload
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Upload JPG, PNG or WEBP files (Max 10 MB each)
          </p>
          <button
            type="button"
            className="px-5 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs shadow-sm transition-all"
          >
            Choose Files
          </button>
          <div className="text-[11px] text-gray-400 mt-3">
            Recommended size: 1920 x 1080 or higher | You can upload multiple images
          </div>
        </div>

        {/* Uploaded Photos Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-sm sm:text-base font-bold text-brand-950">
              Uploaded Photos ({step5.photos.length}/20)
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5" />
              <span>Drag to reorder</span>
            </span>
          </div>

          {/* Photos 4-column Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {step5.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-soft flex flex-col justify-between"
              >
                {/* Photo Thumbnail */}
                <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.tag}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />

                  {/* Top Overlay Actions: Cover Photo Badge & Delete */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    {photo.isCover ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-800 text-white px-2 py-0.5 rounded-md shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                        Cover Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(photo.id)}
                        className="text-[10px] bg-black/50 hover:bg-brand-800 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm transition-colors"
                      >
                        Set Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Photo Tag Caption */}
                <div className="p-2.5 text-center bg-white border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-800 line-clamp-1">
                    {photo.tag}
                  </span>
                </div>
              </div>
            ))}

            {/* "+ Add More Photos" Tile */}
            {step5.photos.length < 20 && (
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-700 hover:bg-brand-50/30 flex flex-col items-center justify-center p-4 text-center transition-all h-40"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 text-brand-800 flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-brand-900">
                  Add More Photos
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Up to 20 images
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-6 flex items-center justify-between border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
