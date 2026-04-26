import Link from "next/link";
import { motion } from "framer-motion";
import { Service } from "@/lib/types";
import StarRating from "./StarRating";
import { Clock, Plus, Tag, ShieldCheck } from "lucide-react";
import { getServiceIcon } from "@/lib/icons";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveImage(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null;
}

const GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-blue-500",
];

interface Props {
  service: Service;
  index?: number;
}

export default function ServiceCard({ service, index = 0 }: Props) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const IconComponent = getServiceIcon(service.name);
  const imgSrc = resolveImage(service.image);
  const discount = service.discount_percentage ?? 0;
  const originalPrice = discount > 0 ? Math.round(service.price / (1 - discount / 100)) : Math.round(service.price * 1.2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link href={`/services/${service.id}`}>
        <div className="group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
          {/* Image area */}
          <div className={`relative h-28 md:h-32 lg:h-36 xl:h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
            {imgSrc ? (
              <img src={imgSrc} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-10">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white"
                      style={{ width: 40 + i * 20, height: 40 + i * 20, top: `${i * 20}%`, right: `-${i * 8}%`, opacity: 0.4 }} />
                  ))}
                </div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
                >
                  <IconComponent size={28} className="text-white md:w-8 md:h-8" strokeWidth={1.5} />
                </motion.div>
              </>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-md text-blue-600 px-2 py-1 rounded-lg shadow-lg flex flex-row items-center gap-1 border border-white/20">
                <Tag size={9} />
                <span className="text-[10px] font-black uppercase tracking-wider">{discount}% OFF</span>
              </div>
            )}

            {/* Duration */}
            <div className="absolute bottom-2.5 right-2.5 bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
              <Clock size={9} />
              <span className="text-[10px] font-bold">{service.duration_minutes}m</span>
            </div>
          </div>

          <div className="p-3 md:p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <StarRating rating={4.5} count={130} size={10} />
              <div className="flex items-center gap-1 text-emerald-500">
                <ShieldCheck size={10} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Verified</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-sm md:text-[15px] line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug flex-1">{service.name}</h3>

            <div className="flex items-center justify-between mt-2 md:mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-blue-600 font-black text-base md:text-lg">₹{service.price}</span>
                {discount > 0 && (
                  <span className="text-slate-300 text-xs font-medium line-through">₹{originalPrice}</span>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200 group-hover:bg-blue-700 transition-all"
              >
                <Plus size={14} className="text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
