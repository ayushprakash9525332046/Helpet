"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { MapPin, Calendar, Clock, XCircle, Star, CheckCircle2, AlertCircle, Zap, Receipt } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; sublabel: string; icon: React.ReactNode; gradient: string; text: string }> = {
  pending:   { label: "Pending Confirmation", sublabel: "Waiting for a professional to accept", icon: <AlertCircle size={20} />, gradient: "from-amber-400 to-orange-400", text: "text-amber-700" },
  confirmed: { label: "Confirmed",            sublabel: "Professional will arrive at scheduled time", icon: <CheckCircle2 size={20} />, gradient: "from-blue-500 to-indigo-500", text: "text-blue-700" },
  ongoing:   { label: "In Progress",          sublabel: "Service is currently being provided", icon: <Zap size={20} />, gradient: "from-violet-500 to-purple-500", text: "text-violet-700" },
  completed: { label: "Completed",            sublabel: "Service was completed successfully", icon: <CheckCircle2 size={20} />, gradient: "from-green-500 to-emerald-500", text: "text-green-700" },
  cancelled: { label: "Cancelled",            sublabel: "This booking was cancelled", icon: <XCircle size={20} />, gradient: "from-red-400 to-rose-500", text: "text-red-600" },
};

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get(`/bookings/${id}`).then((r) => setBooking(r.data)).finally(() => setLoading(false));
  }, [id]);

  const cancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking cancelled");
      router.replace("/bookings");
    } catch {
      toast.error("Could not cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title="Booking Details" />
      <div className="px-5 pt-5 space-y-4">
        <div className="skeleton rounded-3xl h-28" />
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-24" />)}
      </div>
    </div>
  );

  if (!booking) return null;

  const status = STATUS_CONFIG[booking.status];
  const date = new Date(booking.scheduled_at);

  const summary = [
    { label: "Base Amount",  value: `₹${booking.total_amount}` },
    { label: "Discount",     value: "₹0", green: true },
    { label: "Platform Fee", value: "₹29" },
    { label: "Grand Total",  value: `₹${Number(booking.total_amount) + 29}`, bold: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-8">
      <BackHeader title="Booking Details" />

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* Status hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl bg-linear-to-br ${status.gradient} p-5 text-white relative overflow-hidden shadow-xl`}
        >
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-4 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
              {status.icon}
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-0.5">Current Status</p>
              <p className="font-extrabold text-lg leading-snug">{status.label}</p>
              <p className="text-white/70 text-xs mt-1">{status.sublabel}</p>
            </div>
          </div>
        </motion.div>

        {/* Service card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Details</p>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">🔧</div>
            <div>
              <p className="font-bold text-slate-800 text-base">Home Service</p>
              <p className="text-slate-400 text-xs mt-0.5">Professional Service</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">Booked</span>
            </div>
          </div>
        </motion.div>

        {/* Booking info */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Booking Info</p>
          <div className="flex flex-col gap-3.5">
            {[
              { icon: <Calendar size={15} className="text-blue-500" />, label: "Date", value: date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: <Clock size={15} className="text-blue-500" />,    label: "Time", value: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
              { icon: <MapPin size={15} className="text-blue-500" />,   label: "Address", value: booking.address },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment summary */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={14} className="text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Summary</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {summary.map(({ label, value, bold, green }) => (
              <div key={label} className={`flex justify-between items-center ${bold ? "border-t border-slate-100 pt-2.5 mt-1" : ""}`}>
                <span className={`text-sm ${bold ? "font-bold text-slate-800" : "text-slate-500"}`}>{label}</span>
                <span className={`text-sm font-bold ${bold ? "text-blue-600 text-base" : green ? "text-green-600" : "text-slate-700"}`}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        {booking.status === "completed" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/review/${booking.id}`)}
            className="flex items-center justify-center gap-2.5 w-full bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-200"
          >
            <Star size={18} className="fill-white" />
            Rate This Service
          </motion.button>
        )}
        {["pending", "confirmed"].includes(booking.status) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.97 }}
            onClick={cancelBooking}
            disabled={cancelling}
            className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border-2 border-red-100 disabled:opacity-60"
          >
            <XCircle size={18} />
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </motion.button>
        )}
      </div>
    </div>
  );
}
