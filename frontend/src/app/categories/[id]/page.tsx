// ISR: revalidate every 2 minutes — services within a category may change
import { notFound } from "next/navigation";
import { serverGet } from "@/lib/server-api";
import { Service } from "@/lib/types";
import CategoryServicesClient from "./CategoryServicesClient";

export const revalidate = 120;

export default async function CategoryServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let services: Service[] = [];
  try {
    services = await serverGet<Service[]>(`/services/?category_id=${id}`);
  } catch {
    notFound();
  }

  const categoryName = services[0]?.category.name ?? "Services";

  return <CategoryServicesClient services={services} categoryName={categoryName} />;
}
