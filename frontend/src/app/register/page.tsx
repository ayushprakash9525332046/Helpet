"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, User as UserIcon, Phone, Mail, Home as HomeIcon, Wrench, KeyRound, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Register() {
  const { loginWithToken } = useAuth();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    password: "", confirm_password: "", role: "customer",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const router = useRouter();

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
    if (!form.full_name.trim()) return toast.error("Please enter your full name");
    if (!form.phone.trim()) return toast.error("Please enter your mobile number");
    if (!form.email.trim()) return toast.error("Please enter your email address");
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      return toast.error("Enter a valid 10-digit Indian mobile number (starts with 6-9)");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return toast.error("Enter a valid email address");
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
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      // registration also triggers email OTP automatically — go straight to verify step
      startCooldown();
      setStep(3);
    } catch (err: any) {
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
      await api.post("/auth/otp/send", { email: form.email, purpose: "verify" });
      startCooldown();
      toast.success("OTP resent to your email");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return toast.error("Enter the OTP");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify-email", { email: form.email, code: otpCode });
      toast.success("Welcome to Helpet!");
      if (data.access_token) {
        loginWithToken(data.access_token, data.user);
        router.push("/home");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="pt-12 pb-2 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2.5"
        >
          <Image src="/assets/helpet-logo-v2.png" alt="Helpet" width={40} height={40} className="object-contain rounded-xl" />
          <span className="font-bold text-2xl text-ink tracking-tight">helpet</span>
        </motion.div>

        {/* Step indicator */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 rounded-full transition-all duration-300 ${
              s === step ? "w-8 bg-brand-600" : s < step ? "w-4 bg-brand-300" : "w-4 bg-line"
            }`} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="flex-1 bg-white px-6 pt-8 pb-10 w-full max-w-md mx-auto"
      >
        {/* ── Step 1: Your details ── */}
        {step === 1 && (
          <form onSubmit={handleNext} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-ink">Your details</h2>
              <p className="text-slate-400 text-sm mt-1">Tell us a bit about yourself</p>
            </div>

            {[
              { key: "full_name", label: "Full Name", placeholder: "John Smith", Icon: UserIcon, type: "text" },
              { key: "phone", label: "Mobile Number", placeholder: "9876543210", Icon: Phone, type: "tel" },
              { key: "email", label: "Email Address", placeholder: "john@example.com", Icon: Mail, type: "email" },
            ].map(({ key, label, placeholder, Icon, type }, i) => (
              <motion.div key={key}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <label className="text-[13px] font-medium text-ink mb-2 block">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={type} placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    className="input-premium" />
                </div>
              </motion.div>
            ))}

            {/* Role */}
            <div>
              <label className="text-[13px] font-medium text-ink mb-3 block">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button type="button" whileTap={{ scale: 0.96 }}
                  onClick={() => update("role", "customer")}
                  className="p-4 rounded-xl border text-left transition-colors border-brand-600 bg-brand-50">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                    <HomeIcon size={18} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-blue-700">Book Services</p>
                  <p className="text-xs text-slate-400 mt-0.5">Find &amp; hire professionals</p>
                </motion.button>

                <div className="p-4 rounded-xl border text-left border-line bg-[#FAFAFA] opacity-50 cursor-not-allowed relative">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                    <Wrench size={18} className="text-slate-400" />
                  </div>
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
        )}

        {/* ── Step 2: Set a password ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1">
              <button type="button" onClick={() => setStep(1)}
                className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                ←
              </button>
              <div>
                <h2 className="text-xl font-bold text-ink">Set a password</h2>
                <p className="text-slate-400 text-sm">Keep it strong and secure</p>
              </div>
            </div>

            {/* Summary pill */}
            <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 min-w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                {form.full_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{form.full_name}</p>
                <p className="text-slate-500 text-xs">{form.phone} · {form.email}</p>
              </div>
              <span className="ml-auto text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded-full capitalize">
                {form.role}
              </span>
            </div>

            {[
              { key: "password", label: "Password", placeholder: "Enter a strong password", show: showPass, toggle: () => setShowPass(!showPass) },
              { key: "confirm_password", label: "Confirm Password", placeholder: "Re-enter your password", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(({ key, label, placeholder, show, toggle }, i) => (
              <motion.div key={key}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <label className="text-[13px] font-medium text-ink mb-2 block">{label}</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={show ? "text" : "password"} placeholder={placeholder}
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
              ) : "Create account"}
            </motion.button>
          </form>
        )}

        {/* ── Step 3: Verify Email ── */}
        {step === 3 && (
          <form onSubmit={handleVerifyEmail} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1 mt-8">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"><Mail size={22} className="text-green-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-ink">Verify your email</h2>
                <p className="text-slate-400 text-sm">OTP sent to <span className="font-semibold text-slate-600">{form.email}</span></p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl px-4 py-3 text-sm text-blue-700 font-medium">
              Enter the 6-digit OTP to confirm your email and activate your account.
            </div>

            <div>
              <label className="text-[13px] font-medium text-ink mb-2 block">6-digit code</label>
              <input
                type="text" inputMode="numeric" maxLength={6}
                placeholder="- - - - - -"
                value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="w-full px-4 py-4 rounded-2xl border border-[#DBDBDB] bg-white text-ink text-center text-2xl font-bold tracking-[0.5em] placeholder:text-[#DBDBDB] focus:outline-none focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(128,0,255,0.08)] transition"
              />
            </div>

            <motion.button type="submit" disabled={loading || otpCode.length < 6} whileTap={{ scale: 0.97 }}
              className="btn-primary disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Verify & Finish</span>}
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
