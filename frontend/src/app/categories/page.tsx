"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { ServiceCategory } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import { Search } from "lucide-react";

const CATEGORY_META: Record<string, { icon: string; gradient: string; services: number }> = {
  Cleaning:    { icon: "🧹", gradient: "from-blue-400 to-cyan-400",       services: 14 },
  Plumbing:    { icon: "🔧", gradient: "from-orange-400 to-amber-400",    services: 25 },
  Electrician: { icon: "⚡", gradient: "from-yellow-400 to-orange-400",   services: 15 },
  Carpenter:   { icon: "🪚", gradient: "from-amber-500 to-yellow-500",    services: 10 },
  Painter:     { icon: "🎨", gradient: "from-pink-400 to-rose-400",       services: 8  },
  "AC Repair": { icon: "❄️", gradient: "from-cyan-400 to-blue-400",       services: 10 },
  Salon:       { icon: "✂️", gradient: "from-purple-400 to-violet-500",   services: 5  },
  Pest:        { icon: "🐛", gradient: "from-green-400 to-emerald-500",   services: 7  },
};

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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-14 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-16 w-12 h-12 bg-white/10 rounded-xl rotate-12" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-blue-200 text-xs font-semibold mb-1">Explore</p>
          <h1 className="text-white text-2xl font-extrabold">All Services</h1>
          <p className="text-blue-200 text-sm mt-1">Find the perfect pro for any job</p>
        </motion.div>
      </div>

      {/* Search — overlaps header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mx-5 -mt-6 relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 flex items-center gap-3 px-4 py-3.5 border border-white">
          <Search size={17} className="text-blue-400 shrink-0" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 text-lg leading-none">×</button>
          )}
        </div>
      </motion.div>

      {/* Grid */}
      <div className="px-5 pt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-36" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-4">🔍</motion.div>
            <p className="text-slate-600 font-bold">No results for &quot;{search}&quot;</p>
            <p className="text-slate-400 text-sm mt-1">Try a different keyword</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 gap-4">
            {filtered.map((cat) => {
              const meta = CATEGORY_META[cat.name] ?? { icon: "🔨", gradient: "from-slate-400 to-slate-500", services: 0 };
              return (
                <motion.div key={cat.id} variants={item} whileTap={{ scale: 0.95 }}>
                  <Link href={`/categories/${cat.id}`}
                    className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    {/* Gradient top */}
                    <div className={`h-24 bg-gradient-to-br ${meta.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl drop-shadow-lg"
                      >{meta.icon}</motion.span>
                    </div>
                    <div className="p-3.5">
                      <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {meta.services || "Multiple"} services available
                      </p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {["bg-blue-400","bg-violet-400","bg-emerald-400"].map((c, i) => (
                            <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-white`} />
                          ))}
                        </div>
                        <span className="text-blue-600 text-xs font-bold">View →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
