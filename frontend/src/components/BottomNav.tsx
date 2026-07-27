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
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around h-16 max-w-[430px] mx-auto">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 flex-1 relative min-w-[44px]"
            >
              {active && (
                <motion.span
                  layoutId="navIndicator"
                  className="absolute top-0 w-8 h-0.5 bg-brand-600 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <motion.span whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                <Icon
                  size={22}
                  className={`transition-colors ${active ? "text-brand-600" : "text-ink-soft"}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className={`text-[11px] leading-none transition-colors ${
                    active ? "text-brand-600 font-semibold" : "text-ink-soft font-medium"
                  }`}
                >
                  {label}
                </span>
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
