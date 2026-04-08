"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { Menu, X, Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  // List of pages where we don't want the AppShell (login, register, onboarding)
  const noShellPages = ["/login", "/register", "/onboarding"];
  if (noShellPages.includes(pathname)) return <>{children}</>;

  // Pages where we want the AppShell (for sidebar) but want to hide the BottomNav on mobile
  // (typically pages with their own fixed bottom CTA)
  const hideBottomNav = [
    "/services/",
    "/book/",
    "/payment/",
    "/review/"
  ].some(prefix => pathname.startsWith(prefix));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Tablet & Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen relative">
        {/* Desktop Top Nav (Only visible on tablet/desktop) */}
        <header className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-3 items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <div className="relative flex-1 group/search">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search for services (cleaning, plumbing, AC...)"
                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-200 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <Link href="/notifications" className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
            </Link>
            <Link href="/profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user?.full_name?.charAt(0).toUpperCase() || <User size={14} />}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name?.split(" ")[0] || "User"}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verified User</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <div className="min-h-screen md:min-h-0">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {!hideBottomNav && <BottomNav />}
        </div>
      </div>
    </div>
  );
}
