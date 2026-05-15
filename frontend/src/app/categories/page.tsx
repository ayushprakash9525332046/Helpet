// ISR: revalidate every 5 minutes — categories change rarely
import { serverGet } from "@/lib/server-api";
import { ServiceCategory } from "@/lib/types";
import CategoriesClient from "./CategoriesClient";

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await serverGet<ServiceCategory[]>("/services/categories");
  return <CategoriesClient categories={categories} />;
}
