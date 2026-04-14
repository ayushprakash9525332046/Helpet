"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState, useEffect, Suspense } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";

function AppShellHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setMounted(true);
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    
    // Always push to /categories if we're searching
    router.push(`/categories?${params.toString()}`);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";

  return (
    <header className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 items-center justify-between">
      <div className="container-fluid flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative flex-1 group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search for services (cleaning, plumbing, AC...)"
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-200 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6">
          {mounted && user ? (
            /* Authenticated — show bell + profile */
            <>
              <Link href="/notifications" className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <Avatar
                  src={user.profile_picture?.startsWith("http") ? user.profile_picture : user.profile_picture ? `${API_BASE}${user.profile_picture}` : null}
                  name={user.full_name}
                  size="w-8 h-8"
                  radius="rounded-full"
                  textSize="text-xs"
                />
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user.full_name?.split(" ")[0] || "User"}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verified User</p>
                </div>
              </Link>
            </>
          ) : (
            /* Guest — show Login / Sign Up */
            <>
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95">
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  // Pages that render their own full layout — no sidebar/header needed
  const noShellPages = ["/", "/login", "/register", "/onboarding"];
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
        <Suspense fallback={<div className="h-16 bg-white border-b border-slate-100" />}>
          <AppShellHeader />
        </Suspense>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <div className="min-h-screen md:min-h-0">
            {children}
          </div>
          {pathname === "/home" && <Footer />}
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {!hideBottomNav && <BottomNav />}
        </div>
      </div>
    </div>
  );
}
