"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Service } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { MapPin, Calendar, Clock, FileText, CheckCircle2, Sparkles, LocateFixed, ChevronRight } from "lucide-react";
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

const GRADIENTS = [
  "from-blue-500 to-indigo-600","from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600","from-orange-500 to-amber-600",
];

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
        amount: String(res.data.total_amount),
        date: date.toISOString(),
        platform_fee_pct: String(service!.platform_fee_percentage ?? 10),
      });
      router.push(`/payment/${res.data.id}?${params.toString()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title="Book Service" />
      <div className="px-5 pt-5 space-y-4">
        <div className="skeleton rounded-2xl h-24" />
        <div className="skeleton rounded-2xl h-32" />
        <div className="skeleton rounded-2xl h-28" />
      </div>
    </div>
  );

  const gradient = GRADIENTS[Math.abs((service.id.charCodeAt(0) - 48)) % GRADIENTS.length];
  const ServiceIconComponent = getServiceIcon(service.name);
  const imgSrc = resolveImage(service.image, 600);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 md:pb-24">
      <BackHeader title="Book Service" />

      <div className="container-fluid pt-6 md:pt-10 pb-0">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* Service summary - Left on Desktop */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
              className={`rounded-3xl p-6 md:p-10 flex flex-col md:flex-row lg:flex-col items-center md:items-start gap-6 md:gap-8 shadow-2xl relative overflow-hidden group ${!imgSrc ? `bg-linear-to-br ${gradient}` : ""}`}
            >
              {imgSrc && (
                <>
                  <img src={imgSrc} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm" />
                  <div className="absolute inset-0 bg-linear-to-br from-black/65 via-black/50 to-black/40" />
                </>
              )}
              {!imgSrc && <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-1000" />}
              <div className="w-20 h-20 md:w-28 md:h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-xl relative z-10 overflow-hidden shrink-0">
                {imgSrc ? (
                  <img src={imgSrc} alt={service.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <ServiceIconComponent size={40} className="text-white md:w-12 md:h-12" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex-1 relative z-10 text-center md:text-left">
                <h2 className="font-black text-white text-xl md:text-3xl lg:text-4xl leading-tight tracking-tight mb-2 md:mb-3">{service.name}</h2>
                {subServiceName && (
                  <p className="text-white/90 text-sm md:text-base font-bold mt-1 mb-1 bg-white/10 px-3 py-1 rounded-lg inline-block">{subServiceName}</p>
                )}
                <p className="text-white/80 text-[10px] md:text-lg font-bold uppercase tracking-widest">{service.category.name}</p>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-4 mt-6 md:mt-8">
                  <span className="bg-white/25 backdrop-blur-md text-white text-xs md:text-xl font-black px-4 py-1.5 md:px-8 md:py-3 rounded-xl shadow-lg border border-white/20">₹{subServicePrice ?? service.price}</span>
                  <span className="bg-white/25 backdrop-blur-md text-white text-xs md:text-xl font-black px-4 py-1.5 md:px-8 md:py-3 rounded-xl shadow-lg border border-white/20 flex items-center gap-2">
                    <Clock size={16} className="md:w-5 md:h-5" />{service.duration_minutes} min
                  </span>
                </div>
              </div>
              <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-green-400/90 backdrop-blur-md rounded-xl px-4 py-2 md:px-5 md:py-2.5 flex items-center gap-2 shadow-xl border border-white/30">
                <CheckCircle2 size={12} className="text-white md:w-4 md:h-4" />
                <span className="text-white text-[9px] md:text-base font-black uppercase tracking-widest">Available</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="hidden lg:flex flex-col gap-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
            >
              <h3 className="text-slate-800 font-black text-lg mb-1">Booking Benefits</h3>
              {[
                { icon: <Sparkles size={16} className="text-blue-600" />, text: "Professional & Verified Staff" },
                { icon: <CheckCircle2 size={16} className="text-green-600" />, text: "Quality Service Guaranteed" },
                { icon: <Clock size={16} className="text-amber-500" />, text: "On-time Arrival Commitment" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-50">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{b.icon}</div>
                  <span className="text-slate-700 font-bold text-sm">{b.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Form - Right on Desktop */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            {/* Address */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <label className="flex items-center gap-2 md:gap-3 text-sm md:text-lg font-black text-slate-800 tracking-tight">
                  <div className="w-7 h-7 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin size={14} className="text-blue-600 md:w-5 md:h-5" />
                  </div>
                  Service Address
                </label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchAddress}
                  disabled={locLoading}
                  className="flex items-center gap-1.5 text-blue-600 text-[9px] md:text-sm font-black bg-blue-50 hover:bg-blue-100 px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg transition-all"
                >
                  {locLoading ? <span className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /> : <LocateFixed size={12} className="md:w-4 md:h-4" />}
                  {locLoading ? "Locating..." : "Auto-detect"}
                </motion.button>
              </div>
              <textarea
                placeholder="Enter complete address where service is needed (house no, street, area, city)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white rounded-xl md:rounded-3xl px-5 py-4 md:px-7 md:py-6 text-sm md:text-lg font-bold text-slate-700 border-2 border-slate-50 focus:border-blue-100 focus:bg-blue-50/10 outline-none transition-all min-h-25 md:min-h-35 shadow-sm hover:shadow-md resize-none"
              />
            </motion.div>

            {/* Date Selection */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="flex items-center gap-2 md:gap-3 text-sm md:text-lg font-black text-slate-800 tracking-tight mb-4 md:mb-5">
                <div className="w-7 h-7 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={14} className="text-purple-600 md:w-5 md:h-5" />
                </div>
                Select Service Date
              </label>
              <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                {days.map((d, i) => {
                  const disabled = i === 0 && !todayHasSlots;
                  const active = selectedDate === i;
                  return (
                    <motion.button
                      key={i}
                      whileHover={disabled ? {} : { scale: 1.05 }}
                      whileTap={disabled ? {} : { scale: 0.95 }}
                      onClick={() => { if (!disabled) { setSelectedDate(i); setSelectedTime(""); } }}
                      disabled={disabled}
                      className={`flex flex-col items-center min-w-16 md:min-w-22.5 py-4 md:py-6 rounded-xl md:rounded-3xl border-2 transition-all duration-300 ${
                        disabled ? "opacity-40 grayscale cursor-not-allowed border-slate-50" :
                        active ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-slate-50 text-slate-500 hover:border-blue-100 hover:bg-blue-50/30"
                      }`}
                    >
                      <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2 ${active ? "text-blue-100" : "text-slate-400"}`}>{i === 0 ? "Today" : DAY_NAMES[d.getDay()]}</span>
                      <span className="text-base md:text-2xl font-black">{d.getDate()}</span>
                      <span className={`text-[8px] md:text-[10px] font-bold mt-1 md:mt-2 ${active ? "text-blue-200" : "text-slate-300"}`}>{MONTH_NAMES[d.getMonth()]}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Time Selection */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="flex items-center gap-2 md:gap-3 text-sm md:text-lg font-black text-slate-800 tracking-tight mb-4 md:mb-5">
                <div className="w-7 h-7 md:w-10 md:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock size={14} className="text-amber-600 md:w-5 md:h-5" />
                </div>
                Select Time Slot
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                {availableSlots.map((t) => {
                  const active = selectedTime === t;
                  return (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTime(t)}
                      className={`py-3 md:py-4 rounded-xl md:rounded-2xl border-2 text-[10px] md:text-base font-black transition-all duration-300 ${
                        active ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-slate-50 text-slate-500 hover:border-blue-100 hover:bg-blue-50/30"
                      }`}
                    >
                      {(() => { const [h, m] = t.split(":").map(Number); const ampm = h < 12 ? "AM" : "PM"; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2, "0")} ${ampm}`; })()}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="flex items-center gap-2 md:gap-3 text-sm md:text-lg font-black text-slate-800 tracking-tight mb-4 md:mb-5">
                <div className="w-7 h-7 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText size={14} className="text-green-600 md:w-5 md:h-5" />
                </div>
                Additional Instructions
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific instructions for the professional? (e.g. Landmark, pet info...)"
                className="w-full bg-white rounded-xl md:rounded-3xl px-5 py-4 md:px-7 md:py-6 text-sm md:text-lg font-bold text-slate-700 border-2 border-slate-50 focus:border-blue-100 focus:bg-blue-50/10 outline-none transition-all min-h-20 md:min-h-30 shadow-sm hover:shadow-md resize-none"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-5 py-4 md:px-8 md:py-6 flex items-center justify-between gap-4 md:gap-10">
          <div className="flex flex-col shrink-0">
            <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-[0.15em] mb-0.5 md:mb-1">Final Amount</p>
            <div className="flex items-baseline gap-2 md:gap-3">
              <span className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">₹{subServicePrice ?? service.price}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBook}
            disabled={loading}
            className="flex-1 md:flex-none md:min-w-75 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 md:py-5 rounded-2xl md:rounded-3xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 text-sm md:text-xl"
          >
            {loading ? (
              <span className="w-5 h-5 md:w-6 md:h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Confirm Booking <ChevronRight size={18} className="md:w-6 md:h-6" /></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
