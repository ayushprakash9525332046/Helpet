"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    password: "", confirm_password: "", role: "customer",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 3-step form
  const [otpCode, setOtpCode] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const router = useRouter();

  // Cooldown ticker for OTP resend
  const startCooldown = () => {
    setOtpCooldown(60);
    const tick = () => setOtpCooldown((c) => {
      if (c <= 1) return 0;
      setTimeout(tick, 1000);
      return c - 1;
    });
    setTimeout(tick, 1000);
  };

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) return toast.error("Please fill name and phone");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.password) return toast.error("Please enter a password");
    if (form.password !== form.confirm_password) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name,
        email: form.email || undefined,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      // Send verification OTP then go to step 3
      await api.post("/auth/otp/send", { phone: form.phone, purpose: "verify" });
      startCooldown();
      setStep(3);
    } catch (err: any) {
      console.error("Register error:", err?.response?.status, err?.response?.data, err?.message);
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(", ")
        : detail || err?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    try {
      await api.post("/auth/otp/send", { phone: form.phone, purpose: "verify" });
      startCooldown();
      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return toast.error("Enter the OTP");
    setLoading(true);
    try {
      await api.post("/auth/otp/verify-phone", { phone: form.phone, code: otpCode });
      toast.success("Phone verified! Welcome aboard 🎉");
      router.push("/login");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="relative h-44 gradient-animated flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-white/10 rounded-full" />
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl z-10"
        >
          <span className="text-2xl font-black text-blue-600">A</span>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white font-bold mt-2 z-10">Create Your Account</motion.p>

        {/* Step indicator */}
        <div className="flex gap-2 mt-3 z-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step ? "w-8 bg-white" : s < step ? "w-4 bg-white/80" : "w-4 bg-white/30"
            }`} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-10 z-10 relative"
      >
        {step === 1 ? (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Personal Details</h2>
              <p className="text-slate-400 text-sm mt-1">Tell us a bit about yourself</p>
            </div>

            {[
              { key: "full_name", label: "Full Name", placeholder: "John Smith", icon: "👤", type: "text" },
              { key: "phone", label: "Mobile Number", placeholder: "9876543210", icon: "📱", type: "tel" },
              { key: "email", label: "Email (Optional)", placeholder: "john@example.com", icon: "✉️", type: "email" },
            ].map(({ key, label, placeholder, icon, type }, i) => (
              <motion.div key={key}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">{icon}</span>
                  <input type={type} placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    className="input-premium" />
                </div>
              </motion.div>
            ))}

            {/* Role */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button type="button" whileTap={{ scale: 0.96 }}
                  onClick={() => update("role", "customer")}
                  className="p-4 rounded-2xl border-2 text-left transition-all border-blue-500 bg-blue-50 shadow-md shadow-blue-100">
                  <span className="text-2xl block mb-1">🏠</span>
                  <p className="text-sm font-bold text-blue-700">Book Services</p>
                  <p className="text-xs text-slate-400 mt-0.5">Find &amp; hire professionals</p>
                </motion.button>

                <div className="p-4 rounded-2xl border-2 text-left border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed relative">
                  <span className="text-2xl block mb-1">🔧</span>
                  <p className="text-sm font-bold text-slate-400">Offer Services</p>
                  <p className="text-xs text-slate-400 mt-0.5">Coming soon</p>
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              </div>
            </div>

            <motion.button type="submit" whileTap={{ scale: 0.97 }} className="btn-primary mt-1">
              Continue →
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1">
              <button type="button" onClick={() => setStep(1)}
                className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                ←
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Set Password</h2>
                <p className="text-slate-400 text-sm">Keep it strong and secure</p>
              </div>
            </div>

            {/* Summary pill */}
            <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {form.full_name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{form.full_name}</p>
                <p className="text-slate-500 text-xs">{form.phone}</p>
              </div>
              <span className="ml-auto text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded-full capitalize">
                {form.role}
              </span>
            </div>

            {[
              { key: "password", label: "Password", show: showPass, toggle: () => setShowPass(!showPass) },
              { key: "confirm_password", label: "Confirm Password", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(({ key, label, show, toggle }, i) => (
              <motion.div key={key}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔐</span>
                  <input type={show ? "text" : "password"} placeholder="••••••••••"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    className="input-premium pr-12" />
                  <button type="button" onClick={toggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Strength hint */}
            {form.password.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex gap-1.5">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                    form.password.length >= i*2
                      ? i <= 2 ? "bg-red-400" : i === 3 ? "bg-amber-400" : "bg-green-500"
                      : "bg-slate-200"
                  }`} />
                ))}
                <span className="text-xs text-slate-400 ml-1">
                  {form.password.length < 4 ? "Weak" : form.password.length < 6 ? "Fair" : form.password.length < 8 ? "Good" : "Strong"}
                </span>
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="btn-primary mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : "Create Account 🎉"}
            </motion.button>
          </form>
        )}

        {/* ── Step 3: Verify Phone ── */}
        {step === 3 && (
          <form onSubmit={handleVerifyPhone} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1 mt-8">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">📱</div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Verify Your Phone</h2>
                <p className="text-slate-400 text-sm">OTP sent to <span className="font-semibold text-slate-600">{form.phone}</span></p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl px-4 py-3 text-sm text-blue-700 font-medium">
              Enter the 6-digit OTP to confirm your phone number and activate your account.
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">6-Digit OTP</label>
              <input
                type="text" inputMode="numeric" maxLength={6}
                placeholder="- - - - - -"
                value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-center text-2xl font-bold tracking-[0.5em] placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition shadow-sm"
              />
            </div>

            <motion.button type="submit" disabled={loading || otpCode.length < 6} whileTap={{ scale: 0.97 }}
              className="btn-primary disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : "Verify & Finish ✓"}
            </motion.button>

            <button type="button" onClick={handleResendOtp}
              disabled={otpCooldown > 0}
              className="text-sm text-blue-600 font-semibold text-center disabled:text-slate-400">
              {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Resend OTP"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
