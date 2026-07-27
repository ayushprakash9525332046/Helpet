"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Notification } from "@/lib/types";
import { Bell, CheckCheck, Calendar, CreditCard, Star, Info, BellOff } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  booking:  { icon: <Calendar size={15} />,    color: "text-blue-600",   bg: "bg-blue-100" },
  payment:  { icon: <CreditCard size={15} />,  color: "text-green-600",  bg: "bg-green-100" },
  review:   { icon: <Star size={15} />,        color: "text-amber-600",  bg: "bg-amber-100" },
  general:  { icon: <Info size={15} />,        color: "text-slate-500",  bg: "bg-slate-100" },
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications/my").then((r) => setNotifications(r.data)).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  const grouped: Record<string, Notification[]> = {};
  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const key = d.toDateString() === today.toDateString() ? "Today"
      : d.toDateString() === yesterday.toDateString() ? "Yesterday"
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-6 md:pb-16">
      {/* Header */}
      <div className="bg-white border-b border-line">
        <div className="container-fluid pt-6 pb-5 md:pt-8 md:pb-6 flex items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h1 className="text-ink text-2xl md:text-3xl font-bold tracking-tight">Notifications</h1>
            {unread > 0 && (
              <p className="text-ink-soft text-sm mt-1">{unread} unread</p>
            )}
          </motion.div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors shrink-0"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="container-fluid">
        <div className="pb-12 pt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton rounded-xl h-24" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 md:py-32 bg-white rounded-2xl border border-dashed border-line"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 md:w-32 md:h-32 bg-[#FAFAFA] border border-line rounded-full flex items-center justify-center mb-6"
              >
                <BellOff size={40} className="text-slate-300 md:w-16 md:h-16" />
              </motion.div>
              <p className="text-ink font-bold text-lg md:text-xl tracking-tight">All caught up!</p>
              <p className="text-ink-soft text-sm mt-2 text-center max-w-xs leading-relaxed">No new notifications right now. We&apos;ll let you know when something important happens.</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([group, items], gi) => (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.1 }}
                >
                  <p className="text-xs font-semibold text-ink-soft mb-3 px-1">{group}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <AnimatePresence>
                      {items.map((n, i) => {
                        const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
                        return (
                          <motion.button
                            key={n.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => !n.is_read && markRead(n.id)}
                            className={`group flex items-start gap-4 md:gap-6 p-4 md:p-5 rounded-xl border text-left transition-colors w-full relative overflow-hidden ${
                              n.is_read
                                ? "bg-white border-line hover:bg-[#FAFAFA]"
                                : "bg-brand-50 border-brand-200"
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm md:text-base font-semibold leading-tight ${n.is_read ? "text-slate-700" : "text-slate-900"}`}>
                                {n.title}
                              </p>
                              <p className="text-sm text-ink-soft mt-1 leading-relaxed">{n.message}</p>
                              <p className="text-xs text-ink-soft mt-2">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.is_read && (
                              <div className="w-2.5 h-2.5 bg-brand-600 rounded-full mt-1.5 shrink-0" />
                            )}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
