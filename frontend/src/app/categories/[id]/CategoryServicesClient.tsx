"use client";

import { Service } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import ServiceCard from "@/components/ServiceCard";
import { SearchX } from "lucide-react";

export default function CategoryServicesClient({
  services,
  categoryName,
}: {
  services: Service[];
  categoryName: string;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title={categoryName || "Services"} showSearch />
      <div className="container-fluid py-6 md:py-10">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <SearchX size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold">No services available</p>
            <p className="text-slate-400 text-sm mt-1">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
