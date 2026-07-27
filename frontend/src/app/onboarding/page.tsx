"use client";
// NOTE: Onboarding is no longer forced on first visit.
// The root "/" now shows the public landing page directly.
// This page is kept intact and accessible at /onboarding for future use
// (e.g. mobile app intro, optional guided tour, etc.)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Star, Shield, Zap, Award, CheckCircle2, IndianRupee, LucideIcon } from "lucide-react";

const slides: {
  gradient: string;
  lightBg: string;
  accent: string;
  icon: LucideIcon;
  floatIcons: LucideIcon[];
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    gradient: "",
    lightBg: "",
    accent: "#8000FF",
    icon: Home,
    floatIcons: [Zap, Star, Shield],
    title: "Every home service,\none app",
    subtitle: "Plumbing, cleaning, electrical and 120+ more services across Dehradun.",
    badge: "Verified professionals",
  },
  {
    gradient: "",
    lightBg: "",
    accent: "#8000FF",
    icon: IndianRupee,
    floatIcons: [Star, Award, CheckCircle2],
    title: "Prices you see\nbefore you book",
    subtitle: "Every price upfront. No hidden charges, no last-minute surprises.",
    badge: "Transparent pricing",
  },
  {
    gradient: "",
    lightBg: "",
    accent: "#8000FF",
    icon: Shield,
    floatIcons: [Shield, Zap, CheckCircle2],
    title: "Background-checked,\nquality guaranteed",
    subtitle: "Not satisfied? Free redo or full refund within 24 hours — no questions asked.",
    badge: "Satisfaction guarantee",
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
  const MainIcon = slide.icon;

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
            <div className="relative bg-brand-50 rounded-2xl p-8 overflow-hidden"
              style={{ minHeight: 300 }}>

              {/* Supporting icons */}
              {slide.floatIcons.map((FloatIcon, i) => (
                <div
                  key={i}
                  className="absolute w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-line"
                  style={{
                    top: `${[18, 48, 72][i]}%`,
                    right: `${[8, 4, 12][i]}%`,
                  }}
                >
                  <FloatIcon size={16} className="text-brand-600" />
                </div>
              ))}

              {/* Main icon */}
              <div className="flex items-center justify-center pt-6">
                <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center border border-line">
                  <MainIcon size={48} className="text-brand-600" strokeWidth={1.5} />
                </div>
              </div>

              {/* Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex justify-center"
              >
                <span className="text-xs font-medium px-4 py-2 rounded-full bg-white text-brand-700 border border-line">
                  {slide.badge}
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
            <h1 className="text-[26px] font-bold text-ink leading-tight mt-6 whitespace-pre-line">
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
              style={{ background: i === current ? "#8000FF" : "#EBEBEB" }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
        >
          {current === slides.length - 1 ? "Get started" : "Next"}
        </motion.button>
      </div>
    </div>
  );
}
