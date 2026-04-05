"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "@/lib/api";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { Lock, CreditCard, IndianRupee, Shield, CheckCircle2, Banknote } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1e293b",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#ef4444" },
  },
};

// ── Inner content (needs Stripe context) ────────────────────────
function PaymentForms({
  clientSecret,
  paymentIntentId,
  bookingId,
  serviceName,
  amount,
}: {
  clientSecret: string;
  paymentIntentId: string;
  bookingId: string;
  serviceName: string;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const total = Number(amount) + 29;

  const [cardLoading, setCardLoading] = useState(false);
  const [cardReady, setCardReady]     = useState(false);
  const [codLoading, setCodLoading]   = useState(false);

  const handleCardPay = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    setCardLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (error) { toast.error(error.message ?? "Payment failed"); return; }
      if (paymentIntent?.status === "succeeded") {
        await api.post("/payments/confirm", { payment_intent_id: paymentIntentId });
        router.replace(`/bookings/confirmed?service=${encodeURIComponent(serviceName)}&amount=${amount}&paid=true`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCardLoading(false);
    }
  };

  const handleCOD = async () => {
    setCodLoading(true);
    try {
      await api.post("/payments/offline", { booking_id: bookingId, method: "cod" });
      toast.success("Booking confirmed!");
      router.replace(`/bookings/confirmed?service=${encodeURIComponent(serviceName)}&amount=${amount}&paid=false`);
    } catch {
      toast.error("Could not confirm booking. Try again.");
    } finally {
      setCodLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-10">

      {/* ── Order summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
      >
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Order Summary</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600 font-medium">{serviceName}</span>
          <span className="font-bold text-slate-800">₹{amount}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-xs">
          <span>Platform fee</span><span>₹29</span>
        </div>
        <div className="border-t border-slate-100 pt-2.5 mt-2.5 flex justify-between items-center">
          <span className="font-bold text-slate-800 text-sm">Total</span>
          <div className="flex items-center gap-0.5 text-blue-600 font-extrabold text-xl">
            <IndianRupee size={15} />{total}
          </div>
        </div>
      </motion.div>

      {/* ── Card payment ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-blue-50/50">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <CreditCard size={15} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">Pay by Card</p>
            <p className="text-[10px] text-slate-400">Credit · Debit · Prepaid</p>
          </div>
          <div className="ml-auto flex gap-1.5">
            {["VISA", "MC", "RuPay"].map((n) => (
              <span key={n} className="text-[9px] font-black bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">{n}</span>
            ))}
          </div>
        </div>

        {/* body */}
        <div className="p-4 flex flex-col gap-3">
          <div className="border-2 border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition">
            <CardElement options={CARD_ELEMENT_OPTIONS} onChange={(e) => setCardReady(e.complete)} />
          </div>

          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Lock size={9} /> Secured by Stripe · card details never stored
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCardPay}
            disabled={cardLoading || !cardReady || !stripe}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-extrabold text-sm shadow-lg shadow-blue-200 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {cardLoading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
            ) : (
              <><Lock size={14} />Pay ₹{total} Securely</>
            )}
          </motion.button>

          <p className="text-center text-[10px] text-slate-400">
            Test card: <span className="font-mono font-semibold text-slate-500">4242 4242 4242 4242</span> · any future date · any CVC
          </p>
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        className="flex items-center gap-3"
      >
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">OR</span>
        <div className="flex-1 h-px bg-slate-200" />
      </motion.div>

      {/* ── Cash on Delivery ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-green-50/50">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <Banknote size={15} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">Cash on Delivery</p>
            <p className="text-[10px] text-slate-400">Pay after the service is done</p>
          </div>
        </div>

        {/* body */}
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <CheckCircle2 size={14} className="text-green-500" />, label: "No upfront payment" },
              { icon: <Shield size={14} className="text-blue-500" />,        label: "Pay after job done" },
              { icon: <Banknote size={14} className="text-amber-500" />,     label: "Cash accepted" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl py-3 px-2 border border-slate-100">
                {item.icon}
                <span className="text-[9px] font-semibold text-slate-500 text-center leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3 border border-green-100">
            <span className="text-sm text-green-700 font-semibold">Amount due on delivery</span>
            <span className="font-extrabold text-green-700 text-base">₹{total}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCOD}
            disabled={codLoading}
            className="w-full py-4 rounded-2xl bg-green-600 text-white font-extrabold text-sm shadow-lg shadow-green-200 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {codLoading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirming...</>
            ) : (
              <><Banknote size={15} />Confirm · Pay on Delivery</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Trust badges ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        {[
          { icon: <Shield size={13} className="text-green-600" />,       text: "SSL Encrypted" },
          { icon: <Lock size={13} className="text-blue-600" />,          text: "PCI Compliant" },
          { icon: <CheckCircle2 size={13} className="text-violet-600" />, text: "Secure Payment" },
        ].map((b) => (
          <div key={b.text} className="flex-1 flex flex-col items-center gap-1 bg-white rounded-xl py-2.5 border border-slate-100 shadow-sm">
            {b.icon}
            <span className="text-[10px] text-slate-500 font-semibold">{b.text}</span>
          </div>
        ))}
      </motion.div>

    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
function PaymentContent() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams  = useSearchParams();
  const serviceName   = searchParams.get("service") ?? "Home Service";
  const amount        = searchParams.get("amount")  ?? "0";

  const [clientSecret,    setClientSecret]    = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loadingIntent,   setLoadingIntent]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.post("/payments/create-intent", { booking_id: bookingId })
      .then((r) => {
        if (cancelled) return;
        setClientSecret(r.data.client_secret);
        setPaymentIntentId(r.data.payment_intent_id);
      })
      .catch(() => { if (!cancelled) toast.error("Could not initialise payment"); })
      .finally(() => { if (!cancelled) setLoadingIntent(false); });
    return () => { cancelled = true; };
  }, [bookingId]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title="Secure Payment" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-animated px-5 pt-10 pb-12 relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Lock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-blue-200 text-xs font-semibold">Final Step</p>
            <h1 className="text-white text-xl font-extrabold">Complete Payment</h1>
          </div>
        </div>
      </motion.div>

      {loadingIntent ? (
        <div className="px-5 pt-5 flex flex-col gap-4">
          <div className="skeleton rounded-2xl h-28" />
          <div className="skeleton rounded-2xl h-48" />
          <div className="skeleton rounded-2xl h-36" />
        </div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForms
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
            bookingId={bookingId}
            serviceName={serviceName}
            amount={amount}
          />
        </Elements>
      ) : (
        <div className="px-5 pt-10 text-center text-slate-500">
          <p className="font-semibold">Could not load payment. Please go back and try again.</p>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
