"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { ServiceCategory } from "@/lib/types";
import { Search, ImageOff, ChevronRight, Grid2X2, Sparkles, Home } from "lucide-react";
import { getServiceIcon } from "@/lib/icons";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveImage(url?: string) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Categories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/services/categories").then((r) => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-6 md:pb-12">
      {/* Header */}
      <div className="gradient-animated px-5 md:px-12 pt-12 pb-14 md:py-12 lg:py-14 relative overflow-hidden md:rounded-b-[24px] lg:rounded-b-[32px]">
        {/* Decorative circles */}
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
            <p className="text-blue-200 text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">Explore</p>
          </div>
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">All Services</h1>
          <p className="text-blue-100 text-xs md:text-base mt-2 md:mt-3 max-w-2xl leading-relaxed opacity-90">Find the perfect professional for any task around your home.</p>
        </motion.div>
      </div>

      {/* Search — overlaps header on mobile, standard on desktop */}
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="-mt-8 md:mt-10 relative z-20"
        >
          <div className="bg-white rounded-xl md:rounded-[24px] shadow-2xl shadow-blue-900/10 flex items-center gap-3 md:gap-5 px-5 py-4 md:px-6 md:py-5 border border-white group/search focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={20} className="text-blue-400 shrink-0 md:w-5 md:h-5 group-focus-within/search:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="Search services (cleaning, plumbing, repairs...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm md:text-lg text-slate-700 placeholder-slate-400 outline-none bg-transparent font-medium"
            />
            {search ? (
              <button onClick={() => setSearch("")} className="text-slate-300 text-2xl md:text-3xl leading-none hover:text-slate-500 transition-colors">×</button>
            ) : (
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">200+ Services</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="pt-10 md:pt-16 pb-16">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton rounded-2xl md:rounded-[32px] h-48 md:h-64 lg:h-72" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-slate-300 md:w-10 md:h-10" />
              </div>
              <p className="text-slate-800 font-black text-lg md:text-2xl">No results for &quot;{search}&quot;</p>
              <p className="text-slate-400 text-xs md:text-base mt-2">Try a different keyword or browse categories</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
              {filtered.map((cat) => {
                const imgSrc = resolveImage(cat.icon);
                return (
                  <motion.div key={cat.id} variants={item} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/categories/${cat.id}`}
                      className="group block bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 hover:-translate-y-2"
                    >
                      {/* Image / fallback top */}
                      <div className="h-32 md:h-48 lg:h-52 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            {(() => {
                              const Icon = getServiceIcon(cat.name);
                              return <Icon size={32} className="text-slate-200 md:w-12 md:h-12" />;
                            })()}
                            <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Explore</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-slate-800 text-sm md:text-lg lg:text-xl group-hover:text-blue-600 transition-colors tracking-tight">{cat.name}</h3>
                          <p className="text-[9px] md:text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Explore Services</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 group-hover:bg-blue-600 flex items-center justify-center transition-all">
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-white md:w-5 md:h-5" />
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

      {/* BottomNav removed as it's now handled by AppShell */}
    </div>
  );
}
