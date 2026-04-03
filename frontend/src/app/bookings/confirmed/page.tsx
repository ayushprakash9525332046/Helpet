"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, ArrowRight, Home } from "lucide-react";

const REF = Math.random().toString(36).slice(2, 8).toUpperCase();

export default function BookingConfirmed() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const countdown = setInterval(() => setSeconds((s) => s - 1), 1000);
    const redirect = setTimeout(() => router.replace("/bookings"), 5000);
    return () => { clearInterval(countdown); clearTimeout(redirect); };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center overflow-hidden">
      {/* Floating rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0.4 }}
            animate={{ scale: 2.5 + i * 0.8, opacity: 0 }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, repeatDelay: 1 }}
            className="absolute w-32 h-32 rounded-full border-2 border-green-400"
          />
        ))}
      </div>

      {/* Check icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="relative z-10 w-28 h-28 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200"
      >
        <CheckCircle2 size={56} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Your booking is placed. A nearby professional has been notified and will confirm shortly.
        </p>
      </motion.div>

      {/* Details card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="relative z-10 w-full bg-slate-50 rounded-3xl p-5 mt-8 border border-slate-100 space-y-3"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calendar size={14} className="text-blue-500" />
            Status
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Pending Confirmation</span>
        </div>
        <div className="h-px bg-slate-100" />
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Booking Ref</span>
          <span className="text-slate-800 font-bold text-sm tracking-wider">#{REF}</span>
        </div>
        <div className="h-px bg-slate-100" />
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-sm">Payment</span>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Pay on Service</span>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="relative z-10 w-full mt-6 space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.replace("/bookings")}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          View My Bookings <ArrowRight size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.replace("/home")}
          className="w-full bg-slate-100 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <Home size={16} /> Back to Home
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        className="relative z-10 text-slate-400 text-xs mt-5"
      >
        Redirecting in {seconds}s...
      </motion.p>
    </div>
  );
}
