"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

type Mode = "password" | "otp" | "forgot";
type ForgotStep = 1 | 2 | 3;

function LoginInner() {
  const { login, loginWithToken, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/home";

  // Mode: which screen is active
  const [mode, setMode] = useState<Mode>("password");

  // Password login
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP login
  const [otpPhone, setOtpPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Forgot password
  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) router.replace("/home");
  }, [isLoading, user, router]);

  // Cooldown ticker
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const t = setTimeout(() => setForgotCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotCooldown]);

  if (isLoading) return null;

  // ── Password Login ───────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      await login(phone, password);
      window.location.replace(redirectTo);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Invalid phone or password");
      setLoading(false);
    }
  };

  // ── OTP Login: send ──────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!otpPhone.trim()) return toast.error("Enter your phone number");
    setLoading(true);
    try {
      await api.post("/auth/otp/send", { phone: otpPhone, purpose: "login" });
      setOtpSent(true);
      setOtpCooldown(60);
      toast.success("OTP sent to your phone");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Login: verify ────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return toast.error("Enter the OTP");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify-login", {
        phone: otpPhone,
        code: otpCode,
      });
      loginWithToken(data.access_token, data.user);
      window.location.replace(redirectTo);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Invalid or expired OTP");
      setLoading(false);
    }
  };

  // ── Forgot: send OTP ─────────────────────────────────────────
  const handleForgotSendOtp = async () => {
    if (!forgotPhone.trim()) return toast.error("Enter your phone number");
    setLoading(true);
    try {
      await api.post("/auth/password-reset/request", {
        phone: forgotPhone,
        purpose: "reset",
      });
      setForgotStep(2);
      setForgotCooldown(60);
      toast.success("OTP sent to your phone");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot: verify OTP → step 3 ─────────────────────────────
  const handleForgotVerifyOtp = async () => {
    if (!forgotCode.trim()) return toast.error("Enter the OTP");
    setForgotStep(3);
  };

  // ── Forgot: reset password ───────────────────────────────────
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return toast.error("Enter a new password");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await api.post("/auth/password-reset/confirm", {
        phone: forgotPhone,
        code: forgotCode,
        new_password: newPassword,
      });
      toast.success("Password reset! Please sign in.");
      setMode("password");
      setForgotStep(1);
      setForgotPhone("");
      setForgotCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Reset failed. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setMode("password");
    setForgotStep(1);
    setOtpSent(false);
    setOtpCode("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="relative h-56 gradient-animated flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-2xl rotate-12" />
        <motion.div
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-3 z-10"
        >
          <span className="text-3xl font-black text-blue-600">A</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-white/80 text-sm font-medium z-10"
        >
          Helpet
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-10 z-10 relative"
      >
        <AnimatePresence mode="wait">

          {/* ══ FORGOT PASSWORD ══════════════════════════════════ */}
          {mode === "forgot" && (
            <motion.div key="forgot"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <button onClick={resetToLogin}
                className="flex items-center gap-2 text-slate-500 text-sm font-semibold mb-6 -ml-1">
                <ArrowLeft size={16} /> Back to Sign In
              </button>

              {/* Step 1: Enter phone */}
              {forgotStep === 1 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Forgot Password?</h1>
                    <p className="text-slate-400 text-sm">Enter your registered phone number</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📱</span>
                      <input type="tel" placeholder="Enter your phone number"
                        value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)}
                        className="input-premium" />
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleForgotSendOtp}
                    disabled={loading} className="btn-primary">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP...
                      </span>
                    ) : "Send OTP →"}
                  </motion.button>
                </div>
              )}

              {/* Step 2: Enter OTP */}
              {forgotStep === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Enter OTP</h1>
                    <p className="text-slate-400 text-sm">Sent to <span className="font-semibold text-slate-600">{forgotPhone}</span></p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">6-Digit OTP</label>
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="- - - - - -"
                      value={forgotCode} onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-center text-2xl font-bold tracking-[0.5em] placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition shadow-sm" />
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleForgotVerifyOtp}
                    disabled={forgotCode.length < 6} className="btn-primary disabled:opacity-60">
                    Verify OTP →
                  </motion.button>
                  <button type="button" onClick={handleForgotSendOtp}
                    disabled={forgotCooldown > 0 || loading}
                    className="text-sm text-blue-600 font-semibold text-center disabled:text-slate-400">
                    {forgotCooldown > 0 ? `Resend OTP in ${forgotCooldown}s` : "Resend OTP"}
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleForgotReset} className="flex flex-col gap-5">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-1">New Password</h1>
                    <p className="text-slate-400 text-sm">Set a strong password for your account</p>
                  </div>
                  {[
                    { label: "New Password", val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
                    { label: "Confirm Password", val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                  ].map(({ label, val, set, show, toggle }) => (
                    <div key={label}>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔐</span>
                        <input type={show ? "text" : "password"} placeholder="••••••••"
                          value={val} onChange={(e) => set(e.target.value)} className="input-premium pr-12" />
                        <button type="button" onClick={toggle}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={loading} className="btn-primary">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Resetting...
                      </span>
                    ) : "Reset Password ✓"}
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}

          {/* ══ SIGN IN (Password + OTP tabs) ════════════════════ */}
          {mode !== "forgot" && (
            <motion.div key="signin"
              initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome Back 👋</h1>
              <p className="text-slate-400 text-sm mb-6">Sign in to book your next service</p>

              {/* Tab switcher */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
                {(["password", "otp"] as Mode[]).map((m) => (
                  <button key={m} type="button"
                    onClick={() => { setMode(m); setOtpSent(false); setOtpCode(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      mode === m ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    }`}>
                    {m === "password" ? "🔒 Password" : "📱 OTP"}
                  </button>
                ))}
              </div>

              {/* ── Password Tab ── */}
              {mode === "password" && (
                <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📱</span>
                      <input type="tel" placeholder="Enter your phone number"
                        value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium" />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔒</span>
                      <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                        value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  <div className="flex justify-end -mt-2">
                    <button type="button" onClick={() => setMode("forgot")}
                      className="text-sm text-blue-600 font-semibold">
                      Forgot Password?
                    </button>
                  </div>

                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="btn-primary mt-1">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : "Sign In →"}
                  </motion.button>
                </form>
              )}

              {/* ── OTP Tab ── */}
              {mode === "otp" && (
                <form onSubmit={otpSent ? handleVerifyOtp : (e) => { e.preventDefault(); handleSendOtp(); }}
                  className="flex flex-col gap-5">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📱</span>
                        <input type="tel" placeholder="Enter your phone number"
                          value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)}
                          disabled={otpSent}
                          className="input-premium disabled:bg-slate-50 disabled:text-slate-500" />
                      </div>
                      {otpSent && (
                        <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }}
                          className="px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-semibold whitespace-nowrap">
                          Change
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {!otpSent ? (
                    <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
                      className="btn-primary">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending OTP...
                        </span>
                      ) : "Send OTP →"}
                    </motion.button>
                  ) : (
                    <AnimatePresence>
                      <motion.div key="otp-input"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-5"
                      >
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            6-Digit OTP
                          </label>
                          <p className="text-xs text-slate-400 mb-3">
                            Sent to <span className="font-semibold text-slate-600">{otpPhone}</span>
                          </p>
                          <input type="text" inputMode="numeric" maxLength={6}
                            placeholder="- - - - - -"
                            value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            autoFocus
                            className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-center text-2xl font-bold tracking-[0.5em] placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition shadow-sm" />
                        </div>

                        <motion.button type="submit" whileTap={{ scale: 0.97 }}
                          disabled={loading || otpCode.length < 6} className="btn-primary disabled:opacity-60">
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verifying...
                            </span>
                          ) : "Verify & Sign In ✓"}
                        </motion.button>

                        <button type="button" onClick={handleSendOtp}
                          disabled={otpCooldown > 0 || loading}
                          className="text-sm text-blue-600 font-semibold text-center disabled:text-slate-400">
                          {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Resend OTP"}
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </form>
              )}

              {/* Divider + Register */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">New to Helpet?</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <Link href="/register">
                <motion.div whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl border-2 border-blue-100 text-blue-600 font-bold text-center text-sm hover:bg-blue-50 transition-colors">
                  Create New Account
                </motion.div>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
