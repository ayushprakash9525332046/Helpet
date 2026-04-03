"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const seen = localStorage.getItem("onboarding_done");
    const token = localStorage.getItem("token");
    if (token) router.replace("/home");
    else if (seen) router.replace("/login");
    else router.replace("/onboarding");
  }, [router]);
  return (
    <div className="flex items-center justify-center h-screen bg-blue-600">
      <div className="text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl font-bold">A</span>
        </div>
        <p className="text-white/70 text-sm">Loading...</p>
      </div>
    </div>
  );
}
