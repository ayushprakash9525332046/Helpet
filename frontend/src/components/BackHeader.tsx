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
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-line sticky top-0 md:top-[64px] z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-10 h-10 rounded-[10px] border border-line hover:border-brand-300 hover:text-brand-700 text-ink flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={19} />
        </button>
        <h1 className="font-bold text-ink text-base md:text-lg tracking-tight">{title}</h1>
      </div>
      {showSearch ? (
        <button
          aria-label="Search"
          className="w-10 h-10 rounded-[10px] border border-line hover:border-brand-300 hover:text-brand-700 text-ink-soft flex items-center justify-center transition-colors"
        >
          <Search size={17} />
        </button>
      ) : (
        <div className="w-10" />
      )}
    </div>
  );
}
