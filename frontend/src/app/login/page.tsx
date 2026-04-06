"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect already-authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [isLoading, user, router]);

  // Show nothing while auth state is being read from localStorage
  if (isLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      await login(phone, password);
      window.location.replace("/home");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : err?.message || "Login failed";
      toast.error(msg);
      setLoading(false); // only reset on failure; on success page navigates away
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Gradient top blob */}
      <div className="relative h-56 gradient-animated flex flex-col items-center justify-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-2xl rotate-12" />

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-3 z-10"
        >
          <span className="text-3xl font-black text-blue-600">A</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-sm font-medium z-10"
        >
          Helpet
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-10 z-10 relative"
      >
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome Back 👋</h1>
        <p className="text-slate-400 text-sm mb-8">Sign in to book your next service</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Phone */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📱</span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-premium"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <div className="flex justify-end -mt-2">
            <button type="button" className="text-sm text-blue-600 font-semibold">
              Forgot Password?
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="btn-primary mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign In →"}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">New to Helpet?</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <Link href="/register">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl border-2 border-blue-100 text-blue-600 font-bold text-center text-sm hover:bg-blue-50 transition-colors"
          >
            Create New Account
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
