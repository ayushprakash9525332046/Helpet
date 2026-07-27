"use client";

import { useEffect, useState, createElement } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import { CalendarCheck, ChevronRight, Clock, MapPin } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", dot: "bg-brand-500",  badge: "bg-brand-50 text-brand-700" },
  ongoing:   { label: "Ongoing",   dot: "bg-brand-500",  badge: "bg-brand-50 text-brand-700" },
  completed: { label: "Completed", dot: "bg-green-500",  badge: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", dot: "bg-red-400",    badge: "bg-red-50 text-red-600" },
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
    <div className="flex flex-col min-h-screen bg-white pb-6 md:pb-16">
      {/* Header */}
      <div className="bg-white border-b border-line">
        <div className="container-fluid pt-6 pb-4 md:pt-8 md:pb-5">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h1 className="text-ink text-2xl md:text-3xl font-bold tracking-tight">Your bookings</h1>
            <p className="text-ink-soft text-sm mt-1">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} so far
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto mt-4 -mb-px">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium capitalize whitespace-nowrap border transition-colors ${
                  tab === t
                    ? "bg-brand-50 border-brand-600 text-brand-700"
                    : "bg-white border-line text-ink-soft hover:border-brand-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="pt-6 md:pt-8 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton rounded-xl h-36" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 md:py-28 text-center"
            >
              <div className="w-16 h-16 bg-[#FAFAFA] border border-line rounded-2xl flex items-center justify-center mb-5">
                <CalendarCheck size={28} className="text-ink-soft" />
              </div>
              <p className="text-ink font-semibold text-lg capitalize">
                No {tab === "all" ? "" : tab} bookings yet
              </p>
              <p className="text-ink-soft text-sm mt-1.5 max-w-xs">
                Book your first service and it will show up here.
              </p>
              <Link
                href="/categories"
                className="mt-6 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3 rounded-xl inline-block transition-colors active:scale-[0.98]"
              >
                Browse services
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div key={tab} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {filtered.map((booking, i) => {
                  const status = STATUS_CONFIG[booking.status];
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="group block bg-white rounded-xl p-4 md:p-5 border border-line hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                            {createElement(getServiceIcon(booking.service.name), {
                              size: 22,
                              className: "text-brand-500",
                              strokeWidth: 1.75,
                            })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-ink text-sm md:text-base leading-snug line-clamp-1">
                                {booking.service.name}
                              </p>
                              <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md shrink-0 ${status.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                              </span>
                            </div>
                            <p className="flex items-center gap-1 text-ink-soft text-xs mt-1 line-clamp-1">
                              <MapPin size={11} className="shrink-0" />
                              {booking.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-line">
                          <span className="flex items-center gap-1.5 text-ink-soft text-xs md:text-sm">
                            <Clock size={13} className="text-brand-600" />
                            {formatDate(booking.scheduled_at)} · {formatTime(booking.scheduled_at)}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-ink font-bold text-sm md:text-base">₹{booking.total_amount}</span>
                            <ChevronRight size={16} className="text-ink-soft group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                          </span>
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
    </div>
  );
}
