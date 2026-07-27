"use client";

import { createElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Service } from "@/lib/types";
import { Clock, Plus } from "lucide-react";
import { getServiceIcon } from "@/lib/icons";
import { resolveImage } from "@/lib/image";

interface Props {
  service: Service;
  index?: number;
}

export default function ServiceCard({ service, index = 0 }: Props) {
  const router = useRouter();

  const imgSrc = resolveImage(service.image, 400);
  const discount = service.discount_percentage ?? 0;
  const originalPrice = discount > 0
    ? Math.round(service.price / (1 - discount / 100))
    : null;

  const hasSubServices = service.sub_services && service.sub_services.length > 0;

  const handleClick = () => {
    router.push(`/services/${service.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <div className="group bg-white rounded-xl overflow-hidden border border-line hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 h-full flex flex-col">
        {/* Image area — fixed aspect, swappable for photos or SVGs */}
        <div className="relative aspect-[4/3] bg-brand-50 flex items-center justify-center overflow-hidden">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={service.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            createElement(getServiceIcon(service.name), {
              size: 28,
              className: "text-brand-400",
              strokeWidth: 1.5,
            })
          )}

          {discount > 0 && (
            <span className="absolute top-2 left-2 z-10 bg-white text-brand-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-line">
              {discount}% off
            </span>
          )}
        </div>

        <div className="p-3 md:p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-ink text-sm md:text-[15px] line-clamp-2 leading-snug flex-1">
            {service.name}
          </h3>

          <p className="flex items-center gap-1 text-ink-soft text-xs mt-1">
            <Clock size={12} />
            {service.duration_minutes} min
          </p>

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-baseline gap-1.5">
              {hasSubServices ? (
                <span className="text-ink font-semibold text-sm md:text-base">
                  ₹{Math.min(...service.sub_services.map((s) => s.price))} onwards
                </span>
              ) : (
                <>
                  <span className="text-ink font-semibold text-sm md:text-base">₹{service.price}</span>
                  {originalPrice && (
                    <span className="text-deal text-xs line-through">₹{originalPrice}</span>
                  )}
                </>
              )}
            </div>
            <span
              aria-hidden="true"
              className="w-7 h-7 md:w-8 md:h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-150"
            >
              <Plus size={15} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
