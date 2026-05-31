"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ServiceCategory } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import { resolveImage } from "@/lib/image";

interface Props {
  categories: ServiceCategory[];
  loading: boolean;
}

export default function ServiceCategoriesGrid({ categories, loading }: Props) {
  const gridClass = "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 lg:gap-6";

  if (loading) {
    return (
      <div className={gridClass}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className="skeleton rounded-2xl md:rounded-[24px] h-24 md:h-32 lg:h-36" />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {categories.slice(0, 9).map((cat, i) => {
        const imgSrc = resolveImage(cat.icon, 128);
        const Icon = getServiceIcon(cat.name);
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link href={`/categories/${cat.id}`} className="flex flex-col items-center gap-2 group">
              <div className="w-full aspect-square rounded-2xl md:rounded-[24px] overflow-hidden bg-white shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                {imgSrc ? (
                  <img src={imgSrc} alt={cat.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Icon size={24} className="text-slate-300 md:w-8 md:h-8" />
                )}
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-600 text-center leading-tight group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
