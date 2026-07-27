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
import HeroMedia from "@/components/HeroMedia";
import { RotatingHint } from "@/components/SearchHint";
import {
  Search, CalendarDays, MapPin, ShieldCheck, Clock, Receipt,
  Star, CheckCircle2, ArrowRight, ChevronRight, ChevronDown,
} from "lucide-react";

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
    step: "1",
    icon: Search,
    title: "Pick a service",
    desc: "120+ services, every price upfront. No hidden charges, ever.",
  },
  {
    step: "2",
    icon: CalendarDays,
    title: "Choose your slot",
    desc: "Same-day and next-day availability across Dehradun.",
  },
  {
    step: "3",
    icon: CheckCircle2,
    title: "Sit back",
    desc: "A verified pro arrives and gets it done. Pay after the job.",
  },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Background-verified pros" },
  { icon: Clock, label: "Same-day slots" },
  { icon: Receipt, label: "Transparent pricing" },
  { icon: Star, label: "Rated 4.9 by customers" },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Logged-in users go straight to their dashboard
  useEffect(() => {
    if (!isLoading && user) router.replace("/home");
  }, [user, isLoading, router]);

  useEffect(() => {
    Promise.all([api.get("/services/categories"), api.get("/services/?limit=4")])
      .then(([cat, svc]) => {
        setCategories(cat.data);
        setServices(svc.data);
      })
      .finally(() => setDataLoading(false));
  }, []);

  // Show splash while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            <Image src="/assets/helpet-logo-v2.png" alt="Helpet" width={56} height={56} loading="eager" className="w-full h-full object-cover" />
          </div>
          <p className="text-ink-soft text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Public Navbar ──────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-line">
        <div className="container-fluid flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src="/assets/helpet-logo-v2.png"
                  alt="Helpet"
                  width={32}
                  height={32}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-lg text-ink tracking-tight">helpet</span>
            </Link>
            <span className="hidden sm:flex items-center gap-1 text-sm text-ink-soft border-l border-line pl-3 md:pl-4">
              <MapPin size={14} className="text-brand-600" />
              Dehradun
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/categories"
              className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Browse services
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink hover:text-brand-600 transition-colors px-3 py-1.5 hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-colors active:scale-[0.98]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="bg-white border-b border-line">
        <div className="container-fluid py-12 md:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-ink text-4xl md:text-5xl font-bold leading-[1.15] mb-4">
              Your home, handled.
            </h1>
            <p className="text-ink-soft text-base md:text-lg mb-8 max-w-md">
              Cleaning, plumbing, AC repair and 120+ services in Dehradun.
              Verified pros, upfront prices, same-day slots.
            </p>

            {/* Search pill */}
            <div className="flex items-center gap-2 bg-white border border-[#DBDBDB] rounded-2xl p-2 pl-4 max-w-xl focus-within:border-brand-600 focus-within:shadow-[0_0_0_3px_rgba(128,0,255,0.08)] transition-all">
              <Search size={18} className="text-ink-soft shrink-0" />
              <div className="relative flex-1">
                {!searchValue && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1 text-sm text-[#9A9AA0]">
                    Search for <RotatingHint />
                  </span>
                )}
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      router.push(`/categories?q=${encodeURIComponent(searchValue)}`);
                  }}
                  className="text-sm text-ink outline-none bg-transparent w-full"
                />
              </div>
              <Link
                href={`/categories${searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""}`}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-[0.98] shrink-0"
              >
                Search
              </Link>
            </div>

            {/* Quick tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["Cleaning", "Plumbing", "AC Repair", "Electrician"].map((tag) => {
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
                    className="text-xs font-medium text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                );
              })}
            </div>

            {/* Trust line */}
            <p className="flex items-center gap-1.5 text-sm text-ink-soft mt-6">
              <CheckCircle2 size={15} className="text-rating" />
              4.9 avg rating · 380+ jobs done · 40+ professionals in Dehradun
            </p>
          </motion.div>

          {/* Hero media — image first, video once buffered, tint fallback */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="hidden lg:block"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-50">
              <HeroMedia />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category rail ─────────────────────────────── */}
      <section className="container-fluid pt-12 md:pt-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-ink font-bold text-xl md:text-2xl">
            What do you need help with?
          </h2>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors"
          >
            See all <ChevronRight size={15} />
          </Link>
        </div>
        <ServiceCategoriesGrid categories={categories} loading={dataLoading} />
      </section>

      {/* ── Popular services ──────────────────────────── */}
      <section className="bg-[#FAFAFA] border-y border-line mt-12 md:mt-16">
        <div className="container-fluid py-12 md:py-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-ink font-bold text-xl md:text-2xl">
              Popular in Dehradun
            </h2>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors"
            >
              See all <ChevronRight size={15} />
            </Link>
          </div>

          {dataLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton rounded-xl h-64" />
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
      </section>

      {/* ── Trust strip ───────────────────────────────── */}
      <section className="container-fluid py-8">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2 text-sm text-ink-soft">
              <Icon size={16} className="text-brand-600" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section className="container-fluid py-12 md:py-16">
        <h2 className="text-ink font-bold text-xl md:text-2xl mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="bg-white border border-line rounded-xl p-6">
              <div className="w-11 h-11 rounded-[10px] bg-brand-50 flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-600" strokeWidth={1.75} />
              </div>
              <h3 className="text-ink font-semibold text-base mb-1">
                {step}. {title}
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="container-fluid py-12 md:py-16">
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

        <h2 className="text-ink font-bold text-xl md:text-2xl mb-6">
          Frequently asked questions
        </h2>

        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-4 md:py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-ink text-sm md:text-base leading-snug group-hover:text-brand-700 transition-colors">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="shrink-0 text-ink-soft"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-ink-soft text-sm leading-relaxed max-w-2xl">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section className="container-fluid pb-16 md:pb-20 pt-4">
        <div className="bg-brand-50 rounded-[20px] p-8 md:p-14 text-center">
          <h2 className="text-ink font-bold text-2xl md:text-3xl mb-2">
            Book on a weekend, get 20% off
          </h2>
          <p className="text-ink-soft text-sm md:text-base mb-8 max-w-md mx-auto">
            Pick any Saturday or Sunday slot and save 20% on your service.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/categories"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors active:scale-[0.98] text-sm md:text-base inline-flex items-center justify-center gap-2"
            >
              Browse services <ArrowRight size={17} />
            </Link>
            <Link
              href="/register"
              className="bg-white border border-line hover:border-brand-300 text-ink font-medium px-7 py-3.5 rounded-xl transition-colors text-sm md:text-base inline-flex items-center justify-center"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
