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
import { RotatingHint } from "@/components/SearchHint";

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
    <header className="hidden md:flex sticky top-0 z-40 bg-white border-b border-line h-16 items-center justify-between">
      <div className="container-fluid flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative flex-1 group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within/search:text-brand-600 transition-colors" size={16} />
            {!searchValue && (
              <span className="pointer-events-none absolute left-10 inset-y-0 flex items-center gap-1 text-sm text-[#9A9AA0]">
                Search for <RotatingHint />
              </span>
            )}
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full bg-white border border-line rounded-[10px] py-2.5 pl-10 pr-4 text-sm focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(128,0,255,0.08)] transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6">
          {mounted && user ? (
            /* Authenticated — show bell + profile */
            <>
              <Link href="/notifications" className="p-2 rounded-[10px] border border-line text-ink-soft hover:text-brand-600 hover:border-brand-300 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-deal rounded-full border-2 border-white" />
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 pl-3 border-l border-line">
                <Avatar
                  src={user.profile_picture?.startsWith("http") ? user.profile_picture : user.profile_picture ? `${API_BASE}${user.profile_picture}` : null}
                  name={user.full_name}
                  size="w-8 h-8"
                  radius="rounded-full"
                  textSize="text-xs"
                />
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-ink leading-none">{user.full_name?.split(" ")[0] || "User"}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">Verified</p>
                </div>
              </Link>
            </>
          ) : (
            /* Guest — show Login / Sign Up */
            <>
              <Link href="/login" className="text-sm font-medium text-ink hover:text-brand-600 transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link href="/register" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-colors active:scale-[0.98]">
                Sign up
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
