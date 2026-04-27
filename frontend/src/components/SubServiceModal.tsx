"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, IndianRupee } from "lucide-react";
import { Service, SubService } from "@/lib/types";

interface Props {
  service: Service;
  open: boolean;
  onClose: () => void;
}

export default function SubServiceModal({ service, open, onClose }: Props) {
  const router = useRouter();

  const handleSelect = (sub: SubService) => {
    onClose();
    const params = new URLSearchParams({
      sub_id: sub.id,
      sub_name: sub.name,
      sub_price: String(sub.price),
    });
    router.push(`/book/${service.id}?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-60 bg-white rounded-t-3xl shadow-2xl max-h-[82vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="font-black text-slate-800 text-lg leading-tight">{service.name}</h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Select an option to continue</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </button>
            </div>

            {/* Options list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {service.sub_services.map((sub, i) => (
                <motion.button
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelect(sub)}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl px-4 py-4 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{sub.name}</p>
                    {sub.description && (
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{sub.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center font-black text-blue-600 text-base">
                      <IndianRupee size={13} strokeWidth={3} />
                      {Number(sub.price).toLocaleString("en-IN")}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center transition-colors">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Space below last option — clears the mobile bottom nav (h-16 + mb-4 ≈ 80px) */}
            <div className="h-6 shrink-0" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
