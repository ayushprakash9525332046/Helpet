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
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.phone.includes(search);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Booking Management</h1>
        <p className="text-slate-500 font-medium mt-1">Monitor and manage all service requests</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total</p>
          <p className="text-2xl font-black text-slate-800">{bookings.length}</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-amber-600 text-xs font-black uppercase tracking-widest mb-1">Pending</p>
          <p className="text-2xl font-black text-amber-700">{bookings.filter(b => b.status === "pending").length}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-1">Active</p>
          <p className="text-2xl font-black text-blue-700">{bookings.filter(b => ["confirmed", "ongoing"].includes(b.status)).length}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-black text-emerald-700">{bookings.filter(b => b.status === "completed").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service, customer, phone or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-none rounded-xl px-4 py-3 pr-10 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Fetching bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-800 font-black text-xl">No bookings found</p>
            <p className="text-slate-400 text-sm mt-1 font-medium">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer & Service</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Address</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="text-right px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((booking, i) => {
                  const sc = STATUS_CONFIG[booking.status];
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group hover:bg-blue-50/30 transition-all"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
                            {booking.customer?.full_name.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm leading-tight">{booking.customer?.full_name || "Unknown Customer"}</p>
                            <p className="text-slate-400 text-xs font-bold mt-0.5">{booking.customer?.phone || "No Phone"}</p>
                            <div className="flex items-center gap-1.5 mt-2 bg-white px-2 py-0.5 rounded-md border border-slate-100 w-fit shadow-sm">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{booking.service.name}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-start gap-2 max-w-[220px]">
                          <MapPin size={14} className="shrink-0 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">&quot;{booking.address}&quot;</p>
                            {booking.notes && (
                              <p className="text-[10px] text-amber-600 font-bold mt-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit">Note: {booking.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                            <Clock size={12} className="text-blue-500" />
                            <span>
                              {new Date(booking.scheduled_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric"
                              })}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 ml-5 uppercase tracking-wider">
                            At {new Date(booking.scheduled_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 font-black text-slate-800 text-base">
                            <IndianRupee size={12} className="text-blue-600" />
                            {booking.total_amount.toLocaleString("en-IN")}
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fixed Charge</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-white ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex justify-end">
                          <div className="relative group/select">
                            <select
                              value={booking.status}
                              disabled={updatingId === booking.id}
                              onChange={(e) => updateStatus(booking.id, e.target.value)}
                              className="appearance-none bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 rounded-xl px-4 py-2.5 pr-9 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:text-blue-500 transition-colors pointer-events-none" />
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
