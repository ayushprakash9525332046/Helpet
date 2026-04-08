"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import { CalendarCheck, ChevronRight, Clock, MapPin, IndianRupee } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
  ongoing:   { label: "Ongoing",   dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  completed: { label: "Completed", dot: "bg-green-500",  badge: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", dot: "bg-red-400",    badge: "bg-red-100 text-red-600" },
};

const TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.get("/bookings/my").then((r) => {
      const sorted = [...r.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(sorted);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6 md:pb-16">
      {/* Header */}
      <div className="gradient-animated px-5 md:px-12 pt-12 pb-14 md:py-12 lg:py-14 relative overflow-hidden md:rounded-b-[32px] lg:rounded-b-[40px]">
        <div className="absolute -top-8 -right-8 w-40 h-40 md:w-80 md:h-80 bg-white/10 rounded-full" />
        <div className="absolute top-6 right-16 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-xl rotate-12" />
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="container-fluid relative z-10"
        >
          <p className="text-blue-200 text-[10px] md:text-sm font-black mb-1 md:mb-2 uppercase tracking-widest">Track Your</p>
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-3 md:mb-4">My Bookings</h1>
          <p className="text-blue-100 text-xs md:text-base mt-2 md:mt-3 max-w-2xl leading-relaxed opacity-90">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} found in your history.</p>
        </motion.div>
      </div>

      <div className="container-fluid">
        {/* Tabs — overlaps header on mobile, standard on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="-mt-8 md:mt-10 relative z-20 bg-white rounded-xl md:rounded-[24px] shadow-2xl shadow-blue-900/10 border border-white p-2 md:p-3"
        >
          <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar scroll-smooth">
            {TABS.map((t) => (
              <motion.button
                key={t}
                onClick={() => setTab(t)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-base font-black capitalize whitespace-nowrap transition-all duration-300 ${
                  tab === t ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="pt-10 md:pt-16 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton rounded-2xl md:rounded-[32px] h-40 md:h-56" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 md:py-32 bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner"
              >
                <CalendarCheck size={48} className="text-slate-300 md:w-16 md:h-16" />
              </motion.div>
              <p className="text-slate-800 font-black text-xl md:text-2xl capitalize tracking-tight">No {tab === "all" ? "" : tab} bookings</p>
              <p className="text-slate-400 text-sm md:text-lg mt-3 text-center max-w-xs md:max-w-md font-medium leading-relaxed px-6">
                Looks like you haven&apos;t booked anything here yet.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-10 md:mt-12">
                <Link
                  href="/categories"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-lg font-black px-10 py-4 md:px-12 md:py-5 rounded-2xl md:rounded-[24px] inline-block shadow-2xl shadow-blue-200 transition-all"
                >
                  Explore Services Now →
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div key={tab} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {filtered.map((booking, i) => {
                  const status = STATUS_CONFIG[booking.status];
                  const IconComponent = getServiceIcon(booking.service.name);
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="group block bg-white rounded-2xl md:rounded-[32px] p-5 md:p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
                          <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-50 rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                            <IconComponent size={32} className="text-slate-400 md:w-10 md:h-10" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-black text-slate-800 text-sm md:text-xl group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">{booking.service.name}</p>
                              <div className={`flex items-center gap-1.5 text-[9px] md:text-xs font-black px-3 py-1.5 rounded-lg md:rounded-xl shadow-sm shrink-0 ${status.badge}`}>
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.dot}`} />
                                {status.label}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <MapPin size={12} className="text-blue-500 shrink-0" />
                              <p className="text-slate-400 text-[10px] md:text-sm font-bold line-clamp-1">{booking.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-5 md:pt-6 border-t border-slate-50">
                          <div className="flex flex-col gap-1">
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">Scheduled for</p>
                            <div className="flex items-center gap-2 text-slate-700 font-black text-xs md:text-base tracking-tight">
                              <Clock size={14} className="text-blue-600 md:w-4 md:h-4" />
                              <span>{formatDate(booking.scheduled_at)} · {formatTime(booking.scheduled_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 md:gap-5">
                            <span className="text-blue-600 font-black text-base md:text-2xl">₹{booking.total_amount}</span>
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                              <ChevronRight size={18} className="text-slate-400 group-hover:text-white md:w-6 md:h-6" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* BottomNav removed as it's now handled by AppShell */}
    </div>
  );
}
