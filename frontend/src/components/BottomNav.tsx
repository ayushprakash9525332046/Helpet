"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Grid3X3, CalendarCheck, Bell, User } from "lucide-react";

const tabs = [
  { href: "/home",          icon: Home,          label: "Home" },
  { href: "/categories",    icon: Grid3X3,       label: "Services" },
  { href: "/bookings",      icon: CalendarCheck, label: "Bookings" },
  { href: "/notifications", icon: Bell,          label: "Alerts" },
  { href: "/profile",       icon: User,          label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      {/* Frosted glass bar */}
      <div className="mx-4 mb-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/80 border border-white/60">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 flex-1 py-2 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  {/* Active pill */}
                  {active && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute -inset-2 bg-blue-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon
                    size={20}
                    className={`relative z-10 transition-colors ${active ? "text-white" : "text-slate-400"}`}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  <span className={`text-[10px] font-semibold relative z-10 transition-colors ${active ? "text-white" : "text-slate-400"}`}>
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
