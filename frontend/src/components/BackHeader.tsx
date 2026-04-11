"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";

interface Props {
  title: string;
  showSearch?: boolean;
}

export default function BackHeader({ title, showSearch }: Props) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 md:px-12 py-4 md:py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 md:top-[64px] z-40">
      <div className="flex items-center gap-4 md:gap-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-xl hover:shadow-blue-200 group"
        >
          <ChevronLeft size={20} className="text-slate-600 group-hover:text-white md:w-8 md:h-8" />
        </button>
        <h1 className="font-black text-slate-800 text-lg md:text-2xl tracking-tight">{title}</h1>
      </div>
      {showSearch ? (
        <button className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm group">
          <Search size={18} className="text-slate-600 group-hover:text-white md:w-7 md:h-7" />
        </button>
      ) : (
        <div className="w-10 md:w-14" />
      )}
    </div>
  );
}
