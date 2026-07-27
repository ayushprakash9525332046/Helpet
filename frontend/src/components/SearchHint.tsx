"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const SEARCH_HINTS = [
  "'AC service'",
  "'sofa cleaning'",
  "'plumber'",
  "'geyser repair'",
  "'wall painting'",
  "'pest control'",
];

export function useSearchHintIndex(intervalMs = 2500) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SEARCH_HINTS.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return idx;
}

export function RotatingHint({ className = "" }: { className?: string }) {
  const idx = useSearchHintIndex();

  return (
    <span className="inline-block h-5 overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`inline-block whitespace-nowrap ${className}`}
        >
          {SEARCH_HINTS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
