import Link from "next/link";
import { motion } from "framer-motion";
import { Service } from "@/lib/types";
import StarRating from "./StarRating";
import { Clock, Plus, Tag, ShieldCheck } from "lucide-react";

// Gradient palettes for services without images
const GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-blue-500",
];

const SERVICE_ICONS: Record<string, string> = {
  clean: "🧹", plumb: "🔧", electr: "⚡", carp: "🪚",
  paint: "🎨", ac: "❄️", salon: "✂️", pest: "🐛",
  repair: "🔩", garden: "🌿",
};

function getIcon(name: string): string {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(SERVICE_ICONS)) {
    if (n.includes(k)) return v;
  }
  return "🏠";
}


interface Props {
  service: Service;
  index?: number;
}

export default function ServiceCard({ service, index = 0 }: Props) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const icon = getIcon(service.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link href={`/services/${service.id}`}>
        <div className="group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-500 hover:-translate-y-1">
          {/* Image area */}
          <div className={`relative h-32 md:h-36 lg:h-40 bg-linear-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
            {service.image ? (
              <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-10">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white"
                      style={{ width: 30 + i * 10, height: 30 + i * 10, top: `${i * 15}%`, right: `-${i * 5}%`, opacity: 0.5 }} />
                  ))}
                </div>
                <motion.span
                  animate={{ y: [0, -4, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl md:text-5xl lg:text-6xl relative z-10 drop-shadow-2xl"
                >
                  {icon}
                </motion.span>
              </>
            )}

            {/* Discount badge */}
            <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 bg-white/95 backdrop-blur-md text-blue-600 px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 border border-white/20">
              <Tag size={10} className="md:w-3 md:h-3" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-wider">5% OFF</span>
            </div>

            {/* Duration */}
            <div className="absolute bottom-2.5 right-2.5 md:bottom-3 md:right-3 bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
              <Clock size={10} className="md:w-3 md:h-3" />
              <span className="text-[8px] md:text-[10px] font-bold">{service.duration_minutes} min</span>
            </div>
          </div>

          <div className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1.5">
              <StarRating rating={4.5} count={130} size={10} />
              <div className="flex items-center gap-1 text-emerald-500">
                <ShieldCheck size={10} />
                <span className="text-[8px] font-bold uppercase tracking-tight">Verified</span>
              </div>
            </div>
            
            <h3 className="font-black text-slate-800 text-xs md:text-base lg:text-lg line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">{service.name}</h3>

            <div className="flex items-center justify-between mt-2 md:mt-4">
              <div>
                <div className="flex items-baseline gap-1 md:gap-1.5">
                  <span className="text-blue-600 font-black text-sm md:text-xl">₹{service.price}</span>
                  <span className="text-slate-300 text-[9px] md:text-[11px] font-bold line-through">₹{Math.round(service.price * 1.2)}</span>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-all"
              >
                <Plus size={14} className="text-white md:w-5 md:h-5" strokeWidth={4} />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
