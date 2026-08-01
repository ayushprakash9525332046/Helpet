"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { MapPin, Calendar, Clock, XCircle, Star, CheckCircle2, AlertCircle, Zap, Receipt, FileText } from "lucide-react";
import { getServiceIcon } from "@/lib/icons";

const STATUS_CONFIG: Record<string, { label: string; sublabel: string; icon: React.ReactNode; bg: string; text: string }> = {
  pending:   { label: "Pending confirmation", sublabel: "Waiting for a professional to accept", icon: <AlertCircle size={20} />, bg: "bg-amber-50", text: "text-amber-700" },
  confirmed: { label: "Confirmed",            sublabel: "Your professional will arrive at the scheduled time", icon: <CheckCircle2 size={20} />, bg: "bg-brand-50", text: "text-brand-700" },
  ongoing:   { label: "In progress",          sublabel: "Service is currently being provided", icon: <Zap size={20} />, bg: "bg-brand-50", text: "text-brand-700" },
  completed: { label: "Completed",            sublabel: "Service was completed successfully", icon: <CheckCircle2 size={20} />, bg: "bg-green-50", text: "text-green-700" },
  cancelled: { label: "Cancelled",            sublabel: "This booking was cancelled", icon: <XCircle size={20} />, bg: "bg-red-50", text: "text-red-600" },
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
    <div className="flex flex-col min-h-screen bg-white">
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

  const summary: { label: string; value: string; bold?: boolean; green?: boolean }[] = [
    { label: "Total Amount", value: `₹${booking.total_amount}`, bold: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-8">
      <BackHeader title="Booking Details" />

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* Status hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className={`rounded-2xl ${status.bg} p-5 flex items-start gap-4`}
        >
          <div className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center shrink-0 ${status.text}`}>
            {status.icon}
          </div>
          <div>
            <p className={`font-bold text-base leading-snug ${status.text}`}>{status.label}</p>
            <p className="text-ink-soft text-sm mt-0.5">{status.sublabel}</p>
          </div>
        </motion.div>

        {/* Service card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 border border-line"
        >
          <p className="text-xs font-semibold text-ink mb-3">Service Details</p>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
              {(() => { const Icon = getServiceIcon(booking.service.name); return <Icon size={24} className="text-blue-400" />; })()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{booking.service.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">{booking.service.category.name}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">Booked</span>
            </div>
          </div>
        </motion.div>

        {/* Booking info */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 border border-line"
        >
          <p className="text-xs font-semibold text-ink mb-3">Booking Info</p>
          <div className="flex flex-col gap-3.5">
            {[
              { icon: <Calendar size={15} className="text-blue-500" />, label: "Date", value: date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: <Clock size={15} className="text-blue-500" />,    label: "Time", value: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
              { icon: <MapPin size={15} className="text-blue-500" />,   label: "Address", value: booking.address },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
                <div>
                  <p className="text-xs text-ink-soft">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        {booking.notes && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-white rounded-2xl p-4 border border-line"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-slate-400" />
              <p className="text-xs font-semibold text-ink">Special Instructions</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{booking.notes}</p>
          </motion.div>
        )}

        {/* Payment summary */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 border border-line"
        >
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={14} className="text-slate-400" />
            <p className="text-xs font-semibold text-ink">Payment Summary</p>
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
            className="flex items-center justify-center gap-2.5 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-4 rounded-xl"
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
            className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 disabled:opacity-60"
          >
            <XCircle size={18} />
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </motion.button>
        )}
      </div>
    </div>
  );
}
