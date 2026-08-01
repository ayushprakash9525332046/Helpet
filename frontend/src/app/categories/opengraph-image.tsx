import { OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE, renderBrandCard } from "@/lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Browse Home Services in Dehradun — Helpet";

export default function Image() {
  return renderBrandCard({
    eyebrow: "All Categories",
    title: "Browse 120+ Home Services in Dehradun",
    subtitle: "Cleaning, plumbing, AC repair, electrical, painting & more",
  });
}
