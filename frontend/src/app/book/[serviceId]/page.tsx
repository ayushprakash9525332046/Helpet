"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Service } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { MapPin, Calendar, Clock, FileText, CheckCircle2, Sparkles } from "lucide-react";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ICONS: Record<string, string> = {
  clean:"🧹",plumb:"🔧",electr:"⚡",carp:"🪚",paint:"🎨",ac:"❄️",salon:"✂️",pest:"🐛",repair:"🔩",
};
function getIcon(name: string) {
  const n = name.toLowerCase();
  for (const [k,v] of Object.entries(ICONS)) if (n.includes(k)) return v;
  return "🏠";
}

const GRADIENTS = [
  "from-blue-500 to-indigo-600","from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600","from-orange-500 to-amber-600",
];

export default function BookService() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const days = getNext7Days();

  useEffect(() => {
    api.get(`/services/${serviceId}`).then((r) => setService(r.data));
  }, [serviceId]);

  const handleBook = async () => {
    if (!address.trim()) return toast.error("Please enter your address");
    if (!selectedTime) return toast.error("Please select a time slot");
    const date = new Date(days[selectedDate]);
    const [h, m] = selectedTime.split(":").map(Number);
    date.setHours(h, m, 0, 0);
    setLoading(true);
    try {
      await api.post("/bookings/", {
        service_id: serviceId,
        scheduled_at: date.toISOString(),
        address,
        notes: notes || undefined,
      });
      router.push("/bookings/confirmed");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title="Book Service" />
      <div className="px-5 pt-5 space-y-4">
        <div className="skeleton rounded-2xl h-24" />
        <div className="skeleton rounded-2xl h-32" />
        <div className="skeleton rounded-2xl h-28" />
      </div>
    </div>
  );

  const gradient = GRADIENTS[Math.abs((service.id.charCodeAt(0) - 48)) % GRADIENTS.length];
  const icon = getIcon(service.name);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-40">
      <BackHeader title="Book Service" />

      {/* Service summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="mx-5 mt-4"
      >
        <div className={`rounded-3xl bg-linear-to-br ${gradient} p-4 flex items-center gap-4 shadow-xl relative overflow-hidden`}>
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shrink-0">
            {icon}
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-extrabold text-white text-base leading-snug line-clamp-1">{service.name}</p>
            <p className="text-white/70 text-xs mt-0.5">{service.category.name}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">₹{service.price}</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={10} />{service.duration_minutes} min
              </span>
            </div>
          </div>
          <div className="bg-green-400/90 rounded-xl px-3 py-1.5 flex items-center gap-1 relative z-10">
            <CheckCircle2 size={12} className="text-white" />
            <span className="text-white text-[10px] font-bold">Available</span>
          </div>
        </div>
      </motion.div>

      <div className="px-5 mt-5 flex flex-col gap-5">
        {/* Address */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin size={13} className="text-blue-600" />
            </div>
            Service Address
          </label>
          <textarea
            placeholder="Enter your full address (house no, street, area, city)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none transition shadow-sm"
          />
        </motion.div>

        {/* Date */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar size={13} className="text-purple-600" />
            </div>
            Select Date
          </label>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {days.map((d, i) => (
              <motion.button
                key={i}
                onClick={() => setSelectedDate(i)}
                whileTap={{ scale: 0.92 }}
                className={`flex flex-col items-center min-w-14.5 py-3.5 rounded-2xl border-2 transition-all ${
                  selectedDate === i
                    ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wide ${selectedDate === i ? "text-blue-200" : "text-slate-400"}`}>
                  {DAY_NAMES[d.getDay()]}
                </span>
                <span className={`text-xl font-extrabold mt-0.5 ${selectedDate === i ? "text-white" : "text-slate-800"}`}>
                  {d.getDate()}
                </span>
                <span className={`text-[10px] font-medium ${selectedDate === i ? "text-blue-200" : "text-slate-400"}`}>
                  {MONTH_NAMES[d.getMonth()]}
                </span>
                {selectedDate === i && (
                  <motion.div layoutId="dateDot" className="w-1.5 h-1.5 bg-white rounded-full mt-1" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Time */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={13} className="text-amber-600" />
            </div>
            Select Time
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {TIME_SLOTS.map((t, i) => (
              <motion.button
                key={t}
                onClick={() => setSelectedTime(t)}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className={`py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                  selectedTime === t
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                    : "bg-white text-slate-600 border-slate-200 shadow-sm"
                }`}
              >
                {t} {parseInt(t) < 12 ? "AM" : "PM"}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText size={13} className="text-green-600" />
            </div>
            Special Instructions
            <span className="text-slate-400 font-normal text-xs ml-auto">Optional</span>
          </label>
          <textarea
            placeholder="Any specific instructions for the professional..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none transition shadow-sm"
          />
        </motion.div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-xl border-t border-slate-100 px-5 py-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400 font-medium">Grand Total</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-800">₹{service.price}</span>
              <span className="text-slate-300 text-sm line-through">₹{Math.round(service.price * 1.2)}</span>
            </div>
          </div>
          <AnimatePresence>
            {selectedTime ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="text-right bg-blue-50 rounded-xl px-3 py-2"
              >
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide">Scheduled</p>
                <p className="text-xs font-bold text-blue-700">
                  {days[selectedDate].getDate()} {MONTH_NAMES[days[selectedDate].getMonth()]} · {selectedTime} {parseInt(selectedTime) < 12 ? "AM" : "PM"}
                </p>
              </motion.div>
            ) : (
              <motion.div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-3 py-2">
                <Sparkles size={12} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">Pick a time</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleBook}
          disabled={loading}
          className="btn-primary disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Confirming Booking...
            </span>
          ) : "Proceed to Checkout →"}
        </motion.button>
      </div>
    </div>
  );
}
