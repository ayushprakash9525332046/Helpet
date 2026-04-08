"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import { Search, ChevronDown, MapPin, Clock, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending:   { label: "Pending",   badge: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", badge: "bg-blue-100 text-blue-700" },
  ongoing:   { label: "Ongoing",   badge: "bg-violet-100 text-violet-700" },
  completed: { label: "Completed", badge: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", badge: "bg-red-100 text-red-600" },
};

const STATUSES = ["pending", "confirmed", "ongoing", "completed", "cancelled"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/bookings").then((r) => {
      const sorted = [...r.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(sorted);
    }).finally(() => setLoading(false));
  }, []);

  async function updateStatus(bookingId: string, newStatus: string) {
    setUpdatingId(bookingId);
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, null, { params: { new_status: newStatus } });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus as Booking["status"] } : b))
      );
      toast.success("Booking updated");
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.service.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.includes(search) ||
      b.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service, address or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Address</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Scheduled</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking, i) => {
                  const sc = STATUS_CONFIG[booking.status];
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{booking.service.name}</p>
                        <p className="text-slate-400 text-xs">{booking.service.category.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs max-w-40">
                          <MapPin size={11} className="shrink-0 text-slate-400" />
                          <span className="truncate">{booking.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock size={11} className="text-blue-400" />
                          <span>
                            {new Date(booking.scheduled_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short",
                            })}
                            {" · "}
                            {new Date(booking.scheduled_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
                          <IndianRupee size={11} className="text-blue-500" />
                          {booking.total_amount.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <div className="relative">
                            <select
                              value={booking.status}
                              disabled={updatingId === booking.id}
                              onChange={(e) => updateStatus(booking.id, e.target.value)}
                              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
