"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Users, Wrench, CalendarCheck, IndianRupee, TrendingUp, FolderOpen, Settings, Check } from "lucide-react";
import toast from "react-hot-toast";

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
  const [platformFee, setPlatformFee] = useState("10");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).finally(() => setLoading(false));
    const saved = localStorage.getItem("helpet_platform_fee");
    if (saved) setPlatformFee(saved);
  }, []);

  function savePlatformSettings() {
    setSavingSettings(true);
    localStorage.setItem("helpet_platform_fee", platformFee);
    setTimeout(() => {
      setSavingSettings(false);
      toast.success("Platform settings saved");
    }, 400);
  }

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

      {/* Platform Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
            <Settings size={16} className="text-violet-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-700 text-sm">Platform Settings</h2>
            <p className="text-xs text-slate-400">Configure fees applied to every booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform Fee (%)</label>
            <div className="relative">
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                min="0"
                max="50"
                placeholder="10"
                className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Deducted from provider payout. e.g. ₹1000 booking → ₹{Math.round(1000 * (1 - Number(platformFee || 0) / 100))} to provider
            </p>
          </div>

          <div className="flex items-end">
            <div className="w-full p-3 bg-violet-50 rounded-xl border border-violet-100">
              <p className="text-xs font-semibold text-violet-700 mb-1">Summary</p>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Platform cut</span>
                <span className="font-bold text-violet-600">{platformFee || 0}%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>Provider receives</span>
                <span className="font-bold text-emerald-600">{100 - Number(platformFee || 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={savePlatformSettings}
          disabled={savingSettings}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {savingSettings ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Check size={14} /> Save Settings</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
