"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Service, ServiceCategory } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import ServiceCard from "@/components/ServiceCard";
import { Bell, Search, ChevronRight, Sparkles, Shield, Clock, LocateFixed, Grid2X2, Users, CheckCircle2, Star, Home as HomeIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveCategoryImage(url?: string) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null; // emoji or unknown — use fallback
}

const STATS = [
  { icon: Users, value: "2,000+", label: "Professionals", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: CheckCircle2, value: "50K+",   label: "Jobs Done", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Star, value: "4.9",    label: "Avg Rating", color: "text-amber-500", bg: "bg-amber-50" },
];

const PROMO_CARDS = [
  { gradient: "from-rose-500 to-orange-500",   emoji: "🎁", label: "SPECIAL OFFER",   title: "Flat ₹200 off on first cleaning",  cta: "Claim Now" },
  { gradient: "from-emerald-500 to-teal-600",  emoji: "✨", label: "TOP RATED",      title: "Trusted by 10,000+ households",    cta: "Explore" },
  { gradient: "from-blue-500 to-cyan-500",     emoji: "🛡️", label: "SECURE BOOKING", title: "100% Satisfaction Guaranteed",     cta: "Book Safe" },
];

export default function Home() {
  const { user, updateUser } = useAuth();
  const [categories, setCategories]   = useState<ServiceCategory[]>([]);
  const [services, setServices]       = useState<Service[]>([]);
  const [loading, setLoading]         = useState(true);
  const [promoIdx, setPromoIdx]       = useState(0);
  const [location, setLocation]       = useState(user?.city || "Tap to detect location");
  const [locLoading, setLocLoading]   = useState(false);

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
          const a     = data.address ?? {};
          const city  = a.city || a.town || a.village || a.county || "";
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
        setLocation(user?.city || "Tap to detect location");
        setLocLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    Promise.all([api.get("/services/categories"), api.get("/services/")])
      .then(([cat, svc]) => { setCategories(cat.data.slice(0, 8)); setServices(svc.data.slice(0, 4)); })
      .finally(() => setLoading(false));

    const t = setInterval(() => setPromoIdx((p) => (p + 1) % PROMO_CARDS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6 md:pb-12">

      {/* ── Hero Header ──────────────────────────────── */}
      <div className="gradient-animated px-5 md:px-6 pt-10 pb-6 md:py-8 lg:py-10 relative overflow-hidden md:rounded-b-[24px] lg:rounded-b-[32px]">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 md:w-60 md:h-60 bg-white/10 rounded-full" />
        <div className="absolute top-12 right-6 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-2xl rotate-12" />
        <div className="absolute -bottom-6 left-4 w-24 h-24 md:w-40 md:h-40 bg-white/5 rounded-full" />

        <div className="container-fluid relative z-10">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-blue-200 text-xs font-semibold mb-0.5">{greeting()},</p>
              <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight">
                {user?.full_name?.split(" ")[0] ?? "there"} 👋
              </h1>
              <button
                onClick={fetchLocation}
                disabled={locLoading}
                className="flex items-center gap-1.5 mt-1.5 md:mt-2 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 md:px-3.5 md:py-1 transition-all"
              >
                {locLoading ? (
                  <span className="w-2 h-2 border border-blue-200/50 border-t-blue-100 rounded-full animate-spin" />
                ) : (
                  <LocateFixed size={10} className="text-blue-200" />
                )}
                <span className="text-blue-100 text-xs font-medium">{location}</span>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.1 }}
              className="md:hidden"
            >
              <Link href="/notifications"
                className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <Bell size={20} className="text-white" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-white" />
              </Link>
            </motion.div>
          </div>

          {/* Search (Mobile Only - Desktop has it in TopNav) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }}
            className="md:hidden"
          >
            <Link href="/categories"
              className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-xl shadow-blue-900/20 relative z-10">
              <Search size={18} className="text-blue-400" />
              <span className="text-slate-400 text-sm flex-1">Search for a service...</span>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-3 py-1 rounded-full uppercase tracking-wider">200+ Services</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Stats & Promo Section ─────────────────────── */}
      <div className="container-fluid -mt-4 md:-mt-6 relative z-20">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* Promo Carousel */}
          <div className="lg:flex-[1.8] order-2 lg:order-1 relative group">
            <div className="relative h-28 md:h-32 lg:h-full min-h-[140px] lg:min-h-[160px] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence initial={false}>
                {PROMO_CARDS.map((card, i) =>
                  promoIdx === i ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                      className={`absolute inset-0 bg-linear-to-r ${card.gradient} p-5 md:p-6 lg:p-10 flex items-center justify-between overflow-hidden`}
                    >
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
                      
                      <div className="relative z-10 max-w-[70%]">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-2 mb-2"
                        >
                          <span className="text-[8px] lg:text-[10px] font-black text-white/90 uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                            {card.label}
                          </span>
                          <div className="h-px w-8 bg-white/30" />
                        </motion.div>
                        
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-white font-black text-lg md:text-xl lg:text-2xl leading-tight drop-shadow-sm mb-4 lg:mb-6"
                        >
                          {card.title}
                        </motion.p>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Link href="/categories"
                            className="bg-white text-blue-600 text-[10px] md:text-xs font-black px-5 py-2 lg:px-8 lg:py-3 rounded-xl inline-flex items-center gap-2 shadow-xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-300">
                            {card.cta} <ChevronRight size={14} />
                          </Link>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="relative z-10 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150" />
                        <motion.span
                          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="text-5xl md:text-7xl lg:text-9xl drop-shadow-2xl filter contrast-125"
                        >
                          {card.emoji}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>

              {/* Progress Indicators (Dots) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 p-1.5 bg-black/10 backdrop-blur-md rounded-full border border-white/5">
                {PROMO_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPromoIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      promoIdx === i ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:flex-1 order-1 lg:order-2 bg-white rounded-xl md:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 grid grid-cols-3 divide-x divide-slate-100 h-fit lg:h-full"
          >
            {STATS.map(({ icon: Icon, value, label, color, bg }) => (
              <div key={label} className="flex flex-col items-center justify-center py-4 md:py-6 lg:py-8 gap-2 group/stat cursor-default transition-colors hover:bg-slate-50/50 first:rounded-l-xl last:rounded-r-xl">
                <div className={`w-9 h-9 md:w-12 md:h-12 ${bg} rounded-full flex items-center justify-center ${color} mb-1 group-hover/stat:scale-110 transition-transform duration-300 shadow-inner`}>
                  <Icon size={18} className="md:w-6 md:h-6" fill={label.includes("Rating") ? "currentColor" : "none"} />
                </div>
                <div className="text-center">
                  <span className="text-sm md:text-xl lg:text-2xl font-black text-slate-800 block leading-none">{value}</span>
                  <span className="text-[7px] md:text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1.5 block">{label}</span>
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      <div className="container-fluid">
        {/* ── Categories ─────────────────────────────────── */}
        <div className="mt-10 md:mt-12">
          <div className="flex items-end justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-slate-800 font-black text-xl md:text-2xl lg:text-3xl tracking-tight">Our Services</h2>
              <p className="text-slate-400 text-sm md:text-base mt-0.5 md:mt-1">Professional help for every task</p>
            </div>
            <Link href="/categories" className="flex items-center gap-1.5 text-blue-600 text-xs md:text-sm font-bold bg-blue-50 hover:bg-blue-100 px-4 py-1.5 md:px-5 md:py-2 rounded-xl transition-all">
              See All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton rounded-2xl md:rounded-[24px] h-24 md:h-32 lg:h-36" />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 lg:gap-6">
              {categories.map((cat, i) => {
                const imgSrc = resolveCategoryImage(cat.icon);
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link href={`/categories/${cat.id}`} className="flex flex-col items-center gap-2 group">
                      <div className="w-full aspect-square rounded-2xl md:rounded-[24px] overflow-hidden bg-white shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                        {imgSrc ? (
                          <img src={imgSrc} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          (() => {
                            const Icon = getServiceIcon(cat.name);
                            return <Icon size={24} className="text-slate-300 md:w-8 md:h-8" />;
                          })()
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-600 text-center leading-tight group-hover:text-blue-600 transition-colors">
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
        <div className="mt-12 md:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { icon: <Shield size={24} className="text-green-600 md:w-8 md:h-8" />, bg: "bg-green-50", label: "Verified Pros", desc: "Every professional is background checked and verified for your safety." },
              { icon: <Clock size={24} className="text-blue-600 md:w-8 md:h-8" />,   bg: "bg-blue-50",  label: "On-Time Always", desc: "We value your time. If we're late, you get a discount on your service." },
              { icon: <Sparkles size={24} className="text-amber-500 md:w-8 md:h-8" />, bg: "bg-amber-50", label: "Top Quality", desc: "Our professionals are experts in their fields, ensuring best-in-class results." },
            ].map(({ icon, bg, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl md:rounded-[32px] p-6 md:p-10 flex flex-row md:flex-col items-center md:items-start text-left gap-5 md:gap-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 md:w-20 md:h-20 ${bg} rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>{icon}</div>
                <div>
                  <span className="text-sm md:text-lg font-black text-slate-800 block uppercase tracking-wider md:tracking-normal md:capitalize">{label}</span>
                  <p className="text-xs md:text-sm text-slate-400 font-medium mt-1 md:mt-3 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Best Services ──────────────────────────────── */}
        <div className="mt-16 md:mt-24 mb-6 md:mb-12">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-slate-800 font-black text-xl md:text-2xl lg:text-3xl tracking-tight">Popular Services</h2>
              <p className="text-slate-400 text-sm md:text-base mt-1 md:mt-2">High-rated services by customers</p>
            </div>
            <Link href="/services" className="flex items-center gap-2 text-blue-600 text-xs md:text-sm font-bold bg-blue-50 hover:bg-blue-100 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl transition-all">
              See All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl md:rounded-[32px] h-64 md:h-80" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {services.map((svc, i) => <ServiceCard key={svc.id} service={svc} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* BottomNav removed as it's now handled by AppShell */}
    </div>
  );
}
