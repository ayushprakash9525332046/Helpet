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
    <div className="flex flex-col min-h-screen bg-white">
      <BackHeader title={categoryName || "Services"} showSearch />
      <div className="container-fluid py-6 md:py-10">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-[#FAFAFA] border border-line rounded-2xl flex items-center justify-center mb-4">
              <SearchX size={26} className="text-ink-soft" />
            </div>
            <p className="text-ink font-semibold">No services yet</p>
            <p className="text-ink-soft text-sm mt-1">Check back soon — new services are added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
