"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, CalendarCheck, Star } from "lucide-react";

const FLOATING_STARS = [
  { top: "15%", left: "10%", size: 20, delay: 0 },
  { top: "20%", left: "80%", size: 16, delay: 0.3 },
  { top: "70%", left: "85%", size: 24, delay: 0.6 },
  { top: "75%", left: "8%",  size: 18, delay: 0.9 },
  { top: "45%", left: "92%", size: 14, delay: 1.2 },
  { top: "50%", left: "3%",  size: 22, delay: 0.5 },
];

export default function ReviewThanks() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center overflow-hidden relative">
      {/* Floating stars */}
      {FLOATING_STARS.map((s, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", top: s.top, left: s.left }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3], rotate: [0, 20, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: s.delay }}
        >
          <Star size={s.size} className="text-amber-300 fill-amber-300" />
        </motion.div>
      ))}

      {/* Main icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="w-32 h-32 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-amber-200 relative z-10"
      >
        <span className="text-6xl">🙏</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="relative z-10"
      >
        <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Thank You!</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Your review helps us maintain quality and allows others to find the best professionals in their area.
        </p>
      </motion.div>

      {/* Star row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
        className="flex gap-2 mt-6 mb-8 relative z-10"
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.55 + i * 0.08 }}
          >
            <Star size={28} className="text-amber-400 fill-amber-400" />
          </motion.div>
        ))}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="w-full space-y-3 relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.replace("/home")}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <Home size={16} /> Back to Home
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.replace("/bookings")}
          className="w-full bg-slate-100 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <CalendarCheck size={16} /> View My Bookings
        </motion.button>
      </motion.div>
    </div>
  );
}
