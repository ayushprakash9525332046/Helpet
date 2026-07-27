"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Service, ServiceCategory } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";
import ServiceCategoriesGrid from "@/components/ServiceCategoriesGrid";
import HeroMedia from "@/components/HeroMedia";
import { RotatingHint } from "@/components/SearchHint";
import {
  Bell, Search, ChevronRight, Shield, Clock, Sparkles,
  LocateFixed, Gift, MapPin, Star,
} from "lucide-react";

const STATS = [
  { value: "40+", label: "Professionals" },
  { value: "380+", label: "Jobs done" },
  { value: "4.9", label: "Avg rating" },
];

const TRUST_ITEMS = [
  { icon: Shield, title: "Verified pros", desc: "Every professional is background-checked before their first job." },
  { icon: Clock, title: "On time, always", desc: "Running late? You get a discount on your service." },
  { icon: Sparkles, title: "Quality work", desc: "Not happy? Free redo or full refund within 24 hours." },
];

export default function Home() {
  const { user, updateUser } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(user?.city || "Detect my location");
  const [locLoading, setLocLoading] = useState(false);
  const fetchLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address ?? {};
          const city = a.city || a.town || a.village || a.county || "";
          const state = a.state || "";
          const label = city && state ? `${city}, ${state}` : city || state || "Location found";
          setLocation(label);
          // save city to profile
          const { data: updated } = await api.put("/users/me", { city: city || undefined });
          updateUser(updated);
        } catch {
          setLocation("Location found");
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        setLocation(user?.city || "Detect my location");
        setLocLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    const fetchServices = () => {
      Promise.all([api.get("/services/categories"), api.get("/services/?limit=4")])
        .then(([cat, svc]) => { setCategories(cat.data); setServices(svc.data); })
        .finally(() => setLoading(false));
    };

    fetchServices();

    // Re-fetch when tab becomes visible (handles back-navigation router cache)
    const onVisible = () => { if (!document.hidden) fetchServices(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-6 md:pb-12">

      {/* ── Header ────────────────────────────────────── */}
      <div className="bg-[#FAF5FF] border-b border-line relative overflow-hidden">
        <HeroMedia scrimClassName="bg-gradient-to-r from-white/70 via-white/40 to-white/10" />
        {/* Faint watermark */}
        <Sparkles
          size={180}
          strokeWidth={1}
          className="absolute -top-8 -right-8 text-brand-600 opacity-[0.05] rotate-12 pointer-events-none"
          aria-hidden="true"
        />
        <div className="container-fluid pt-6 pb-5 md:pt-8 md:pb-6 relative">
          <div className="flex items-start justify-between mb-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <p className="text-ink-soft text-sm">{greeting()},</p>
              <h1 className="text-ink text-2xl md:text-3xl font-bold leading-tight">
                {user?.full_name?.split(" ")[0] ?? "there"}
              </h1>
              <button
                onClick={fetchLocation}
                disabled={locLoading}
                className="flex items-center gap-1.5 mt-2 text-sm text-ink-soft hover:text-brand-600 transition-colors"
              >
                {locLoading ? (
                  <span className="w-3 h-3 border border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                ) : (
                  <MapPin size={14} className="text-brand-600" />
                )}
                <span>{location}</span>
                {!locLoading && <LocateFixed size={12} className="text-ink-soft" />}
              </button>
            </motion.div>

            {/* Bell — mobile only, desktop has it in the top bar */}
            <Link
              href="/notifications"
              className="md:hidden relative w-10 h-10 rounded-[10px] bg-white border border-line flex items-center justify-center text-ink-soft"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-deal rounded-full border-2 border-white" />
            </Link>
          </div>

          {/* Search — mobile only */}
          <Link
            href="/categories"
            className="md:hidden flex items-center gap-3 bg-white border border-[#DBDBDB] rounded-2xl px-4 py-3.5 active:scale-[0.99] transition-transform"
          >
            <Search size={17} className="text-ink-soft" />
            <span className="text-[#9A9AA0] text-sm flex-1 flex gap-1 overflow-hidden">
              Search for
              <RotatingHint className="text-ink-soft" />
            </span>
          </Link>

          {/* Trust line — mobile only */}
          <p className="md:hidden flex items-start gap-1.5 text-xs text-ink-soft mt-3">
            <Star size={12} className="text-rating fill-rating shrink-0 mt-0.5" />
            4.9 rated · 380+ jobs done · verified pros in Dehradun
          </p>
        </div>
      </div>

      <div className="container-fluid">
        {/* ── Offer banner ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
          <Link
            href="/categories"
            className="mt-5 md:mt-6 flex items-center gap-4 bg-brand-50 border border-brand-100 rounded-2xl p-4 md:px-6 md:py-5 group relative overflow-hidden"
          >
            <Gift
              size={110}
              strokeWidth={1}
              className="hidden md:block absolute -right-4 -bottom-8 text-brand-600 opacity-[0.07] -rotate-12 pointer-events-none"
              aria-hidden="true"
            />
            <span className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
              <Gift size={20} className="text-brand-600" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-ink font-semibold text-sm md:text-lg">
                20% off on weekend bookings
              </span>
              <span className="block text-ink-soft text-xs md:text-sm mt-0.5">
                Book a Saturday or Sunday slot and save 20%
              </span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 bg-brand-600 group-hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] transition-colors shrink-0 relative">
              Book now <ChevronRight size={15} />
            </span>
            <ChevronRight size={18} className="md:hidden text-brand-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* ── Categories ─────────────────────────────────── */}
        <section className="mt-8 md:mt-10">
          <div className="flex items-end justify-between mb-4 md:mb-5">
            <h2 className="text-ink font-bold text-lg md:text-2xl">What do you need help with?</h2>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors shrink-0"
            >
              See all <ChevronRight size={15} />
            </Link>
          </div>
          <ServiceCategoriesGrid categories={categories} loading={loading} />
        </section>

        {/* ── Popular services ───────────────────────────── */}
        <section className="mt-10 md:mt-14">
          <div className="flex items-end justify-between mb-4 md:mb-5">
            <h2 className="text-ink font-bold text-lg md:text-2xl">Popular in Dehradun</h2>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors shrink-0"
            >
              See all <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-xl h-56 md:h-64" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {services.map((svc, i) => <ServiceCard key={svc.id} service={svc} index={i} />)}
            </div>
          )}
        </section>

        {/* ── Stats ──────────────────────────────────────── */}
        <section className="mt-10 md:mt-14">
          <div className="border border-line rounded-2xl grid grid-cols-3 divide-x divide-line">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-5 md:py-6 text-center">
                <span className="text-ink font-bold text-lg md:text-2xl block leading-none">{value}</span>
                <span className="text-ink-soft text-xs md:text-sm mt-1.5 block">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust ──────────────────────────────────────── */}
        <section className="mt-10 md:mt-14 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex md:flex-col items-start gap-4 border border-line rounded-xl p-4 md:p-6">
                <span className="w-10 h-10 rounded-[10px] bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-600" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-ink font-semibold text-sm md:text-base">{title}</span>
                  <span className="block text-ink-soft text-xs md:text-sm mt-1 leading-relaxed">{desc}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
