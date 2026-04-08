"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { User } from "@/lib/types";
import { Search, ShieldCheck, UserX, UserCheck, Trash2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-500",
  banned:   "bg-red-100 text-red-600",
};

const ROLE_BADGE: Record<string, string> = {
  admin:    "bg-blue-100 text-blue-700",
  provider: "bg-violet-100 text-violet-700",
  customer: "bg-slate-100 text-slate-500",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionUser, setActionUser] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/users").then((r) => {
      const sorted = [...r.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(sorted);
    }).finally(() => setLoading(false));
  }, []);

  async function updateStatus(userId: string, newStatus: string) {
    setActionUser(userId);
    try {
      await api.put(`/admin/users/${userId}/status`, null, { params: { new_status: newStatus } });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus as User["status"] } : u)));
      toast.success(`User ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionUser(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Deactivate this user?")) return;
    setActionUser(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "inactive" } : u)));
      toast.success("User deactivated");
    } catch {
      toast.error("Failed to deactivate user");
    } finally {
      setActionUser(null);
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Users</h1>
        <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{user.full_name}</p>
                            <p className="text-slate-400 text-xs">{user.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{user.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[user.role]}`}>
                          {user.role === "admin" && <ShieldCheck size={10} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {user.status !== "active" && (
                            <button
                              onClick={() => updateStatus(user.id, "active")}
                              disabled={actionUser === user.id}
                              title="Activate"
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                            >
                              <UserCheck size={15} />
                            </button>
                          )}
                          {user.status !== "banned" && (
                            <button
                              onClick={() => updateStatus(user.id, "banned")}
                              disabled={actionUser === user.id}
                              title="Ban"
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                            >
                              <UserX size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={actionUser === user.id}
                            title="Deactivate"
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
