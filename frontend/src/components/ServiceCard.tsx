import Link from "next/link";
import { motion } from "framer-motion";
import { Service } from "@/lib/types";
import StarRating from "./StarRating";
import { Clock, Plus } from "lucide-react";

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
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          {/* Image area */}
          <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white"
                  style={{ width: 60 + i * 20, height: 60 + i * 20, top: `${i * 15}%`, right: `-${i * 5}%`, opacity: 0.5 }} />
              ))}
            </div>
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl relative z-10 drop-shadow-lg"
            >
              {icon}
            </motion.span>

            {/* Discount badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
              5% OFF
            </div>

            {/* Duration */}
            <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock size={10} />
              {service.duration_minutes}min
            </div>
          </div>

          <div className="p-3.5">
            <StarRating rating={4.5} count={130} size={12} />
            <h3 className="font-bold text-slate-800 text-sm mt-1.5 line-clamp-1">{service.name}</h3>

            <div className="flex items-center justify-between mt-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-blue-600 font-extrabold text-base">₹{service.price}</span>
                  <span className="text-slate-300 text-xs line-through">₹{Math.round(service.price * 1.2)}</span>
                </div>
              </div>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200"
              >
                <Plus size={16} className="text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
