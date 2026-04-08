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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6 md:pb-16">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-24 md:pt-16 md:pb-32 relative overflow-hidden md:rounded-b-[48px] lg:rounded-b-[64px]">
        <div className="absolute -top-10 -right-10 w-48 h-48 md:w-96 md:h-96 bg-white/10 rounded-full" />
        <div className="absolute top-8 right-16 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-2xl rotate-12" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="container-fluid relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <p className="text-blue-200 text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-2">Stay Updated</p>
            <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight">Notifications</h1>
            {unread > 0 && (
              <p className="text-blue-100 text-sm md:text-lg mt-2 md:mt-3 opacity-90">{unread} unread message{unread !== 1 ? "s" : ""} waiting for you</p>
            )}
          </div>
          {unread > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllRead}
              className="flex items-center gap-2 md:gap-3 bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-black px-5 py-2.5 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl border border-white/30 shadow-xl self-start md:self-end"
            >
              <CheckCheck size={18} className="md:w-5 md:h-5" /> Mark all as read
            </motion.button>
          )}
        </motion.div>
      </div>

      <div className="container-fluid">
        {/* Unread badge pill — overlaps header */}
        {unread > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="-mt-10 md:-mt-16 relative z-20"
          >
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 border border-white px-6 py-4 md:px-8 md:py-6 flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Bell size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-sm md:text-xl font-black text-slate-800 tracking-tight">
                  You have <span className="text-blue-600">{unread} unread</span> notification{unread !== 1 ? "s" : ""}
                </p>
                <p className="hidden md:block text-slate-400 text-base font-medium mt-1">Keep track of your bookings and service updates.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className={`pb-12 ${unread > 0 ? "pt-8 md:pt-12" : "-mt-12 md:-mt-20 pt-0 relative z-20"}`}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton rounded-[32px] h-24 md:h-32" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 md:py-32 bg-white rounded-[40px] border border-dashed border-slate-200"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner"
              >
                <BellOff size={40} className="text-slate-300 md:w-16 md:h-16" />
              </motion.div>
              <p className="text-slate-800 font-black text-xl md:text-3xl tracking-tight">All caught up!</p>
              <p className="text-slate-400 text-sm md:text-lg mt-3 md:mt-4 text-center max-w-xs md:max-w-md font-medium leading-relaxed">No new notifications right now. We&apos;ll let you know when something important happens.</p>
            </motion.div>
          ) : (
            <div className="space-y-10 md:space-y-16">
              {Object.entries(grouped).map(([group, items], gi) => (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.1 }}
                >
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6 px-2">{group}</p>
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
                            className={`group flex items-start gap-4 md:gap-6 p-5 md:p-8 rounded-[32px] border-2 text-left transition-all w-full relative overflow-hidden ${
                              n.is_read
                                ? "bg-white border-slate-50 hover:bg-slate-50 hover:border-slate-100"
                                : "bg-blue-50/40 border-blue-100 shadow-xl shadow-blue-100/20 hover:bg-blue-50/60"
                            }`}
                          >
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500 ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-base md:text-xl font-black leading-tight tracking-tight ${n.is_read ? "text-slate-700" : "text-slate-900"}`}>
                                {n.title}
                              </p>
                              <p className="text-sm md:text-lg text-slate-500 mt-2 leading-relaxed font-medium">{n.message}</p>
                              <p className="text-[10px] md:text-sm text-slate-400 mt-3 md:mt-4 font-bold uppercase tracking-widest">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.is_read && (
                              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded-full mt-2 md:mt-3 shrink-0 animate-pulse shadow-lg shadow-blue-400" />
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
