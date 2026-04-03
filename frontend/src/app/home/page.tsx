"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Service, ServiceCategory } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import ServiceCard from "@/components/ServiceCard";
import { Bell, Search, MapPin, ChevronRight, Sparkles, Shield, Clock } from "lucide-react";

const CATEGORY_META: Record<string, { icon: string; gradient: string }> = {
  Cleaning:     { icon: "🧹", gradient: "from-blue-400 to-cyan-400" },
  Plumbing:     { icon: "🔧", gradient: "from-orange-400 to-amber-400" },
  Electrician:  { icon: "⚡", gradient: "from-yellow-400 to-orange-400" },
  Carpenter:    { icon: "🪚", gradient: "from-amber-500 to-yellow-500" },
  Painter:      { icon: "🎨", gradient: "from-pink-400 to-rose-400" },
  "AC Repair":  { icon: "❄️", gradient: "from-cyan-400 to-blue-400" },
  Salon:        { icon: "✂️", gradient: "from-purple-400 to-violet-500" },
  Pest:         { icon: "🐛", gradient: "from-green-400 to-emerald-500" },
};

const STATS = [
  { icon: "👷", value: "2,000+", label: "Professionals" },
  { icon: "✅", value: "50K+",   label: "Jobs Done" },
  { icon: "⭐", value: "4.9",    label: "Avg Rating" },
];

const PROMO_CARDS = [
  { gradient: "from-blue-600 to-indigo-600",   emoji: "🏠", label: "LIMITED OFFER",   title: "20% off your first booking",  cta: "Book Now" },
  { gradient: "from-violet-500 to-purple-600", emoji: "⚡", label: "EXPRESS SERVICE", title: "Same-day service available",   cta: "Book Fast" },
];

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices]     = useState<Service[]>([]);
  const [loading, setLoading]       = useState(true);
  const [promoIdx, setPromoIdx]     = useState(0);

  useEffect(() => {
    Promise.all([api.get("/services/categories"), api.get("/services/")])
      .then(([cat, svc]) => { setCategories(cat.data.slice(0, 8)); setServices(svc.data.slice(0, 4)); })
      .finally(() => setLoading(false));

    const t = setInterval(() => setPromoIdx((p) => (p + 1) % PROMO_CARDS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">

      {/* ── Hero Header ──────────────────────────────── */}
      <div className="gradient-animated px-5 pt-12 pb-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute top-16 right-6 w-20 h-20 bg-white/10 rounded-2xl rotate-12" />
        <div className="absolute -bottom-8 left-4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="flex items-start justify-between mb-6 relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-blue-200 text-xs font-semibold mb-0.5">{greeting()},</p>
            <h1 className="text-white text-xl font-extrabold leading-tight">
              {user?.full_name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <div className="flex items-center gap-1 mt-1.5 bg-white/15 rounded-full px-3 py-1 w-fit">
              <MapPin size={11} className="text-blue-200" />
              <span className="text-blue-100 text-xs font-medium">Mumbai, Maharashtra</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Link href="/notifications"
              className="relative w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Bell size={18} className="text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white" />
            </Link>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Link href="/categories"
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-xl shadow-blue-900/20 relative z-10">
            <Search size={16} className="text-blue-400" />
            <span className="text-slate-400 text-sm flex-1">Search for a service...</span>
            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">200+ Services</span>
          </Link>
        </motion.div>
      </div>

      {/* ── Stats bar ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mx-5 -mt-1 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 grid grid-cols-3 divide-x divide-slate-100"
      >
        {STATS.map(({ icon, value, label }) => (
          <div key={label} className="flex flex-col items-center py-3.5 gap-0.5">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-extrabold text-slate-800">{value}</span>
            <span className="text-[10px] text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Promo Banner ───────────────────────────────── */}
      <div className="px-5 mt-5 overflow-hidden">
        <div className="relative h-28 rounded-2xl overflow-hidden">
          {PROMO_CARDS.map((card, i) => (
            <motion.div
              key={i}
              animate={{ opacity: promoIdx === i ? 1 : 0, x: promoIdx === i ? 0 : 30 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl p-4 flex items-center justify-between`}
            >
              <div className="relative z-10">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{card.label}</span>
                <p className="text-white font-extrabold text-base mt-0.5 leading-snug">{card.title}</p>
                <Link href="/categories"
                  className="mt-2 bg-white text-blue-600 text-xs font-black px-4 py-1.5 rounded-full inline-block shadow-md">
                  {card.cta} →
                </Link>
              </div>
              <motion.span
                animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl"
              >
                {card.emoji}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Categories ─────────────────────────────────── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-800 font-extrabold text-base">Our Services</h2>
            <p className="text-slate-400 text-xs mt-0.5">What do you need today?</p>
          </div>
          <Link href="/categories" className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full">
            See All <ChevronRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-20" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat, i) => {
              const meta = CATEGORY_META[cat.name] ?? { icon: "🔨", gradient: "from-slate-400 to-slate-500" };
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link href={`/categories/${cat.id}`}
                    className="flex flex-col items-center gap-1.5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-2xl shadow-md`}>
                      {meta.icon}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Trust badges ───────────────────────────────── */}
      <div className="px-5 mt-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Shield size={18} className="text-green-600" />, bg: "bg-green-50", label: "Verified Pros" },
            { icon: <Clock size={18} className="text-blue-600" />,   bg: "bg-blue-50",  label: "On-Time Always" },
            { icon: <Sparkles size={18} className="text-amber-500" />, bg: "bg-amber-50", label: "Top Quality" },
          ].map(({ icon, bg, label }) => (
            <div key={label} className="bg-white rounded-2xl py-3 flex flex-col items-center gap-1.5 border border-slate-100 shadow-sm">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
              <span className="text-[10px] font-bold text-slate-600 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Best Services ──────────────────────────────── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-800 font-extrabold text-base">Popular Right Now</h2>
            <p className="text-slate-400 text-xs mt-0.5">Most booked this week</p>
          </div>
          <Link href="/services" className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full">
            See All <ChevronRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-52" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
