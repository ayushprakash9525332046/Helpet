"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { Star, Send } from "lucide-react";

const REVIEW_LABELS = ["Terrible", "Poor", "Average", "Good", "Excellent"];
const LABEL_COLORS  = ["text-red-500", "text-orange-500", "text-amber-500", "text-blue-500", "text-green-500"];
const QUICK_TAGS = ["On time", "Professional", "Clean work", "Friendly", "Great value", "Highly skilled", "Would recommend"];

export default function WriteReview() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags]       = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleTag = (tag: string) =>
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating");
    setLoading(true);
    try {
      const fullComment = [comment, tags.length ? `Tags: ${tags.join(", ")}` : ""].filter(Boolean).join(" | ");
      await api.post("/reviews/", {
        booking_id: bookingId,
        provider_id: "00000000-0000-0000-0000-000000000000",
        rating,
        comment: fullComment || undefined,
      });
      router.replace("/review/thanks");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not submit review");
    } finally {
      setLoading(false);
    }
  };

  const display = hovered || rating;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      <BackHeader title="Write a Review" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 pt-8 pb-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="w-24 h-24 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-5 shadow-xl shadow-amber-200"
        >
          <span className="text-5xl">⭐</span>
        </motion.div>
        <h2 className="text-2xl font-extrabold text-slate-800 text-center">How was your experience?</h2>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-xs leading-relaxed">
          Your honest feedback helps others find trusted professionals
        </p>
      </motion.div>

      <div className="px-5 flex flex-col gap-6">
        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-3 bg-slate-50 rounded-3xl py-6"
        >
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.button
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
                whileTap={{ scale: 0.85 }}
                animate={{ scale: i <= display ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Star
                  size={44}
                  className={`transition-colors ${i <= display ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                />
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {display > 0 && (
              <motion.span
                key={display}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className={`text-base font-extrabold ${LABEL_COLORS[display - 1]}`}
              >
                {REVIEW_LABELS[display - 1]}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick tags */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-sm font-extrabold text-slate-800 mb-3">What stood out?</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag, i) => (
              <motion.button
                key={tag}
                onClick={() => toggleTag(tag)}
                whileTap={{ scale: 0.93 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  tags.includes(tag)
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {tags.includes(tag) ? "✓ " : ""}{tag}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Comment */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <p className="text-sm font-extrabold text-slate-800 mb-2.5">
            Add a comment
            <span className="text-slate-400 font-normal ml-2 text-xs">(Optional)</span>
          </p>
          <textarea
            placeholder="Tell others about your experience in detail..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none transition"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{comment.length}/300</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <>
              <Send size={16} /> Submit Review
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
