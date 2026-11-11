"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  Tag,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { ServiceListing } from "@/types/service";

export default function VendorServicesPage() {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await api.vendor.getServices();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setServices(list);
    } catch (err) {
      console.warn("Could not fetch vendor services:", err);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      setIsDeleting(id);
      await api.vendor.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id && s._id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete service.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory === "all") return true;
    return s.category === selectedCategory;
  });

  const categoriesPresent = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="space-y-6">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">
            Marketplace Portfolio
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Manage Event Services
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Showcase your photography, catering, decor, DJ, and other event capabilities to thousands of clients.
          </p>
        </div>

        <Link
          href="/services/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>{services.length === 0 ? "List Your First Service" : "List Another Service"}</span>
        </Link>
      </div>

      {/* 2. Category Filter Chips (if any services exist) */}
      {categoriesPresent.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-brand-900 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Services ({services.length})
          </button>
          {categoriesPresent.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-brand-900 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat} ({services.filter((s) => s.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* 3. Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-gray-200 animate-pulse space-y-4">
              <div className="h-44 bg-gray-200 rounded-2xl w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        /* 4. Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-200/90 shadow-soft text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gold-50 border border-gold-200/60 flex items-center justify-center mx-auto text-gold-600 shadow-sm">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-700 bg-gold-100/80 px-3 py-1 rounded-full">
              Partner Marketplace
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">
              No Event Services Listed Yet
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Are you a caterer, photographer, DJ, decorator, makeup artist, or event planner?
              List your business in our marketplace and connect with customers booking celebration spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-xs text-brand-900 block">21 Categories</span>
              <span className="text-[11px] text-gray-500 block">Catering, Decor, Sound, Photo, AV & more</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-xs text-brand-900 block">Direct Inquiries</span>
              <span className="text-[11px] text-gray-500 block">Get calls & WhatsApp event leads</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-xs text-brand-900 block">Fast Setup</span>
              <span className="text-[11px] text-gray-500 block">Publish your profile in under 2 minutes</span>
            </div>
          </div>

          <Link
            href="/services/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-bold text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Your First Event Service Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* 5. Services Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const sid = service.id || service._id || "";
            return (
              <div
                key={sid}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-soft overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                {/* Image & Category Pill */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={service.imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"}
                    alt={service.businessName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    <Tag className="w-3 h-3 text-gold-400" />
                    <span>{service.category}</span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{service.rating || 4.8}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 truncate">
                        {service.businessName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Live</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{service.locality}, {service.city}</span>
                    </p>

                    <p className="text-xs text-gray-600 line-clamp-2 pt-1">
                      {service.description}
                    </p>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                        Starting Price
                      </span>
                      <span className="font-bold text-base text-brand-950">
                        ₹{Number(service.startingPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-gray-500 font-normal ml-1">
                        /{service.priceUnit || "day"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(sid, service.businessName)}
                        disabled={isDeleting === sid}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <a
                        href={`http://localhost:3000/marketplace`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-gray-400 hover:text-brand-900 hover:bg-brand-50 transition-colors"
                        title="View on Customer Marketplace"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

