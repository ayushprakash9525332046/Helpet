"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Grid3X3, CalendarCheck, Bell, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const tabs = [
  { href: "/home",          icon: Home,          label: "Home" },
  { href: "/categories",    icon: Grid3X3,       label: "Services" },
  { href: "/bookings",      icon: CalendarCheck, label: "Bookings" },
  { href: "/notifications", icon: Bell,          label: "Notifications" },
  { href: "/profile",       icon: User,          label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Brand / Logo */}
      <div className="px-5 py-6">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 overflow-hidden">
            <Image 
              src="/assets/helpet-logo.png" 
              alt="Helpet Logo" 
              width={32} 
              height={32} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-800 tracking-tight leading-none">
              Helpet
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Home Services
            </p>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                size={18}
                className={
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-blue-600"
                }
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="font-bold text-sm tracking-wide">
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="sidebarActive"
                  className="ml-auto w-1 h-1 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 mt-auto border-t border-slate-50">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm overflow-hidden">
              {mounted && user?.profile_picture ? (
                <img src={`${API_BASE}${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                mounted ? (user?.full_name?.charAt(0).toUpperCase() || "U") : "U"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {mounted ? (user?.full_name || "User") : "User"}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold truncate">
                {mounted ? user?.email : ""}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/profile/edit"
              className="flex items-center justify-center gap-1.5 py-1.5 bg-white rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors shadow-sm"
            >
              <Settings size={12} /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-white rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
