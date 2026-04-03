"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "@/lib/api";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { Lock, CreditCard, IndianRupee, Shield, CheckCircle2 } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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

// ── Inner form (needs stripe context) ───────────────────────────
function CheckoutForm({
  clientSecret,
  paymentIntentId,
  serviceName,
  amount,
}: {
  clientSecret: string;
  paymentIntentId: string;
  serviceName: string;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card } }
      );

      if (error) {
        toast.error(error.message ?? "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Notify backend to mark booking as confirmed
        await api.post("/payments/confirm", {
          payment_intent_id: paymentIntentId,
        });
        const params = new URLSearchParams({
          service: serviceName,
          amount,
          paid: "true",
        });
        router.replace(`/bookings/confirmed?${params.toString()}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-5">
      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
      >
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Order Summary</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600 font-medium">{serviceName}</span>
          <span className="font-bold text-slate-800">₹{amount}</span>
        </div>
        <div className="flex justify-between items-center mb-2 text-slate-400 text-xs">
          <span>Platform fee</span>
          <span>₹29</span>
        </div>
        <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center">
          <span className="font-bold text-slate-800 text-sm">Total</span>
          <div className="flex items-center gap-1 text-blue-600 font-extrabold text-lg">
            <IndianRupee size={14} />
            {Number(amount) + 29}
          </div>
        </div>
      </motion.div>

      {/* Card input */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
      >
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard size={13} className="text-blue-600" />
          </div>
          Card Details
        </label>
        <div className="border-2 border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => setCardReady(e.complete)}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <Lock size={10} /> Secured by Stripe. We never store your card details.
        </p>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex gap-3"
      >
        {[
          { icon: <Shield size={13} className="text-green-600" />, text: "SSL Encrypted" },
          { icon: <Lock size={13} className="text-blue-600" />, text: "PCI Compliant" },
          { icon: <CheckCircle2 size={13} className="text-violet-600" />, text: "Secure Payment" },
        ].map((b) => (
          <div key={b.text} className="flex-1 flex flex-col items-center gap-1 bg-white rounded-xl py-2.5 border border-slate-100 shadow-sm">
            {b.icon}
            <span className="text-[10px] text-slate-500 font-semibold">{b.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Pay button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePay}
        disabled={loading || !cardReady || !stripe}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock size={15} />
            Pay ₹{Number(amount) + 29} Securely
          </span>
        )}
      </motion.button>

      <p className="text-center text-xs text-slate-400 -mt-2">
        Use test card <span className="font-mono font-semibold">4242 4242 4242 4242</span> · any future date · any CVC
      </p>
    </div>
  );
}

// ── Page that fetches the PaymentIntent ─────────────────────────
function PaymentContent() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("service") ?? "Home Service";
  const amount = searchParams.get("amount") ?? "0";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [loadingIntent, setLoadingIntent] = useState(true);

  useEffect(() => {
    api
      .post("/payments/create-intent", { booking_id: bookingId })
      .then((r) => {
        setClientSecret(r.data.client_secret);
        setPaymentIntentId(r.data.payment_intent_id);
      })
      .catch(() => toast.error("Could not initialise payment"))
      .finally(() => setLoadingIntent(false));
  }, [bookingId]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      <BackHeader title="Secure Payment" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-animated px-5 pt-10 pb-14 relative overflow-hidden"
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
          <div className="skeleton rounded-2xl h-36" />
          <div className="skeleton rounded-2xl h-16" />
        </div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
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
