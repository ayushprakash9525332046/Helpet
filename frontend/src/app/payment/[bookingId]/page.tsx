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
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="Confirm booking" />

      <div className="flex flex-col gap-4 px-5 pt-5 pb-10 max-w-lg w-full mx-auto">
        {/* ── Order summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl p-4 border border-line"
        >
          <p className="text-xs font-semibold text-ink mb-3">Order summary</p>
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
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.25 }}
          className="bg-white rounded-2xl border border-line overflow-hidden"
        >
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
            <div className="w-9 h-9 bg-green-50 rounded-[10px] flex items-center justify-center">
              <Banknote size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Pay after service</p>
              <p className="text-xs text-ink-soft mt-0.5">Cash or UPI, once the job is done</p>
            </div>
          </div>

          {/* body */}
          <div className="p-4 flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {["No upfront payment", "Cancel free of charge before the visit", "Amount due: pay only what you see above"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center bg-[#FAFAFA] rounded-xl px-4 py-3 border border-line">
              <span className="text-sm text-ink">Amount due after service</span>
              <span className="font-bold text-ink text-base">₹{total}</span>
            </div>

            <button
              onClick={handleCOD}
              disabled={codLoading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              {codLoading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirming...</>
              ) : (
                "Confirm booking"
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Trust line ── */}
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
          <Lock size={12} className="text-brand-600" />
          Secure booking · Verified professionals
        </p>
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
