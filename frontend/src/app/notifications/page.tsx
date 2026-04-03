"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Notification } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-blue-200 text-xs font-semibold mb-1">Stay Updated</p>
            <h1 className="text-white text-2xl font-extrabold">Notifications</h1>
            {unread > 0 && (
              <p className="text-blue-200 text-sm mt-1">{unread} unread message{unread !== 1 ? "s" : ""}</p>
            )}
          </div>
          {unread > 0 && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={markAllRead}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 mt-1"
            >
              <CheckCheck size={13} /> Mark all read
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Unread badge pill — overlaps header */}
      {unread > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mx-5 -mt-5 relative z-10"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bell size={15} className="text-white" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              You have <span className="text-blue-600">{unread} unread</span> notification{unread !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>
      )}

      <div className={`px-5 ${unread > 0 ? "pt-4" : "pt-5 -mt-4"}`}>
        {loading ? (
          <div className="flex flex-col gap-3 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-20" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 mt-4"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"
            >
              <BellOff size={32} className="text-slate-300" />
            </motion.div>
            <p className="text-slate-700 font-bold text-base">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No new notifications right now</p>
          </motion.div>
        ) : (
          <div className="mt-4 space-y-5">
            {Object.entries(grouped).map(([group, items], gi) => (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.08 }}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{group}</p>
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {items.map((n, i) => {
                      const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
                      return (
                        <motion.button
                          key={n.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => !n.is_read && markRead(n.id)}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all w-full ${
                            n.is_read
                              ? "bg-white border-slate-100"
                              : "bg-blue-50/60 border-blue-200/60 shadow-sm shadow-blue-100"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-snug ${n.is_read ? "text-slate-600" : "text-slate-800"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
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

      <BottomNav />
    </div>
  );
}
