"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import {
  User, ChevronRight, LogOut, Settings, Shield,
  CalendarCheck, MapPin, Lock, FileText, HelpCircle, Star, Edit3,
} from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const menuGroups = [
    {
      title: "Account",
      items: [
        { icon: User,          label: "Edit Profile",      href: "/profile/edit",      color: "bg-blue-100 text-blue-600" },
        { icon: Lock,          label: "Change Password",   href: "/profile/password",  color: "bg-purple-100 text-purple-600" },
        { icon: MapPin,        label: "My Addresses",      href: "/profile/addresses", color: "bg-green-100 text-green-600" },
      ],
    },
    {
      title: "Activity",
      items: [
        { icon: CalendarCheck, label: "My Bookings",       href: "/bookings",          color: "bg-amber-100 text-amber-600" },
        { icon: Star,          label: "My Reviews",        href: "/reviews",           color: "bg-yellow-100 text-yellow-600" },
        { icon: Shield,        label: "Privacy Policy",    href: "/privacy",           color: "bg-pink-100 text-pink-600" },
        { icon: FileText,      label: "Terms & Conditions",href: "/terms",             color: "bg-indigo-100 text-indigo-600" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle,    label: "Help & Support",    href: "/support",           color: "bg-teal-100 text-teal-600" },
        { icon: Settings,      label: "Settings",          href: "/settings",          color: "bg-slate-100 text-slate-600" },
      ],
    },
  ];

  const initial = user?.full_name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute top-8 right-16 w-16 h-16 bg-white/10 rounded-2xl rotate-12" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-blue-200 text-xs font-semibold mb-1">Your Account</p>
          <h1 className="text-white text-2xl font-extrabold">My Profile</h1>
        </motion.div>
      </div>

      {/* Avatar card — overlaps header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mx-5 -mt-14 bg-white rounded-3xl p-5 shadow-xl border border-white/60 flex items-center gap-4 relative z-10"
      >
        <div className="relative">
          <div className="w-18 h-18 bg-linear-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-blue-200">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-800 text-lg leading-snug">{user?.full_name}</p>
          <p className="text-slate-400 text-sm mt-0.5">{user?.phone}</p>
          {user?.email && <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>}
          <span className="inline-block mt-1.5 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
        <Link href="/profile/edit">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"
          >
            <Edit3 size={16} className="text-blue-600" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="mx-5 mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 grid grid-cols-3 divide-x divide-slate-100"
      >
        {[
          { value: "12", label: "Bookings" },
          { value: "4.8", label: "Avg Rating" },
          { value: "3", label: "Reviews" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-3.5 gap-0.5">
            <span className="text-base font-extrabold text-slate-800">{value}</span>
            <span className="text-[10px] text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Menu groups */}
      <div className="px-5 mt-5 flex flex-col gap-4">
        {menuGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + gi * 0.07 }}
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{group.title}</p>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {group.items.map(({ icon: Icon, label, href, color }, i) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors ${
                    i < group.items.length - 1 ? "border-b border-slate-50" : ""
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
                  <ChevronRight size={15} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border-2 border-red-100 mt-1"
        >
          <LogOut size={17} />
          Sign Out
        </motion.button>

        <p className="text-center text-slate-400 text-xs pb-2">ApnaSewa v1.0.0 · Made with ❤️ in India</p>
      </div>

      <BottomNav />
    </div>
  );
}
