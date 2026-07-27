"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  User, ChevronRight, LogOut, Settings, Shield,
  CalendarCheck, FileText, HelpCircle, Camera,
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
    <div className="flex flex-col min-h-screen bg-white pb-6 md:pb-16">
      {/* Header */}
      <div className="bg-white border-b border-line">
        <div className="container-fluid max-w-2xl pt-6 pb-5 md:pt-8 md:pb-6">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-ink text-2xl md:text-3xl font-bold tracking-tight"
          >
            Your profile
          </motion.h1>
        </div>
      </div>

      <div className="container-fluid max-w-2xl">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.25 }}
          className="mt-6 bg-white rounded-2xl p-5 md:p-6 border border-line flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6"
        >
          <div className="relative group">
            <Avatar
              src={user?.profile_picture?.startsWith("http") ? user.profile_picture : user?.profile_picture ? `${API_BASE}${user.profile_picture}` : null}
              name={user?.full_name}
              size="w-16 h-16 md:w-20 md:h-20"
              radius="rounded-[20px] md:rounded-[24px]"
              textSize="text-2xl md:text-3xl"
              className="ring-2 ring-line"
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
            <h2 className="font-bold text-ink text-lg md:text-xl lg:text-2xl tracking-tight leading-tight mb-1.5 md:mb-1.5">
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
              <span className="inline-block text-[11px] font-medium bg-brand-50 text-brand-700 px-2.5 py-1 capitalize rounded-md">
                {user?.role}
              </span>
              <span className="inline-block text-[11px] font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                Verified User
              </span>
            </div>
          </div>
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
              <p className="text-xs font-semibold text-ink-soft mb-2.5 px-1">
                {group.title}
              </p>
              <div className="bg-white rounded-xl border border-line overflow-hidden divide-y divide-line">
                {group.items.map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#FAFAFA] group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-brand-50 flex items-center justify-center">
                      <Icon size={16} className="text-brand-600" strokeWidth={1.75} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-ink">
                      {label}
                    </span>
                    <ChevronRight
                      size={15}
                      className="text-ink-soft group-hover:translate-x-0.5 transition-transform"
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
            className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-white text-red-600 font-medium py-3.5 rounded-xl border border-line hover:bg-red-50 transition-colors text-sm"
          >
            <LogOut size={15} />
            Log out
          </motion.button>

          <p className="text-center text-ink-soft text-xs mt-6">
            Helpet v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
