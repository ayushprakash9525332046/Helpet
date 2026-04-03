"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Service } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import StarRating from "@/components/StarRating";
import { Clock, Shield, CheckCircle2, Users, Zap, Award } from "lucide-react";

const GRADIENTS = [
  "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600",
];
const ICONS: Record<string, string> = {
  clean:"🧹",plumb:"🔧",electr:"⚡",carp:"🪚",paint:"🎨",ac:"❄️",salon:"✂️",pest:"🐛",repair:"🔩",
};
function getIcon(name: string) {
  const n = name.toLowerCase();
  for (const [k,v] of Object.entries(ICONS)) if (n.includes(k)) return v;
  return "🏠";
}

const PERKS = [
  { icon: <Shield size={15} className="text-green-600"/>, text: "Background-verified professional" },
  { icon: <Zap size={15} className="text-blue-600"/>,    text: "Instant booking confirmation" },
  { icon: <Award size={15} className="text-amber-500"/>, text: "Satisfaction guarantee or refund" },
  { icon: <Users size={15} className="text-violet-600"/>, text: "Post-service quality check" },
];

const REVIEWS = [
  { name: "Priya Sharma",   rating: 5, text: "Absolutely brilliant service! The professional arrived on time and was extremely thorough.", time: "2 days ago" },
  { name: "Rajan Mehta",    rating: 5, text: "Very professional, clean work and great value for money. Will definitely book again.", time: "1 week ago" },
  { name: "Sunita Verma",   rating: 4, text: "Good experience overall. Quick and efficient service.", time: "2 weeks ago" },
];

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");
  const router = useRouter();

  useEffect(() => {
    api.get(`/services/${id}`).then((r) => setService(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="Service Details" />
      <div className="px-5 pt-5 space-y-4">
        <div className="skeleton rounded-3xl h-56" />
        <div className="skeleton rounded-xl h-6 w-3/4" />
        <div className="skeleton rounded-xl h-4" />
        <div className="skeleton rounded-xl h-4 w-2/3" />
      </div>
    </div>
  );
  if (!service) return null;

  const gradient = GRADIENTS[Math.abs(service.id.charCodeAt(0) - 48) % GRADIENTS.length];
  const icon = getIcon(service.name);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <BackHeader title="Service Details" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className={`mx-5 mt-4 rounded-3xl bg-linear-to-br ${gradient} h-52 flex items-center justify-center relative overflow-hidden shadow-xl`}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-xs font-semibold">{service.category.name}</span>
        </div>
        <motion.span
          animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-7xl drop-shadow-2xl"
        >{icon}</motion.span>
        <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Clock size={12} className="text-white" />
          <span className="text-white text-xs font-semibold">{service.duration_minutes} min</span>
        </div>
      </motion.div>

      <div className="px-5 mt-5">
        {/* Rating + title */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StarRating rating={4.5} count={130} size={15} />
          <h1 className="text-xl font-extrabold text-slate-800 mt-2 leading-snug">{service.name}</h1>
        </motion.div>

        {/* Price + stats row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex gap-3 mt-4"
        >
          <div className="flex-1 bg-blue-50 rounded-2xl p-3.5 text-center border border-blue-100">
            <p className="text-xs text-blue-500 font-semibold mb-0.5">Price</p>
            <p className="text-blue-700 font-extrabold text-xl">₹{service.price}</p>
            <p className="text-slate-400 text-xs line-through">₹{Math.round(service.price * 1.2)}</p>
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold mb-0.5">Duration</p>
            <p className="text-slate-800 font-extrabold text-xl">{service.duration_minutes}</p>
            <p className="text-slate-400 text-xs">minutes</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-2xl p-3.5 text-center border border-green-100">
            <p className="text-xs text-green-600 font-semibold mb-0.5">Rating</p>
            <p className="text-green-700 font-extrabold text-xl">4.9</p>
            <p className="text-slate-400 text-xs">/ 5.0</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 bg-slate-100 rounded-2xl p-1">
          {(["about", "reviews"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"
              }`}>
              {tab === "about" ? "About" : `Reviews (${REVIEWS.length})`}
            </button>
          ))}
        </div>

        {activeTab === "about" ? (
          <motion.div key="about" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-5 space-y-5">
            {service.description && (
              <div>
                <h2 className="font-extrabold text-slate-800 mb-2">About This Service</h2>
                <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
              </div>
            )}
            <div>
              <h2 className="font-extrabold text-slate-800 mb-3">What&apos;s Included</h2>
              <div className="space-y-2.5">
                {PERKS.map((p) => (
                  <div key={p.text} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">{p.icon}</div>
                    <span className="text-slate-700 text-sm font-medium">{p.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={15} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Pro Tip</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">Most customers bundle this with a deep cleaning for the best results and save up to 20%.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="mt-5 space-y-3">
            {REVIEWS.map((rv, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {rv.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{rv.name}</p>
                      <p className="text-xs text-slate-400">{rv.time}</p>
                    </div>
                  </div>
                  <StarRating rating={rv.rating} size={12} />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{rv.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-xl border-t border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">Total Amount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-800">₹{service.price}</span>
              <span className="text-slate-300 text-sm line-through">₹{Math.round(service.price * 1.2)}</span>
            </div>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">✓ Satisfaction Guaranteed</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/book/${service.id}`)}
          className="btn-primary"
        >
          Book This Service →
        </motion.button>
      </div>
    </div>
  );
}
