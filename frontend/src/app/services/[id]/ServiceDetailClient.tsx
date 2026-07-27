"use client";

import { useState, createElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Service, SubService } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import { resolveImage } from "@/lib/image";
import BackHeader from "@/components/BackHeader";
import {
  Clock, Shield, Zap, Award, Users, ChevronRight, IndianRupee, Check,
} from "lucide-react";

const INCLUDED = [
  { icon: Shield, text: "Background-verified professional" },
  { icon: Zap, text: "Instant booking confirmation" },
  { icon: Award, text: "Satisfaction guarantee or refund" },
  { icon: Users, text: "Post-service quality check" },
];

export default function ServiceDetailClient({ service }: { service: Service }) {
  const router = useRouter();

  const subServices = service.sub_services ?? [];
  const hasSubServices = subServices.length > 0;
  const [selectedSub, setSelectedSub] = useState<SubService | null>(
    hasSubServices ? subServices[0] : null
  );

  const displayPrice = selectedSub ? selectedSub.price : service.price;

  const goToBook = () => {
    if (selectedSub) {
      const params = new URLSearchParams({
        sub_id: selectedSub.id,
        sub_name: selectedSub.name,
        sub_price: String(selectedSub.price),
      });
      router.push(`/book/${service.id}?${params.toString()}`);
    } else {
      router.push(`/book/${service.id}`);
    }
  };

  const imgSrc = resolveImage(service.image, 800);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-28 md:pb-16">
      <BackHeader title="Service details" />

      <div className="container-fluid py-5 md:py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left column — image */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className="rounded-2xl aspect-[16/9] bg-brand-50 flex items-center justify-center relative overflow-hidden"
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={service.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                createElement(getServiceIcon(service.name), {
                  size: 64,
                  className: "text-brand-300",
                  strokeWidth: 1.25,
                })
              )}
              <span className="absolute top-3 left-3 bg-white text-ink text-xs font-medium px-3 py-1.5 rounded-lg border border-line">
                {service.category.name}
              </span>
            </motion.div>

            {/* Desktop: description under image */}
            {service.description && (
              <div className="hidden lg:block mt-8">
                <h2 className="font-bold text-ink text-lg mb-3">About this service</h2>
                <p className="text-ink-soft text-[15px] leading-relaxed max-w-2xl">{service.description}</p>
              </div>
            )}
          </div>

          {/* Right column — details */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
              <h1 className="text-xl md:text-2xl font-bold text-ink leading-tight tracking-tight">
                {service.name}
              </h1>

              {/* Price · duration row */}
              <div className="flex items-center gap-4 mt-3 pb-5 border-b border-line">
                <span className="flex items-center text-ink font-bold text-lg">
                  <IndianRupee size={16} strokeWidth={2.5} />
                  {Number(displayPrice).toLocaleString("en-IN")}
                  {hasSubServices && <span className="text-ink-soft text-sm font-normal ml-1">onwards</span>}
                </span>
                <span className="flex items-center gap-1.5 text-ink-soft text-sm">
                  <Clock size={14} />
                  {service.duration_minutes} min
                </span>
              </div>

              {hasSubServices && (
                <div className="mt-6">
                  <h2 className="font-bold text-ink text-base mb-3">Choose an option</h2>
                  <div className="flex flex-col gap-2.5">
                    {subServices.map((sub) => {
                      const active = selectedSub?.id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSub(sub)}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                            active
                              ? "border-brand-600 bg-brand-50"
                              : "border-line bg-white hover:border-brand-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                active ? "border-brand-600" : "border-[#C9C9CE]"
                              }`}
                            >
                              {active && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-medium text-ink text-sm">{sub.name}</span>
                              {sub.description && (
                                <span className="block text-xs text-ink-soft mt-0.5">{sub.description}</span>
                              )}
                            </span>
                          </div>
                          <span className="flex items-center font-semibold text-ink text-sm shrink-0">
                            <IndianRupee size={13} strokeWidth={2.5} />
                            {Number(sub.price).toLocaleString("en-IN")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What's included */}
              <div className="mt-6">
                <h2 className="font-bold text-ink text-base mb-3">What&apos;s included</h2>
                <ul className="flex flex-col gap-2.5">
                  {INCLUDED.map(({ text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-ink-soft">
                      <span className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-brand-600" strokeWidth={2.5} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile: description */}
              {service.description && (
                <div className="lg:hidden mt-6">
                  <h2 className="font-bold text-ink text-base mb-2">About this service</h2>
                  <p className="text-ink-soft text-sm leading-relaxed">{service.description}</p>
                </div>
              )}

              {/* Desktop CTA */}
              <button
                onClick={goToBook}
                className="hidden md:flex mt-8 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl text-[15px] transition-colors active:scale-[0.98] items-center justify-center gap-2"
              >
                Book now <ChevronRight size={17} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-line px-4 py-3 z-50"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <p className="text-xs text-ink-soft">Total</p>
            <span className="text-lg font-bold text-ink leading-none">
              ₹{Number(displayPrice).toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={goToBook}
            className="flex-1 bg-brand-600 text-white font-semibold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform"
          >
            Book now
          </button>
        </div>
      </div>
    </div>
  );
}
