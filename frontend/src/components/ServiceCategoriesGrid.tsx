"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ServiceCategory } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import { resolveImage } from "@/lib/image";

interface Props {
  categories: ServiceCategory[];
  loading: boolean;
}

export default function ServiceCategoriesGrid({ categories, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="shrink-0">
            <div className="skeleton rounded-xl w-20 h-20 md:w-24 md:h-24" />
            <div className="skeleton rounded-md w-14 h-3 mt-2 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-1 snap-x">
      {categories.map((cat, i) => {
        const imgSrc = resolveImage(cat.icon, 400);
        const Icon = getServiceIcon(cat.name);
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0 snap-start"
          >
            <Link href={`/categories/${cat.id}`} className="flex flex-col items-center gap-2 group w-20 md:w-24">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-brand-50 border border-line group-hover:border-brand-300 group-hover:shadow-md transition-all duration-150 flex items-center justify-center">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon size={26} className="text-brand-400" strokeWidth={1.5} />
                )}
              </div>
              <span className="text-xs md:text-sm font-medium text-ink text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        );
      })}

      <div className="shrink-0 snap-start">
        <Link href="/categories" className="flex flex-col items-center gap-2 group w-20 md:w-24">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white border border-line group-hover:border-brand-300 transition-all duration-150 flex items-center justify-center">
            <ArrowRight size={22} className="text-brand-600" />
          </div>
          <span className="text-xs md:text-sm font-medium text-brand-600 text-center leading-tight">
            See all
          </span>
        </Link>
      </div>
    </div>
  );
}
