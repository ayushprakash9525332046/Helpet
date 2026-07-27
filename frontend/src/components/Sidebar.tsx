"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Grid3X3, CalendarCheck, Bell, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";

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
    <div className="flex flex-col h-full bg-white border-r border-line">
      {/* Brand / Logo */}
      <div className="px-5 py-6">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <Image
              src="/assets/helpet-logo-v2.png"
              alt="Helpet Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-lg text-ink tracking-tight">helpet</span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors duration-150 ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-soft hover:bg-[#FAFAFA] hover:text-ink"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-brand-600" : "text-ink-soft"}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 mt-auto border-t border-line">
        <div className="rounded-xl border border-line p-3">
          <div className="flex items-center gap-2.5 mb-3">
            {mounted && (
              <Avatar
                src={user?.profile_picture?.startsWith("http") ? user.profile_picture : user?.profile_picture ? `${API_BASE}${user.profile_picture}` : null}
                name={user?.full_name}
                size="w-8 h-8"
                radius="rounded-full"
                textSize="text-xs"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">
                {mounted ? (user?.full_name || "User") : "User"}
              </p>
              <p className="text-[11px] text-ink-soft truncate">
                {mounted ? user?.email : ""}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/profile/edit"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-ink-soft border border-line hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              <Settings size={13} /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-deal border border-line hover:bg-red-50 transition-colors"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
