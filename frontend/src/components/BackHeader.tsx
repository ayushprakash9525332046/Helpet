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
    <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
      <button
        onClick={() => router.back()}
        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
      >
        <ChevronLeft size={20} className="text-slate-700" />
      </button>
      <h1 className="font-semibold text-slate-800 text-base">{title}</h1>
      {showSearch ? (
        <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <Search size={18} className="text-slate-700" />
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  );
}
