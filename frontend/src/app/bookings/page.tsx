"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import { CalendarCheck, ChevronRight, Clock, MapPin } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
  ongoing:   { label: "Ongoing",   dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  completed: { label: "Completed", dot: "bg-green-500",  badge: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", dot: "bg-red-400",    badge: "bg-red-100 text-red-600" },
};

const ICONS: Record<string, string> = {
  clean:"🧹",plumb:"🔧",electr:"⚡",carp:"🪚",paint:"🎨",ac:"❄️",salon:"✂️",pest:"🐛",repair:"🔩",
};
function getIcon(name: string) {
  const n = (name ?? "").toLowerCase();
  for (const [k,v] of Object.entries(ICONS)) if (n.includes(k)) return v;
  return "🏠";
}

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
    api.get("/bookings/my").then((r) => setBookings(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-6 right-16 w-12 h-12 bg-white/10 rounded-xl rotate-12" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-blue-200 text-xs font-semibold mb-1">Track Your</p>
          <h1 className="text-white text-2xl font-extrabold">My Bookings</h1>
          <p className="text-blue-200 text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>
        </motion.div>
      </div>

      {/* Tabs — overlaps header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mx-5 -mt-6 relative z-10 bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-white p-1.5"
      >
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileTap={{ scale: 0.93 }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                tab === t ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="px-5 pt-5">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"
            >
              <CalendarCheck size={36} className="text-slate-300" />
            </motion.div>
            <p className="text-slate-700 font-bold text-base">No {tab === "all" ? "" : tab} bookings yet</p>
            <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
              Browse services and book your first appointment
            </p>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-6">
              <Link
                href="/categories"
                className="bg-blue-600 text-white text-sm font-bold px-8 py-3 rounded-2xl inline-block shadow-lg shadow-blue-200"
              >
                Explore Services →
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div key={tab} className="flex flex-col gap-3">
              {filtered.map((booking, i) => {
                const status = STATUS_CONFIG[booking.status];
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="block bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            {getIcon("service")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Service Booking</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-slate-400" />
                              <p className="text-slate-400 text-xs line-clamp-1 max-w-35">{booking.address}</p>
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${status.badge}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock size={12} className="text-blue-400" />
                          <span>{formatDate(booking.scheduled_at)} · {formatTime(booking.scheduled_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-600 font-extrabold text-sm">₹{booking.total_amount}</span>
                          <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                            <ChevronRight size={13} className="text-blue-400" />
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

      <BottomNav />
    </div>
  );
}
