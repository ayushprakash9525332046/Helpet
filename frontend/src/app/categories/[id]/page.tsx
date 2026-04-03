"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Service } from "@/lib/types";
import BackHeader from "@/components/BackHeader";
import ServiceCard from "@/components/ServiceCard";

export default function CategoryServices() {
  const { id } = useParams<{ id: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/services/?category_id=${id}`).then((r) => {
      setServices(r.data);
      if (r.data.length > 0) setCategoryName(r.data[0].category.name);
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BackHeader title={categoryName || "Services"} showSearch />
      <div className="px-5 pt-5 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl mb-3">😕</span>
            <p className="text-slate-600 font-semibold">No services available</p>
            <p className="text-slate-400 text-sm mt-1">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
