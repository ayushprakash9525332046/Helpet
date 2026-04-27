"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { Lock, IndianRupee, Shield, CheckCircle2, Banknote } from "lucide-react";

// ── Page Content ──────────────────────────────────────────
function PaymentContent() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams  = useSearchParams();
  const serviceName      = searchParams.get("service")          ?? "Home Service";
  const amount           = searchParams.get("amount")           ?? "0";
  const platformFeePct   = Number(searchParams.get("platform_fee_pct") ?? 10);
  const router           = useRouter();

  const [codLoading, setCodLoading] = useState(false);
  const platformFeeAmount = Math.round(Number(amount) * platformFeePct / 100);
  const total = Number(amount) + platformFeeAmount;

  const handleCOD = async () => {
    if (codLoading) return;
    setCodLoading(true);
    try {
      await api.post("/payments/offline", { booking_id: bookingId, method: "cod" });
      toast.success("Booking confirmed!");
      router.replace(`/bookings/confirmed?service=${encodeURIComponent(serviceName)}&amount=${amount}&paid=false`);
    } catch (err: any) {
      // If payment already exists, just redirect to confirmation
      if (err.response?.status === 400 || err.response?.status === 409) {
        router.replace(`/bookings/confirmed?service=${encodeURIComponent(serviceName)}&amount=${amount}&paid=false`);
      } else {
        toast.error("Could not confirm booking. Try again.");
      }
    } finally {
      setCodLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title="Confirm Booking" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-animated px-5 pt-10 pb-12 relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-blue-200 text-xs font-semibold">Final Step</p>
            <h1 className="text-white text-xl font-extrabold">Confirm Your Service</h1>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-5 px-5 pt-5 pb-10">
        {/* ── Order summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Order Summary</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600 font-medium">{serviceName}</span>
            <span className="font-bold text-slate-800">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Platform fee</span><span>₹{platformFeeAmount}</span>
          </div>
          <div className="border-t border-slate-100 pt-2.5 mt-2.5 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Total Payable</span>
            <div className="flex items-center gap-0.5 text-blue-600 font-extrabold text-xl">
              <IndianRupee size={15} />{total}
            </div>
          </div>
        </motion.div>

        {/* ── Cash on Delivery ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-green-50/50">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <Banknote size={15} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">Cash on Delivery</p>
              <p className="text-[10px] text-slate-400">Pay after the service is completed</p>
            </div>
          </div>

          {/* body */}
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <CheckCircle2 size={14} className="text-green-500" />, label: "No upfront payment" },
                { icon: <Shield size={14} className="text-blue-500" />,        label: "Secure Booking" },
                { icon: <Banknote size={14} className="text-amber-500" />,     label: "Cash accepted" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl py-3 px-2 border border-slate-100">
                  {item.icon}
                  <span className="text-[9px] font-semibold text-slate-500 text-center leading-tight">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3 border border-green-100">
              <span className="text-sm text-green-700 font-semibold">Amount due on delivery</span>
              <span className="font-extrabold text-green-700 text-base">₹{total}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCOD}
              disabled={codLoading}
              className="w-full py-4 rounded-2xl bg-green-600 text-white font-extrabold text-sm shadow-lg shadow-green-200 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {codLoading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirming...</>
              ) : (
                <><Banknote size={15} />Confirm Booking</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Trust badges ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          {[
            { icon: <Shield size={13} className="text-green-600" />,       text: "100% Secure" },
            { icon: <Lock size={13} className="text-blue-600" />,          text: "Privacy Protected" },
            { icon: <CheckCircle2 size={13} className="text-violet-600" />, text: "Verified Experts" },
          ].map((b) => (
            <div key={b.text} className="flex-1 flex flex-col items-center gap-1 bg-white rounded-xl py-2.5 border border-slate-100 shadow-sm">
              {b.icon}
              <span className="text-[10px] text-slate-500 font-semibold">{b.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
