"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ServiceCategory } from "@/lib/types";
import { Search, ImageOff } from "lucide-react";
import { resolveImage } from "@/lib/image";
import { RotatingHint } from "@/components/SearchHint";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

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
    <div className="flex flex-col min-h-screen bg-white pb-6 md:pb-12">
      {/* Header */}
      <div className="bg-white border-b border-line">
        <div className="container-fluid pt-6 pb-5 md:pt-8 md:pb-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h1 className="text-ink text-2xl md:text-3xl font-bold tracking-tight">All services</h1>
            <p className="text-ink-soft text-sm md:text-base mt-1">
              Find the right professional for any job around your home.
            </p>
          </motion.div>

          {/* Search */}
          <div className="mt-4 flex items-center gap-3 border border-[#DBDBDB] rounded-2xl px-4 py-3 max-w-xl focus-within:border-brand-600 focus-within:shadow-[0_0_0_3px_rgba(128,0,255,0.08)] transition-all">
            <Search size={17} className="text-ink-soft shrink-0" />
            <div className="relative flex-1">
              {!search && (
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1 text-sm text-[#9A9AA0]">
                  Search for <RotatingHint />
                </span>
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full text-sm text-ink outline-none bg-transparent"
              />
            </div>
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="text-ink-soft text-xl leading-none hover:text-ink transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="pt-6 md:pt-10 pb-16">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-[#FAFAFA] border border-line rounded-2xl flex items-center justify-center mb-5">
                <Search size={26} className="text-ink-soft" />
              </div>
              <p className="text-ink font-semibold text-base">No results for &quot;{search}&quot;</p>
              <p className="text-ink-soft text-sm mt-1.5">Try a different keyword or browse all categories.</p>
              <button
                onClick={() => handleSearchChange("")}
                className="mt-5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8"
            >
              {filtered.map((cat) => {
                const imgSrc = resolveImage(cat.icon, 256);
                return (
                  <motion.div key={cat.id} variants={item}>
                    <Link href={`/categories/${cat.id}`} className="group flex flex-col items-center gap-2.5">
                      <div className="w-full aspect-square bg-brand-50 rounded-xl overflow-hidden border border-line group-hover:border-brand-300 group-hover:shadow-md transition-all duration-150 flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={cat.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageOff size={28} className="text-brand-300" strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-ink text-center leading-tight">
                        {cat.name}
                      </span>
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
