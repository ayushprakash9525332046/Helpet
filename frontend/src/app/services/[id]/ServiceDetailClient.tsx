"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Service, SubService } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import BackHeader from "@/components/BackHeader";
import StarRating from "@/components/StarRating";
import { Clock, Shield, CheckCircle2, Users, Zap, Award, ChevronRight, Star, Timer, IndianRupee } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveImage(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null;
}

const GRADIENTS = [
  "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600",
];
const PERKS = [
  { icon: <Shield size={18} className="text-emerald-600" />, text: "Background-verified professional", bg: "bg-emerald-50" },
  { icon: <Zap size={18} className="text-blue-600" />, text: "Instant booking confirmation", bg: "bg-blue-50" },
  { icon: <Award size={18} className="text-amber-500" />, text: "Satisfaction guarantee or refund", bg: "bg-amber-50" },
  { icon: <Users size={18} className="text-violet-600" />, text: "Post-service quality check", bg: "bg-violet-50" },
];
const REVIEWS = [
  { name: "Priya Sharma", rating: 5, text: "Absolutely brilliant service! The professional arrived on time and was extremely thorough.", time: "2 days ago" },
  { name: "Rajan Mehta", rating: 5, text: "Very professional, clean work and great value for money. Will definitely book again.", time: "1 week ago" },
  { name: "Sunita Verma", rating: 4, text: "Good experience overall. Quick and efficient service.", time: "2 weeks ago" },
];

export default function ServiceDetailClient({ service }: { service: Service }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

  const subServices = service.sub_services ?? [];
  const hasSubServices = subServices.length > 0;
  const [selectedSub, setSelectedSub] = useState<SubService | null>(
    hasSubServices ? subServices[0] : null
  );

  const displayPrice = selectedSub ? selectedSub.price : service.price;

  const goToBook = () => {
    if (selectedSub) {
      const params = new URLSearchParams({
        sub_id: selectedSub.id,
        sub_name: selectedSub.name,
        sub_price: String(selectedSub.price),
      });
      router.push(`/book/${service.id}?${params.toString()}`);
    } else {
      router.push(`/book/${service.id}`);
    }
  };

  const gradient = GRADIENTS[Math.abs(service.id.charCodeAt(0) - 48) % GRADIENTS.length];
  const IconComponent = getServiceIcon(service.name);
  const imgSrc = resolveImage(service.image);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32 md:pb-16">
      <BackHeader title="Service Details" />

      <div className="container-fluid py-6 md:py-10 lg:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[24px] md:rounded-[32px] bg-linear-to-br ${gradient} h-64 md:h-[380px] lg:h-[420px] flex items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-900/10 group`}
            >
              {imgSrc ? (
                <img src={imgSrc} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              ) : (
                <>
                  <div className="absolute -top-12 -right-12 w-48 h-48 md:w-80 md:h-80 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full" />
                  <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <IconComponent size={120} className="text-white drop-shadow-2xl md:w-[150px] md:h-[150px]" />
                  </motion.div>
                </>
              )}
              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/25 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/30 shadow-2xl">
                <span className="text-white text-xs md:text-sm font-black uppercase tracking-[0.1em]">{service.category.name}</span>
              </div>
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-black/40 backdrop-blur-xl rounded-xl px-4 py-2 flex items-center gap-2 border border-white/10 shadow-2xl">
                <Clock size={16} className="text-white" />
                <span className="text-white text-sm md:text-base font-black">{service.duration_minutes} min duration</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="hidden md:grid grid-cols-3 gap-4 lg:gap-6 mt-6 md:mt-8"
            >
              {[
                { icon: <IndianRupee size={18} className="text-blue-600" />, bg: "bg-blue-50", label: hasSubServices ? "From" : "Base Price", value: `₹${displayPrice}`, sub: `₹${Math.round(Number(displayPrice) * 1.2)}`, strikethrough: true },
                { icon: <Timer size={18} className="text-slate-600" />, bg: "bg-slate-50", label: "Est. Time", value: service.duration_minutes, sub: "minutes" },
                { icon: <Star size={18} className="text-amber-500 fill-amber-500" />, bg: "bg-amber-50", label: "Avg Rating", value: "4.9", sub: "Verified", green: true },
              ].map(({ icon, bg, label, value, sub, strikethrough, green }) => (
                <div key={label} className="bg-white rounded-[24px] p-5 lg:p-6 text-center border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-blue-200 transition-all duration-500">
                  <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-slate-800 font-black text-lg md:text-xl">{value}</p>
                  <p className={`text-xs mt-0.5 ${strikethrough ? "text-slate-400 line-through" : green ? "text-green-600 font-black uppercase tracking-widest" : "text-slate-400"}`}>{sub}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <StarRating rating={4.5} count={130} size={14} />
                <span className="text-slate-400 text-xs md:text-sm font-bold">• 1.2k+ bookings</span>
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 leading-tight tracking-tight mb-6 md:mb-8">{service.name}</h1>

              {hasSubServices && (
                <div className="mb-8">
                  <h2 className="font-black text-slate-800 text-lg md:text-xl mb-4 tracking-tight">Choose an option</h2>
                  <div className="flex flex-col gap-3">
                    {subServices.map((sub) => {
                      const active = selectedSub?.id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSub(sub)}
                          className={`w-full flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                            active
                              ? "border-blue-600 bg-blue-50/50 shadow-sm"
                              : "border-slate-100 bg-white hover:border-blue-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                active ? "border-blue-600" : "border-slate-300"
                              }`}
                            >
                              {active && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-800">{sub.name}</span>
                              {sub.description && (
                                <span className="block text-sm text-slate-500 mt-0.5">{sub.description}</span>
                              )}
                            </div>
                          </div>
                          <span className="flex items-center font-black text-blue-600 shrink-0">
                            <IndianRupee size={14} strokeWidth={3} />
                            {Number(sub.price).toLocaleString("en-IN")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="hidden md:block mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={goToBook}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-[20px] shadow-2xl shadow-blue-200 text-base transition-all flex items-center justify-center gap-3"
                >
                  Book this Service Now <ChevronRight size={20} />
                </motion.button>
              </div>
            </motion.div>

            {/* Mobile price row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="flex gap-4 md:hidden"
            >
              {[
                { icon: <IndianRupee size={14} className="text-blue-600" />, bg: "bg-blue-50", label: "Price", value: `₹${displayPrice}` },
                { icon: <Timer size={14} className="text-slate-600" />, bg: "bg-slate-50", label: "Time", value: `${service.duration_minutes}m` },
                { icon: <Star size={14} className="text-amber-500 fill-amber-500" />, bg: "bg-amber-50", label: "Rating", value: "4.9" },
              ].map(({ icon, bg, label, value }) => (
                <div key={label} className="flex-1 bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>{icon}</div>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-slate-800 font-black text-xl">{value}</p>
                </div>
              ))}
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1.5 mt-8 md:mt-10 bg-slate-100/80 rounded-2xl p-1.5">
              {(["about", "reviews"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-black capitalize transition-all duration-300 ${
                    activeTab === tab ? "bg-white text-blue-600 shadow-xl shadow-slate-200/50" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}>
                  {tab === "about" ? "About" : `Reviews (${REVIEWS.length})`}
                </button>
              ))}
            </div>

            {activeTab === "about" ? (
              <motion.div key="about" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-8 md:mt-10 space-y-8 md:space-y-10">
                {service.description && (
                  <div>
                    <h2 className="font-black text-slate-800 text-lg md:text-xl mb-3 md:mb-4 tracking-tight">Service Description</h2>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{service.description}</p>
                  </div>
                )}
                <div>
                  <h2 className="font-black text-slate-800 text-lg md:text-xl mb-4 md:mb-6 tracking-tight">What&apos;s Included</h2>
                  <div className="grid grid-cols-1 gap-4 md:gap-5">
                    {PERKS.map((p) => (
                      <div key={p.text} className="flex items-center gap-4 md:gap-6 bg-white rounded-2xl px-5 py-4 md:px-8 md:py-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center shadow-inner shrink-0 group-hover:bg-blue-50 transition-colors">{p.icon}</div>
                        <span className="text-slate-700 text-sm md:text-base font-black tracking-tight">{p.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-[28px] md:rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                      <Zap size={16} className="text-blue-100" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Expert Tip</span>
                  </div>
                  <p className="text-white text-sm md:text-lg font-black leading-snug relative z-10 tracking-tight">
                    Book this service during weekdays to get a complimentary express cleaning for one additional room!
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="mt-8 md:mt-10 space-y-5 md:space-y-6">
                {REVIEWS.map((rv, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[24px] p-5 md:p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg">
                          {rv.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-800 font-black text-sm md:text-lg tracking-tight">{rv.name}</p>
                          <p className="text-slate-400 text-xs font-bold mt-0.5 uppercase tracking-widest">{rv.time}</p>
                        </div>
                      </div>
                      <div className="bg-amber-50 px-2.5 py-1 md:px-4 md:py-2 rounded-lg border border-amber-100 flex items-center gap-1">
                        <StarRating rating={rv.rating} count={0} size={12} />
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs md:text-base leading-relaxed font-medium italic">&quot;{rv.text}&quot;</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-5 py-5 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="shrink-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Price</p>
            <span className="text-xl font-black text-slate-800">₹{displayPrice}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goToBook}
            className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 text-sm"
          >
            Book Now →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
