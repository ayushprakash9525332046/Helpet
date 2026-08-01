"use client";

import { useEffect, useState, createElement } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Service } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { Clock, CheckCircle2, Sparkles, LocateFixed, ChevronRight } from "lucide-react";
import { getServiceIcon } from "@/lib/icons";
import { resolveImage } from "@/lib/image";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatSlot(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function BookService() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, updateUser } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [address, setAddress] = useState(user?.address ?? "");
  const [locLoading, setLocLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const subServiceId = searchParams.get("sub_id") ?? undefined;
  const subServiceName = searchParams.get("sub_name") ?? undefined;
  const subServicePrice = searchParams.get("sub_price") ? Number(searchParams.get("sub_price")) : undefined;
  const basePrice = subServicePrice ?? service?.price ?? 0;
  const platformFeePct = service?.platform_fee_percentage ?? 15;
  const platformFeeAmount = Math.round(basePrice * platformFeePct / 100);
  const totalPrice = basePrice + platformFeeAmount;
  const days = getNext7Days();
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const todayHasSlots = TIME_SLOTS.some((t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m > nowMins;
  });
  const [selectedDate, setSelectedDate] = useState(todayHasSlots ? 0 : 1);
  const [selectedTime, setSelectedTime] = useState("");
  const availableSlots = TIME_SLOTS.filter((t) => {
    if (selectedDate !== 0) return true;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m > nowMins;
  });

  const fetchAddress = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address ?? {};
          const city    = a.city || a.town || a.village || a.county || "";
          const pincode = a.postcode || "";
          const fullAddress = data.display_name || [
            a.amenity || a.building,
            a.house_number,
            a.road || a.pedestrian || a.footway || a.path || a.street,
            a.quarter || a.neighbourhood || a.suburb,
            a.city_district || a.district,
            city,
            a.state,
            pincode,
          ].filter(Boolean).join(", ");
          setAddress(fullAddress);
          // persist to profile so it's ready on next visit
          const { data: updated } = await api.put("/users/me", {
            address: fullAddress,
            city:    city    || undefined,
            pincode: pincode || undefined,
          });
          updateUser(updated);
          toast.success("Location saved to your profile");
        } catch {
          toast.error("Could not fetch address");
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setLocLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    api.get(`/services/${serviceId}`).then((r) => setService(r.data));
  }, [serviceId]);

  const handleBook = async () => {
    // Gate: must be logged in to confirm a booking
    if (!user) {
      router.push(`/login?redirect=/book/${serviceId}`);
      return;
    }
    if (!address.trim()) return toast.error("Please enter your address");
    if (!selectedTime) return toast.error("Please select a time slot");
    const date = new Date(days[selectedDate]);
    const [h, m] = selectedTime.split(":").map(Number);
    date.setHours(h, m, 0, 0);
    setLoading(true);
    try {
      const res = await api.post("/bookings/", {
        service_id: serviceId,
        sub_service_id: subServiceId || undefined,
        scheduled_at: date.toISOString(),
        address,
        notes: notes || undefined,
      });
      const displayName = subServiceName
        ? `${service!.name} – ${subServiceName}`
        : service!.name;
      const params = new URLSearchParams({
        service: displayName,
        // Pass the pre-fee base price — the payment page derives and
        // displays its own fee breakdown from this + platform_fee_pct.
        // (res.data.total_amount is now fee-inclusive; using it here
        // would double-count the platform fee.)
        amount: String(basePrice),
        date: date.toISOString(),
        platform_fee_pct: String(platformFeePct),
      });
      router.push(`/payment/${res.data.id}?${params.toString()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title="Book service" />
      <div className="container-fluid pt-5 space-y-4">
        <div className="skeleton rounded-xl h-24" />
        <div className="skeleton rounded-xl h-32" />
        <div className="skeleton rounded-xl h-28" />
      </div>
    </div>
  );

  const imgSrc = resolveImage(service.image, 600);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-28 md:pb-28">
      <BackHeader title="Book service" />

      <div className="container-fluid pt-5 md:pt-8 pb-0">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12">

          {/* Service summary */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className="border border-line rounded-2xl p-4 md:p-5 flex items-center gap-4"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-brand-50 flex items-center justify-center overflow-hidden shrink-0">
                {imgSrc ? (
                  <img src={imgSrc} alt={service.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  createElement(getServiceIcon(service.name), { size: 28, className: "text-brand-400", strokeWidth: 1.5 })
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink-soft">{service.category.name}</p>
                <h2 className="font-bold text-ink text-base md:text-lg leading-snug truncate">{service.name}</h2>
                {subServiceName && (
                  <p className="text-brand-700 text-xs font-medium bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {subServiceName}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-sm">
                  <span className="font-semibold text-ink">₹{totalPrice}</span>
                  <span className="flex items-center gap-1 text-ink-soft text-xs">
                    <Clock size={12} />{service.duration_minutes} min
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="hidden lg:flex flex-col gap-2.5 border border-line rounded-2xl p-5">
              {[
                { icon: Sparkles, text: "Verified professional" },
                { icon: CheckCircle2, text: "Quality guaranteed" },
                { icon: Clock, text: "On-time arrival" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <Icon size={15} className="text-brand-600" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Date */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
              <h3 className="text-sm font-semibold text-ink mb-3">When should we come?</h3>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {days.map((d, i) => {
                  const disabled = i === 0 && !todayHasSlots;
                  const active = selectedDate === i;
                  return (
                    <button
                      key={i}
                      onClick={() => { if (!disabled) { setSelectedDate(i); setSelectedTime(""); } }}
                      disabled={disabled}
                      className={`flex flex-col items-center min-w-[64px] py-3 rounded-xl border transition-colors ${
                        disabled
                          ? "opacity-40 cursor-not-allowed border-line"
                          : active
                            ? "bg-brand-50 border-brand-600 text-brand-700"
                            : "bg-white border-line text-ink-soft hover:border-brand-300"
                      }`}
                    >
                      <span className={`text-[11px] font-medium ${active ? "text-brand-700" : "text-ink-soft"}`}>
                        {i === 0 ? "Today" : DAY_NAMES[d.getDay()]}
                      </span>
                      <span className={`text-lg font-bold mt-0.5 ${active ? "text-brand-700" : "text-ink"}`}>{d.getDate()}</span>
                      <span className="text-[10px] text-ink-soft mt-0.5">{MONTH_NAMES[d.getMonth()]}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Time */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
              <h3 className="text-sm font-semibold text-ink mb-3">Pick a time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {availableSlots.map((t) => {
                  const active = selectedTime === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-[10px] border text-xs md:text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-50 border-brand-600 text-brand-700"
                          : "bg-white border-line text-ink-soft hover:border-brand-300"
                      }`}
                    >
                      {formatSlot(t)}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Address */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink">Where?</h3>
                <button
                  type="button"
                  onClick={fetchAddress}
                  disabled={locLoading}
                  className="flex items-center gap-1.5 text-brand-600 text-xs font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {locLoading ? (
                    <span className="w-3 h-3 border border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                  ) : (
                    <LocateFixed size={13} />
                  )}
                  {locLoading ? "Locating..." : "Use my location"}
                </button>
              </div>
              <textarea
                placeholder="House no, street, area, landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3.5 text-sm text-ink border border-[#DBDBDB] focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(128,0,255,0.08)] outline-none transition-all min-h-[96px] resize-none placeholder:text-[#9A9AA0]"
              />
            </motion.div>

            {/* Notes */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
              <h3 className="text-sm font-semibold text-ink mb-3">
                Anything we should know? <span className="text-ink-soft font-normal">(optional)</span>
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Landmark, pets, parking instructions..."
                className="w-full bg-white rounded-xl px-4 py-3.5 text-sm text-ink border border-[#DBDBDB] focus:border-brand-600 focus:shadow-[0_0_0_3px_rgba(128,0,255,0.08)] outline-none transition-all min-h-[80px] resize-none placeholder:text-[#9A9AA0]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-0 inset-x-0 bg-white border-t border-line z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex flex-col shrink-0">
            <p className="text-xs text-ink-soft">Total</p>
            <span className="text-lg md:text-2xl font-bold text-ink leading-none">
              ₹{totalPrice}
            </span>
          </div>
          <button
            onClick={handleBook}
            disabled={loading}
            className="flex-1 md:flex-none md:min-w-[280px] bg-brand-600 hover:bg-brand-700 disabled:bg-[#EBEBEB] disabled:text-[#9A9AA0] text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.98] flex items-center justify-center gap-2 text-sm md:text-base"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Confirm booking <ChevronRight size={17} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
