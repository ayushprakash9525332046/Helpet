"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Service, ServiceCategory } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";
import ServiceCategoriesGrid from "@/components/ServiceCategoriesGrid";
import Footer from "@/components/Footer";
import {
  Search, ChevronRight, CalendarDays, Sparkles, Shield, Clock,
  Users, CheckCircle2, Star, ArrowRight, Gift, ChevronDown,
} from "lucide-react";


const STATS = [
  { icon: Users,         value: "40+",  label: "Professionals", color: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: CheckCircle2,  value: "380+", label: "Jobs Done",     color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Star,          value: "4.9",  label: "Avg Rating",    color: "text-amber-500",  bg: "bg-amber-50"  },
];

const PROMO_CARDS = [
  { gradient: "from-rose-500 to-orange-500",  icon: Gift,     label: "SPECIAL OFFER",   title: "Flat ₹200 off on first booking",   cta: "Claim Now"  },
  { gradient: "from-emerald-500 to-teal-600", icon: Sparkles, label: "TOP RATED",        title: "Trusted by Dehradun households",   cta: "Explore"    },
  { gradient: "from-blue-500 to-cyan-500",    icon: Shield,   label: "SECURE BOOKING",   title: "100% Satisfaction Guaranteed",     cta: "Book Safe"  },
];

const FAQS = [
  {
    q: "Where does Helpet currently operate?",
    a: "Helpet is currently live in Dehradun, Uttarakhand. We cover all major localities including Rajpur Road, Clement Town, Prem Nagar, Dalanwala, Ballupur, Saharanpur Road, Raipur, Jakhan, and surrounding areas. We are actively expanding to other cities — sign up to get notified when we launch near you.",
  },
  {
    q: "What home services can I book in Dehradun?",
    a: "Helpet offers 120+ home services in Dehradun across categories including deep cleaning, sofa & carpet cleaning, bathroom cleaning, plumbing, electrical repairs, AC service & repair, inverter/geyser repair, wall painting, pest control, carpentry, CCTV installation, and more. New services are added regularly.",
  },
  {
    q: "How do I book a home service in Dehradun?",
    a: "Booking takes under 2 minutes. Open Helpet, search or browse for your service, pick a date and time slot that works for you, enter your Dehradun address, and confirm. A verified local professional will arrive at your doorstep. You can track your booking in real time.",
  },
  {
    q: "Are Helpet's professionals in Dehradun verified?",
    a: "Yes. Every professional on Helpet undergoes a multi-step verification including Aadhaar-based identity check, address verification, skill assessment, and a background check. Only professionals who pass all checks are onboarded. You can also see ratings and reviews before booking.",
  },
  {
    q: "How much does a home service cost in Dehradun?",
    a: "All prices are shown upfront — no hidden charges, no last-minute surprises. In Dehradun, home cleaning starts at ₹299, AC servicing at ₹349, plumbing fixes at ₹199, and electrical work at ₹199. Prices vary by service complexity and duration.",
  },
  {
    q: "Is same-day or emergency home service available in Dehradun?",
    a: "Yes! Same-day booking is available for most services in Dehradun, subject to professional availability in your locality. For urgent needs like a plumbing leak, electrical fault, or AC breakdown, choose the earliest slot and we will dispatch the nearest available professional.",
  },
  {
    q: "What is Helpet's satisfaction guarantee?",
    a: "Your satisfaction is 100% guaranteed. If you're not happy with the quality of service, raise a concern within 24 hours of job completion and we'll arrange a free redo or process a full refund — no questions asked. Our support team is available 7 days a week.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Browse Services",
    desc: "Explore 120+ services across categories in Dehradun. See pricing upfront — no surprises.",
  },
  {
    step: "02",
    icon: CalendarDays,
    title: "Pick a Slot",
    desc: "Choose a date and time that works for you. Same-day slots available.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Service Done",
    desc: "A verified professional arrives. Pay after the job is complete.",
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices]     = useState<Service[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [promoIdx, setPromoIdx]     = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [openFaq, setOpenFaq]       = useState<number | null>(null);

  // Logged-in users go straight to their dashboard
  useEffect(() => {
    if (!isLoading && user) router.replace("/home");
  }, [user, isLoading, router]);

  useEffect(() => {
    Promise.all([api.get("/services/categories"), api.get("/services/")])
      .then(([cat, svc]) => {
        setCategories(cat.data);           // store all for tag lookup
        setServices(svc.data.slice(0, 4));
      })
      .finally(() => setDataLoading(false));

    const t = setInterval(() => setPromoIdx((p) => (p + 1) % PROMO_CARDS.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Show splash while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-600">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            <Image src="/assets/helpet-logo.png" alt="Helpet" width={56} height={56} className="w-full h-full object-cover" />
          </div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* ── Public Navbar ──────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="container-fluid flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-blue-200">
              <Image
                src="/assets/helpet-logo.png"
                alt="Helpet"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-black text-lg text-slate-800 tracking-tight leading-none">
                Helpet
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Home Services
              </p>
            </div>
          </Link>

          {/* Desktop centre links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/categories"
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/categories"
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5 hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 md:px-5 py-2 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="gradient-animated px-5 md:px-6 pt-12 pb-14 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full" />
        <div className="absolute top-16 right-10 w-24 h-24 bg-white/10 rounded-2xl rotate-12" />
        <div className="absolute -bottom-6 left-4 w-40 h-40 bg-white/5 rounded-full" />

        <div className="container-fluid relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] bg-white/10 px-4 py-1.5 rounded-full border border-white/10 inline-block mb-4 md:mb-5">
              Dehradun&apos;s Trusted Home Service App
            </span>
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-4 md:mb-5">
              Home Services in Dehradun
              <br />
              <span className="text-blue-200">at Your Doorstep</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg font-medium mb-8 max-w-xl leading-relaxed">
              Book verified local professionals for cleaning, plumbing, AC repair, and
              120+ services in Dehradun. Same-day booking, transparent pricing.
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-2 shadow-2xl shadow-blue-900/30 max-w-xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={18} className="text-blue-400 shrink-0" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      router.push(
                        `/categories?q=${encodeURIComponent(searchValue)}`,
                      );
                  }}
                  placeholder="Search home services in Dehradun..."
                  className="text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none bg-transparent w-full"
                />
              </div>
              <Link
                href={`/categories${searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shrink-0"
              >
                Search
              </Link>
            </div>

            {/* Quick tags — resolve to /categories/[id] once categories load */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "Cleaning",
                "Plumbing",
                "AC Repair",
                "Electrician",
                "Painting",
              ].map((tag) => {
                const match = categories.find(
                  (c) =>
                    c.name.toLowerCase().includes(tag.toLowerCase()) ||
                    tag.toLowerCase().includes(c.name.toLowerCase()),
                );
                const href = match
                  ? `/categories/${match.id}`
                  : `/categories?q=${encodeURIComponent(tag)}`;
                return (
                  <Link
                    key={tag}
                    href={href}
                    className="text-xs font-bold text-white/80 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 rounded-full transition-all"
                  >
                    {tag}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="container-fluid -mt-5 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 grid grid-cols-3 divide-x divide-slate-100"
        >
          {STATS.map(({ icon: Icon, value, label, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-5 md:py-7 gap-2"
            >
              <div
                className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center ${color} mb-1`}
              >
                <Icon
                  size={18}
                  fill={label.includes("Rating") ? "currentColor" : "none"}
                />
              </div>
              <span className="text-lg md:text-2xl font-black text-slate-800">
                {value}
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="container-fluid">
        {/* ── Promo Carousel ────────────────────────────── */}
        <div className="mt-8 md:mt-10">
          <div className="relative h-36 md:h-44 rounded-2xl overflow-hidden shadow-xl">
            <AnimatePresence initial={false}>
              {PROMO_CARDS.map((card, i) =>
                promoIdx === i ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className={`absolute inset-0 bg-linear-to-r ${card.gradient} p-6 md:p-10 flex items-center justify-between overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div>
                      <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded-md">
                        {card.label}
                      </span>
                      <p className="text-white font-black text-lg md:text-xl mt-2 mb-4">
                        {card.title}
                      </p>
                      <Link
                        href="/categories"
                        className="bg-white text-blue-600 text-xs font-black px-5 py-2 rounded-xl inline-flex items-center gap-2 hover:bg-blue-50 transition-all"
                      >
                        {card.cta} <ChevronRight size={14} />
                      </Link>
                    </div>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30 shadow-xl shrink-0"
                    >
                      <card.icon size={32} className="text-white md:w-12 md:h-12" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                ) : null,
              )}
            </AnimatePresence>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 p-1 bg-black/10 backdrop-blur-md rounded-full">
              {PROMO_CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPromoIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${promoIdx === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Service Categories ────────────────────────── */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-end justify-between mb-5 md:mb-7">
            <div>
              <h2 className="text-slate-800 font-black text-xl md:text-2xl lg:text-3xl tracking-tight">
                Our Services
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-0.5">
                Professional help for every task
              </p>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-blue-600 text-xs md:text-sm font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
            >
              See All <ChevronRight size={14} />
            </Link>
          </div>

          <ServiceCategoriesGrid categories={categories} loading={dataLoading} />
        </div>

        {/* ── How It Works ──────────────────────────────── */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-slate-800 font-black text-xl md:text-2xl lg:text-3xl tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Book a service in 3 simple steps
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>

                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                  Step {step}
                </span>
                <h3 className="text-slate-800 font-black text-base md:text-lg mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust Badges ──────────────────────────────── */}
        {/* <div className="mt-16 md:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: <Shield size={24} className="text-green-600" />,  bg: "bg-green-50",  label: "Verified Pros",   desc: "Every professional is background checked and verified for your safety."              },
              { icon: <Clock size={24} className="text-blue-600" />,    bg: "bg-blue-50",   label: "On-Time Always",  desc: "We value your time. If we're late, you get a discount on your service."            },
              { icon: <Sparkles size={24} className="text-amber-500" />, bg: "bg-amber-50", label: "Top Quality",     desc: "Our professionals are experts in their fields, ensuring best-in-class results."    },
            ].map(({ icon, bg, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-6 md:p-8 flex flex-row md:flex-col items-center md:items-start gap-5 md:gap-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>{icon}</div>
                <div>
                  <span className="text-sm md:text-base font-black text-slate-800 block">{label}</span>
                  <p className="text-xs md:text-sm text-slate-400 font-medium mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* ── Popular Services ──────────────────────────── */}
        <div className="mt-16 md:mt-20 mb-8 md:mb-16">
          <div className="flex items-end justify-between mb-7 md:mb-10">
            <div>
              <h2 className="text-slate-800 font-black text-xl md:text-2xl lg:text-3xl tracking-tight">
                Popular Services
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-1">
                High-rated services by customers
              </p>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-2 text-blue-600 text-xs md:text-sm font-bold bg-blue-50 hover:bg-blue-100 px-5 py-2 rounded-2xl transition-all"
            >
              See All <ChevronRight size={16} />
            </Link>
          </div>

          {dataLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {services.map((svc, i) => (
                <ServiceCard key={svc.id} service={svc} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── FAQ ───────────────────────────────────────── */}
        <div className="mt-16 md:mt-20 mb-8 md:mb-16">
          {/* JSON-LD FAQ Schema for Google rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />

          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-slate-800 font-black text-xl md:text-2xl lg:text-3xl tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Everything you need to know before booking
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 md:py-5 text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="text-blue-600" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-3">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA Banner ────────────────────────────────── */}
        <div className="mb-16 md:mb-20">
          <div className="gradient-animated rounded-2xl md:rounded-3xl p-8 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <h2 className="text-white font-black text-2xl md:text-3xl lg:text-4xl mb-3 tracking-tight">
                Book a Home Service in Dehradun Today
              </h2>
              <p className="text-white/80 text-sm md:text-base font-medium mb-8 max-w-md mx-auto">
                Join hundreds of happy Dehradun households. Book your first service
                and get ₹200 off — no coupon needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/categories"
                  className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-sm md:text-base inline-flex items-center justify-center gap-2"
                >
                  Browse Services <ArrowRight size={18} />
                </Link>
                <Link
                  href="/register"
                  className="bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all text-sm md:text-base inline-flex items-center justify-center"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
