"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, HelpCircle, ChevronDown, Phone, Mail,
  MessageCircle, Clock, AlertCircle, CreditCard, Star,
  CalendarX, Wrench,
} from "lucide-react";

// ── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    category: "Bookings",
    icon: CalendarX,
    color: "bg-blue-100 text-blue-600",
    items: [
      {
        q: "How do I book a service?",
        a: "Go to Home → tap any category (e.g. Electrician) → choose a service → pick a date & time → confirm booking. You'll receive an SMS confirmation instantly.",
      },
      {
        q: "Can I reschedule or cancel a booking?",
        a: "Yes. Go to My Bookings → tap the booking → select Reschedule or Cancel. Cancellations more than 4 hours before the appointment are fully refundable.",
      },
      {
        q: "What if the provider doesn't show up?",
        a: "Mark the booking as 'Provider No-show' inside the booking detail screen. We'll immediately assign a replacement and offer a 10% discount on the rebooking.",
      },
      {
        q: "Can I book for someone else's address?",
        a: "Absolutely. During checkout you can type any address — it doesn't have to be your registered address.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    icon: CreditCard,
    color: "bg-green-100 text-green-600",
    items: [
      {
        q: "Which payment methods are accepted?",
        a: "UPI (GPay, PhonePe, Paytm), debit/credit cards (Visa, Mastercard, RuPay), and net banking. All payments go through Razorpay — 100% secure.",
      },
      {
        q: "When will I get my refund?",
        a: "Eligible refunds are processed within 5–7 business days to your original payment method. You'll receive an email and SMS notification when the refund is initiated.",
      },
      {
        q: "I was charged twice for one booking. What do I do?",
        a: "Email billing@apnasewa.in with your booking ID and bank statement screenshot. We'll investigate and reverse the duplicate charge within 48 hours.",
      },
    ],
  },
  {
    category: "Service Quality",
    icon: Wrench,
    color: "bg-amber-100 text-amber-600",
    items: [
      {
        q: "What if I'm not happy with the service?",
        a: "Tap 'Rate this service' after the job. If you give 3 stars or below, you'll be asked for details — our quality team reviews every low-rated job and may offer a free re-service.",
      },
      {
        q: "Are the providers verified?",
        a: "Yes. Every provider goes through Aadhaar verification, skill assessment, and a background check before being listed on ApnaSewa.",
      },
      {
        q: "The provider damaged something. What now?",
        a: "Report it within 24 hours via Help & Support → 'Report Damage'. Attach photos. Our team will coordinate with the provider and insurance partner to resolve the claim.",
      },
    ],
  },
  {
    category: "Reviews",
    icon: Star,
    color: "bg-yellow-100 text-yellow-600",
    items: [
      {
        q: "Can I edit my review after submitting?",
        a: "Reviews can be edited within 7 days of submission. Go to My Bookings → the completed booking → Edit Review.",
      },
      {
        q: "Why was my review removed?",
        a: "Reviews that contain offensive language, personal contact details, or are flagged as fake are removed by our moderation team.",
      },
    ],
  },
  {
    category: "Account",
    icon: AlertCircle,
    color: "bg-pink-100 text-pink-600",
    items: [
      {
        q: "How do I change my phone number?",
        a: "Go to Profile → Edit Profile → tap Change Phone. You'll need to verify the new number via OTP.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the Login screen tap 'Forgot Password' and enter your registered phone number. An OTP will be sent to reset your password.",
      },
      {
        q: "How do I delete my account?",
        a: "Email privacy@apnasewa.in from your registered email with the subject 'Account Deletion Request'. We'll process it within 30 days.",
      },
    ],
  },
];

// ── Contact channels ──────────────────────────────────────────────────────────
const CONTACT = [
  {
    icon: MessageCircle,
    color: "bg-green-100 text-green-600",
    label: "WhatsApp Support",
    value: "+91 98765 43210",
    sub: "Mon – Sat, 9 AM – 7 PM",
    href: "https://wa.me/919876543210",
  },
  {
    icon: Phone,
    color: "bg-blue-100 text-blue-600",
    label: "Call Us",
    value: "1800-123-7878",
    sub: "Toll Free · 9 AM – 6 PM",
    href: "tel:18001237878",
  },
  {
    icon: Mail,
    color: "bg-violet-100 text-violet-600",
    label: "Email Support",
    value: "support@apnasewa.in",
    sub: "Reply within 24 hours",
    href: "mailto:support@apnasewa.in",
  },
];

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-50 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-3.5 px-4 text-left gap-3"
      >
        <span className="text-slate-700 text-sm font-semibold leading-snug">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={16} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-slate-500 text-xs leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HelpSupport() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-10 right-8 w-14 h-14 bg-white/10 rounded-2xl rotate-12" />

        <Link href="/profile" className="flex items-center gap-2 text-white/80 text-sm font-semibold mb-5 w-fit">
          <ArrowLeft size={16} /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 border border-white/30">
            <HelpCircle size={22} className="text-white" />
          </div>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">We're here for you</p>
          <h1 className="text-white text-2xl font-extrabold leading-tight">Help &amp; Support</h1>
        </motion.div>
      </div>

      {/* Response time badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mx-5 -mt-5 bg-white rounded-2xl p-4 shadow-lg border border-slate-100 relative z-10 flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
          <Clock size={18} className="text-green-600" />
        </div>
        <div>
          <p className="text-slate-800 font-bold text-sm">Average response time: &lt; 2 hours</p>
          <p className="text-slate-400 text-xs mt-0.5">Our support team is available Mon – Sat, 9 AM to 7 PM IST</p>
        </div>
      </motion.div>

      {/* Contact channels */}
      <div className="px-5 mt-5">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Contact Us</p>
        <div className="flex flex-col gap-3">
          {CONTACT.map(({ icon: Icon, color, label, value, sub, href }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:opacity-80"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shrink-0`}>
                <Icon size={19} />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-bold text-sm">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label} · {sub}</p>
              </div>
              <ChevronDown size={15} className="text-slate-300 -rotate-90" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="px-5 mt-6">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
          Frequently Asked Questions
        </p>
        <div className="flex flex-col gap-4">
          {FAQS.map(({ category, icon: Icon, color, items }, i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={14} />
                </div>
                <span className="text-slate-700 text-sm font-extrabold">{category}</span>
              </div>
              {items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mx-5 mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold leading-relaxed text-center">
          Couldn't find your answer? Drop us a message at{" "}
          <a href="mailto:support@apnasewa.in" className="underline">support@apnasewa.in</a>{" "}
          — we'll get back to you within 24 hours.
        </p>
      </div>
    </div>
  );
}
