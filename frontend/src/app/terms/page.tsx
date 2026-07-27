"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Users,
  CreditCard,
  AlertTriangle,
  Ban,
  Scale,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    title: "1. Eligibility & Account",
    body: [
      "You must be at least 18 years old to register and use Helpet.",
      "You agree to provide accurate, current, and complete information during registration.",
      "You are responsible for maintaining the confidentiality of your login credentials.",
      "Helpet reserves the right to suspend or terminate accounts that violate these Terms.",
      "One person may not operate multiple customer accounts to abuse promotional offers.",
    ],
  },
  {
    icon: FileText,
    color: "bg-violet-100 text-violet-600",
    title: "2. Services & Bookings",
    body: [
      "Helpet is a platform that connects customers with independent service professionals — we are not the service provider.",
      "All bookings are subject to provider availability and location coverage.",
      "You must ensure someone is present at the service address at the scheduled time.",
      "Service prices shown are inclusive of labour only unless explicitly stated otherwise (e.g., material cost extra).",
      "Helpet reserves the right to cancel or reschedule bookings due to unforeseen circumstances.",
    ],
  },
  {
    icon: CreditCard,
    color: "bg-green-100 text-green-600",
    title: "3. Payments & Refunds",
    body: [
      "Payments are processed securely through Razorpay. Helpet does not store card or UPI details.",
      "Full payment is collected at the time of booking confirmation.",
      "Cancellations made more than 4 hours before the scheduled time are eligible for a 100% refund.",
      "Cancellations within 4 hours are non-refundable. No-shows by the customer attract a ₹99 convenience fee.",
      "Refunds (where applicable) are processed within 5–7 business days to the original payment method.",
    ],
  },
  {
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-600",
    title: "4. Provider Conduct",
    body: [
      "All providers on Helpet are background-checked and verified; however, we do not guarantee their conduct.",
      "If a provider behaves inappropriately, you must report it immediately via the app or at support@helpet.com.",
      "Providers are independent contractors, not employees of Helpet.",
      "Helpet is not liable for property damage caused by providers — each case is reviewed individually.",
      "Customer reviews must be honest and based on actual experience; fake reviews will lead to account suspension.",
    ],
  },
  {
    icon: Ban,
    color: "bg-red-100 text-red-600",
    title: "5. Prohibited Activities",
    body: [
      "You may not use Helpet to book services for illegal or unlawful purposes.",
      "Harassment, threats, or abusive language toward providers or support staff is strictly prohibited.",
      "Attempting to contact providers directly to bypass the platform and avoid platform fees is not allowed.",
      "Scraping, reverse-engineering, or copying any part of the Helpet platform is prohibited.",
      "Creating fake bookings, fraudulent reviews, or misuse of referral credits will result in a permanent ban.",
    ],
  },
  {
    icon: Scale,
    color: "bg-teal-100 text-teal-600",
    title: "6. Liability & Governing Law",
    body: [
      "Helpet's total liability for any claim arising from platform use shall not exceed the amount paid for the relevant booking.",
      "We are not liable for indirect, incidental, or consequential damages.",
      "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Dehradun, Uttarakhand.",
      "For any grievance, contact: legal@helpet.com within 30 days of the incident.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="bg-white border-b border-line px-5 pt-6 pb-5">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-ink-soft text-sm font-medium mb-4 w-fit"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h1 className="text-ink text-2xl font-bold leading-tight">Terms and conditions</h1>
          <p className="text-ink-soft text-sm mt-1">Effective from: 1 April 2026</p>
        </motion.div>
      </div>

      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 -mt-5 bg-white rounded-2xl p-4 shadow-lg border border-slate-100 relative z-10"
      >
        <p className="text-slate-600 text-sm leading-relaxed">
          Please read these Terms &amp; Conditions carefully before using the{" "}
          <span className="font-bold text-slate-800">Helpet</span> platform. By
          creating an account or placing a booking, you agree to be bound by
          these terms.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="px-5 mt-5 flex flex-col gap-4">
        {SECTIONS.map(({ icon: Icon, color, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
              >
                <Icon size={16} />
              </div>
              <h2 className="text-slate-800 font-extrabold text-sm">{title}</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {body.map((point, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-slate-600 text-xs leading-relaxed"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-slate-400 text-xs mt-8 px-8 pb-2">
        Helpet Technologies Pvt. Ltd. · Dehradun, India
        <br />
        Questions? Email <span className="text-blue-500">legal@helpet.com</span>
      </p>
    </div>
  );
}
