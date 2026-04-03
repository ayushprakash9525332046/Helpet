"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    gradient: "from-blue-600 via-blue-500 to-indigo-600",
    lightBg: "from-blue-50 to-indigo-50",
    accent: "#2563EB",
    emoji: "🏠",
    floats: ["🔧", "⚡", "🪣"],
    title: "Find the Best Service\nfor Your Home",
    subtitle: "Browse 200+ verified professionals for every home need — plumbing, cleaning, electrical and more.",
    badge: "Trusted by 50,000+ families",
  },
  {
    gradient: "from-violet-600 via-purple-500 to-fuchsia-600",
    lightBg: "from-violet-50 to-fuchsia-50",
    accent: "#7C3AED",
    emoji: "💰",
    floats: ["⭐", "🏆", "✅"],
    title: "Quality Service That\nFits Your Budget",
    subtitle: "Compare prices, read real reviews, and book the right professional without ever overpaying.",
    badge: "Save up to 30% vs market rate",
  },
  {
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    lightBg: "from-emerald-50 to-cyan-50",
    accent: "#059669",
    emoji: "🌟",
    floats: ["🛡️", "✨", "🎯"],
    title: "Trusted Pros,\nGuaranteed Results",
    subtitle: "Every professional is background-verified. Not satisfied? We'll make it right — full refund guaranteed.",
    badge: "100% satisfaction guarantee",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();

  const navigate = (next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  };

  const handleNext = () => {
    if (current < slides.length - 1) navigate(current + 1);
    else {
      localStorage.setItem("onboarding_done", "1");
      router.push("/login");
    }
  };

  const skip = () => {
    localStorage.setItem("onboarding_done", "1");
    router.push("/login");
  };

  const slide = slides[current];

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Skip */}
      <div className="flex justify-end px-6 pt-12 z-10 relative">
        <motion.button
          onClick={skip}
          className="text-sm font-semibold text-slate-400 bg-slate-100 px-4 py-2 rounded-full"
          whileTap={{ scale: 0.95 }}
        >
          Skip
        </motion.button>
      </div>

      {/* Illustration area */}
      <div className="flex-1 relative flex items-center justify-center px-8 -mt-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {/* Card */}
            <div className={`relative bg-gradient-to-br ${slide.lightBg} rounded-3xl p-8 overflow-hidden`}
              style={{ minHeight: 300 }}>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                style={{ background: slide.accent }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: slide.accent }} />

              {/* Floating emojis */}
              {slide.floats.map((f, i) => (
                <motion.span
                  key={f}
                  className="absolute text-2xl select-none"
                  style={{
                    top: `${[20, 50, 75][i]}%`,
                    right: `${[10, 5, 15][i]}%`,
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {f}
                </motion.span>
              ))}

              {/* Main emoji */}
              <motion.div
                className="flex items-center justify-center"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center text-6xl shadow-2xl`}>
                  {slide.emoji}
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex justify-center"
              >
                <span className="text-xs font-bold px-4 py-2 rounded-full text-white shadow-lg"
                  style={{ background: slide.accent }}>
                  ✦ {slide.badge}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-6 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="text-[26px] font-extrabold text-slate-800 leading-tight mt-6 whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mt-3">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-6 mb-7">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => navigate(i)}
              animate={{ width: i === current ? 28 : 8 }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
              style={{ background: i === current ? slide.accent : "#E2E8F0" }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}dd)` }}
        >
          {current === slides.length - 1 ? "Get Started →" : "Next →"}
        </motion.button>
      </div>
    </div>
  );
}
