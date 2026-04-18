"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  User, ChevronRight, LogOut, Settings, Shield,
  CalendarCheck, FileText, HelpCircle, Star,
  Package, MessageSquare, Camera,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setAvatarUploading(true);
    try {
      const { data } = await api.post("/users/me/avatar", formData);
      updateUser(data);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const menuGroups = [
    {
      title: "Account",
      items: [
        { icon: User,          label: "Edit Profile",      href: "/profile/edit",      color: "bg-blue-100 text-blue-600" },
        // { icon: Lock,          label: "Change Password",   href: "/profile/password",  color: "bg-purple-100 text-purple-600" },
        // { icon: MapPin,        label: "My Addresses",      href: "/profile/addresses", color: "bg-green-100 text-green-600" },
      ],
    },
    {
      title: "Activity",
      items: [
        { icon: CalendarCheck, label: "My Bookings",       href: "/bookings",          color: "bg-amber-100 text-amber-600" },
        // { icon: Star,          label: "My Reviews",        href: "/reviews",           color: "bg-yellow-100 text-yellow-600" },
        { icon: Shield,        label: "Privacy Policy",    href: "/privacy",           color: "bg-pink-100 text-pink-600" },
        { icon: FileText,      label: "Terms & Conditions",href: "/terms",             color: "bg-indigo-100 text-indigo-600" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle,    label: "Help & Support",    href: "/support",           color: "bg-teal-100 text-teal-600" },
        { icon: Settings,      label: "Settings",          href: "/profile/edit",      color: "bg-slate-100 text-slate-600" },
      ],
    },
  ];

  const initial = user?.full_name?.[0]?.toUpperCase() ?? "U";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6 md:pb-16">
      {/* Header */}
      <div className="gradient-animated px-5 pt-10 pb-16 md:pt-12 md:pb-24 relative overflow-hidden md:rounded-b-[32px] lg:rounded-b-[40px]">
        <div className="absolute -top-10 -right-10 w-48 h-48 md:w-80 md:h-80 bg-white/10 rounded-full" />
        <div className="absolute top-8 right-16 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-2xl rotate-12" />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-fluid relative z-10 max-w-2xl"
        >
          <p className="text-blue-200 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-1 md:mb-1.5">
            Your Account
          </p>
          <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
            My Profile
          </h1>
        </motion.div>
      </div>

      <div className="container-fluid max-w-2xl">
        {/* Avatar card — overlaps header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="-mt-10 md:-mt-12 bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-6 shadow-2xl shadow-blue-900/10 border border-white flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6 relative z-10"
        >
          <div className="relative group">
            <Avatar
              src={user?.profile_picture?.startsWith("http") ? user.profile_picture : user?.profile_picture ? `${API_BASE}${user.profile_picture}` : null}
              name={user?.full_name}
              size="w-16 h-16 md:w-20 md:h-20"
              radius="rounded-[20px] md:rounded-[24px]"
              textSize="text-2xl md:text-3xl"
              className="shadow-2xl shadow-blue-200 ring-4 ring-white"
            />
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-white shadow-md cursor-pointer"
            >
              {avatarUploading ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={13} className="text-white" />
              )}
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-black text-slate-800 text-lg md:text-xl lg:text-2xl tracking-tight leading-tight mb-1.5 md:mb-1.5">
              {user?.full_name}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-4">
              <p className="text-slate-500 text-xs md:text-sm font-bold flex items-center gap-1.5">
                <span className="w-1 h-1 bg-blue-500 rounded-full" />{" "}
                {user?.phone}
              </p>
              {user?.email && (
                <p className="text-slate-400 text-[10px] md:text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />{" "}
                  {user?.email}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-3 md:mt-3.5">
              <span className="inline-block text-[8px] md:text-[9px] font-black bg-blue-100 text-blue-700 px-2.5 py-1 md:px-3 md:py-1 rounded-md uppercase tracking-widest shadow-sm">
                {user?.role}
              </span>
              <span className="inline-block text-[8px] md:text-[9px] font-black bg-green-100 text-green-700 px-2.5 py-1 md:px-3 md:py-1 rounded-md uppercase tracking-widest shadow-sm">
                Verified User
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-4 md:mt-5 bg-white rounded-2xl md:rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-50 grid grid-cols-3 divide-x divide-slate-100 overflow-hidden"
        >
          {[
            {
              value: "12",
              label: "Bookings",
              icon: Package,
              color: "bg-blue-50 text-blue-600",
            },
            {
              value: "4.8",
              label: "Avg Rating",
              icon: Star,
              color: "bg-amber-50 text-amber-600",
            },
            {
              value: "3",
              label: "Reviews",
              icon: MessageSquare,
              color: "bg-purple-50 text-purple-600",
            },
          ].map(({ value, label, icon: Icon, color }) => (
            <div
              key={label}
              className="flex flex-col items-center py-4 md:py-5 gap-1 hover:bg-slate-50 transition-colors group"
            >
              <div
                className={`w-8 h-8 md:w-10 md:h-10 ${color} rounded-lg md:rounded-xl flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform`}
              >
                <Icon size={14} className="md:w-4 md:h-4" />
              </div>
              <span className="text-base md:text-lg font-black text-slate-800 tracking-tight">
                {value}
              </span>
              <span className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Menu groups */}
        <div className="mt-6 md:mt-8 space-y-6 md:space-y-8">
          {menuGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + gi * 0.1 }}
            >
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 px-2">
                {group.title}
              </p>
              <div className="bg-white rounded-2xl md:rounded-[24px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                {group.items.map(({ icon: Icon, label, href, color }, i) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3.5 md:gap-4 px-4 py-3.5 md:px-5 md:py-4 hover:bg-slate-50 group transition-all duration-300"
                  >
                    <div
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all ${color}`}
                    >
                      <Icon size={14} className="md:w-4 md:h-4" />
                    </div>
                    <span className="flex-1 text-xs md:text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors tracking-tight">
                      {label}
                    </span>
                    <ChevronRight
                      size={12}
                      className="text-slate-300 group-hover:translate-x-1 transition-all md:w-4 md:h-4"
                    />
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-8 md:mt-10 mb-8 md:mb-10">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full max-w-xs mx-auto bg-red-50 text-red-600 font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl shadow-red-100/50 text-xs md:text-sm"
          >
            <LogOut size={16} className="md:w-4 md:h-4" />
            Sign Out Account
          </motion.button>

          <p className="text-center text-slate-400 text-[9px] md:text-[11px] font-bold mt-6 md:mt-8 opacity-60">
            Helpet v1.0.0 · Professional Home Services
          </p>
        </div>
      </div>
    </div>
  );
}
