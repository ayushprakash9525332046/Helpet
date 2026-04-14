"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Bell,
  Mail,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Database,
    color: "bg-blue-100 text-blue-600",
    title: "Information We Collect",
    body: [
      "Personal details you provide during registration — name, phone number, email address, and profile picture.",
      "Location data (city / pincode) to match you with nearby service providers.",
      "Booking history, service preferences, and payment transaction records.",
      "Device information such as IP address, browser type, and app version for security and analytics.",
    ],
  },
  {
    icon: Eye,
    color: "bg-violet-100 text-violet-600",
    title: "How We Use Your Information",
    body: [
      "To create and manage your Helpet account and authenticate you securely.",
      "To connect you with verified local service professionals (carpenters, plumbers, electricians, etc.).",
      "To send booking confirmations, OTPs, service reminders, and important updates via SMS or push notification.",
      "To process payments securely through Razorpay and issue refunds where applicable.",
      "To improve our platform — analyse usage patterns and fix issues.",
    ],
  },
  {
    icon: Lock,
    color: "bg-green-100 text-green-600",
    title: "Data Security",
    body: [
      "All passwords are hashed using bcrypt — we never store plain-text passwords.",
      "API communication is encrypted via HTTPS/TLS.",
      "Access tokens (JWT) expire after 30 minutes and are stored only in your device's local storage.",
      "Payment data is handled exclusively by Razorpay — Helpet never stores card details.",
      "Our servers are hosted in India and comply with IT Act 2000 data security requirements.",
    ],
  },
  {
    icon: Bell,
    color: "bg-amber-100 text-amber-600",
    title: "Sharing Your Information",
    body: [
      "We share your name, address, and contact with the assigned service provider only after a confirmed booking.",
      "We do not sell, rent, or trade your personal data to third parties for marketing.",
      "Aggregated, anonymised usage statistics may be shared with partners for improving the platform.",
      "We may disclose data when required by Indian law enforcement or court orders.",
    ],
  },
  {
    icon: Shield,
    color: "bg-pink-100 text-pink-600",
    title: "Your Rights",
    body: [
      "You may request a copy of all personal data we hold about you by emailing privacy@helpet.com.",
      "You can update your profile information anytime from the Edit Profile screen.",
      "You may request deletion of your account and associated data — we will process it within 30 days.",
      "You can opt out of promotional notifications from Settings → Notifications.",
    ],
  },
  {
    icon: Mail,
    color: "bg-teal-100 text-teal-600",
    title: "Contact Us",
    body: [
      "For privacy-related queries, write to: privacy@helpet.com",
      "Grievance Officer: support@helpet.com | Response within 72 hours.",
      "Registered Address: Helpet Technologies Pvt. Ltd., Dehradun, Uttarakhand – 248008.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <div className="gradient-animated px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-10 right-8 w-14 h-14 bg-white/10 rounded-2xl rotate-12" />

        <Link
          href="/profile"
          className="flex items-center gap-2 text-white/80 text-sm font-semibold mb-5 w-fit"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 border border-white/30">
            <Shield size={22} className="text-white" />
          </div>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Helpet
          </p>
          <h1 className="text-white text-2xl font-extrabold leading-tight">
            Privacy Policy
          </h1>
          <p className="text-blue-200 text-xs mt-2">
            Last updated: 1 April 2026
          </p>
        </motion.div>
      </div>

      {/* Intro card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 -mt-5 bg-white rounded-2xl p-4 shadow-lg border border-slate-100 relative z-10"
      >
        <p className="text-slate-600 text-sm leading-relaxed">
          At <span className="font-bold text-slate-800">Helpet</span>, we
          respect your privacy and are committed to protecting the personal
          information you share with us. This policy explains what data we
          collect, how we use it, and the choices you have.
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

      <p className="text-center text-slate-400 text-xs mt-8 px-8">
        By using Helpet, you agree to this Privacy Policy. We may update it
        occasionally — changes will be notified in-app.
      </p>
    </div>
  );
}
