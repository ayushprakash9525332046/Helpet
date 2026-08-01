"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Users, Wrench, CalendarCheck, IndianRupee, TrendingUp, FolderOpen } from "lucide-react";

interface Stats {
  total_users: number;
  total_bookings: number;
  total_services: number;
  total_revenue: number;
}

const CARDS = [
  {
    key: "total_users" as keyof Stats,
    label: "Total Users",
    icon: Users,
    color: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "total_bookings" as keyof Stats,
    label: "Total Bookings",
    icon: CalendarCheck,
    color: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-600",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "total_services" as keyof Stats,
    label: "Active Services",
    icon: Wrench,
    color: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-600",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "total_revenue" as keyof Stats,
    label: "Total Revenue",
    icon: IndianRupee,
    color: "bg-green-500",
    light: "bg-green-50",
    text: "text-green-600",
    format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          const value = stats?.[card.key] ?? 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${card.light} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={card.text} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} />
                  Live
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-800">{card.format(value)}</p>
              )}
              <p className="text-slate-500 text-xs font-medium mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/users",      label: "Manage Users",  Icon: Users },
            { href: "/admin/categories", label: "Add Category",  Icon: FolderOpen },
            { href: "/admin/services",   label: "Add Service",   Icon: Wrench },
            { href: "/admin/bookings",   label: "View Bookings", Icon: CalendarCheck },
          ].map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all text-center"
            >
              <Icon size={22} className="text-blue-500" />
              <span className="text-xs font-semibold text-slate-600">{label}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
