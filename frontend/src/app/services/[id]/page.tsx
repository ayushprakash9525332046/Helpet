// ISR: revalidate every 5 minutes — service details change rarely
import { notFound } from "next/navigation";
import { serverGet } from "@/lib/server-api";
import { Service } from "@/lib/types";
import ServiceDetailClient from "./ServiceDetailClient";

export const revalidate = 300;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let service: Service;
  try {
    service = await serverGet<Service>(`/services/${id}`);
  } catch {
    notFound();
  }

  return <ServiceDetailClient service={service} />;
}
