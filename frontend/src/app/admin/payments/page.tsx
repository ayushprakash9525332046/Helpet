"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Payment } from "@/lib/types";
import { Search, ChevronDown, IndianRupee } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending:  { label: "Pending",  badge: "bg-amber-100 text-amber-700" },
  success:  { label: "Success",  badge: "bg-green-100 text-green-700" },
  failed:   { label: "Failed",   badge: "bg-red-100 text-red-600" },
  refunded: { label: "Refunded", badge: "bg-slate-100 text-slate-600" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api.get("/admin/payments").then((r) => setPayments(r.data)).finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter((p) => {
    const matchSearch = p.id.includes(search) || p.booking_id.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Payments</h1>
        <p className="text-slate-500 text-sm mt-1">
          {payments.length} total · Revenue:{" "}
          <span className="font-bold text-green-600">₹{totalRevenue.toLocaleString("en-IN")}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by payment or booking ID..."
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
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
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
          <div className="p-12 text-center text-slate-400 text-sm">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Booking ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stripe ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment, i) => {
                  const sc = STATUS_CONFIG[payment.status] ?? { label: payment.status, badge: "bg-slate-100 text-slate-600" };
                  return (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-slate-500 truncate max-w-28" title={payment.id}>
                          {payment.id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-slate-500 truncate max-w-28" title={payment.booking_id}>
                          {payment.booking_id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
                          <IndianRupee size={11} className="text-blue-500" />
                          {payment.amount.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-slate-400 truncate max-w-32">
                          {(payment as Payment & { stripe_payment_intent_id?: string }).stripe_payment_intent_id ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(payment.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
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
