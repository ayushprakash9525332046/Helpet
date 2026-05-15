"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ServiceCategory } from "@/lib/types";
import { Search, ImageOff, ChevronRight, Grid2X2, Sparkles } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveImage(url?: string) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function CategoriesContent({ categories }: { categories: ServiceCategory[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const handleSearchChange = (val: string) => {
    setSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("q", val); else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6 md:pb-12">
      {/* Header */}
      <div className="gradient-animated px-5 md:px-12 pt-12 pb-14 md:py-12 lg:py-14 relative overflow-hidden md:rounded-b-[24px] lg:rounded-b-[32px]">
        <div className="absolute -top-10 -right-10 w-40 h-40 md:w-80 md:h-80 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-16 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-2xl rotate-12" />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-fluid relative z-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
              <Grid2X2 size={12} className="text-white" />
            </div>
            <p className="text-blue-200 text-xs font-black uppercase tracking-[0.2em]">Explore</p>
          </div>
          <h1 className="text-white text-xl md:text-3xl lg:text-4xl font-black tracking-tight">All Services</h1>
          <p className="text-blue-100 text-sm md:text-base mt-2 md:mt-3 max-w-2xl leading-relaxed opacity-90">Find the perfect professional for any task around your home.</p>
        </motion.div>
      </div>

      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="-mt-8 md:mt-10 relative z-20"
        >
          <div className="bg-white rounded-xl md:rounded-[24px] shadow-2xl shadow-blue-900/10 flex items-center gap-3 md:gap-5 px-5 py-4 md:px-6 md:py-5 border border-white group/search focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={20} className="text-blue-400 shrink-0 group-focus-within/search:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="Search services (cleaning, plumbing, repairs...)"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 text-sm md:text-lg text-slate-700 placeholder-slate-400 outline-none bg-transparent font-medium"
            />
            {search ? (
              <button onClick={() => handleSearchChange("")} className="text-slate-300 text-2xl leading-none hover:text-slate-500 transition-colors">×</button>
            ) : (
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">200+ Services</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="pt-10 md:pt-16 pb-16">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-800 font-black text-lg">No results for &quot;{search}&quot;</p>
              <p className="text-slate-400 text-xs mt-2">Try a different keyword or browse categories</p>
            </div>
          ) : (
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {filtered.map((cat) => {
                const imgSrc = resolveImage(cat.icon);
                return (
                  <motion.div key={cat.id} variants={item}>
                    <Link href={`/categories/${cat.id}`} className="group flex flex-col items-center gap-3 md:gap-5">
                      <div className="w-full aspect-square bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group-hover:border-blue-100 group-hover:shadow-2xl group-hover:shadow-blue-900/5 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                        {imgSrc ? (
                          <img src={imgSrc} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-200 group-hover:text-blue-200 transition-colors">
                            <ImageOff size={40} className="md:w-14 md:h-14" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">No Icon</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <span className="text-xs md:text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">{cat.name}</span>
                        <div className="flex items-center gap-1.5 mt-1 md:mt-2 text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <span>Explore</span>
                          <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesClient({ categories }: { categories: ServiceCategory[] }) {
  return (
    <Suspense>
      <CategoriesContent categories={categories} />
    </Suspense>
  );
}
