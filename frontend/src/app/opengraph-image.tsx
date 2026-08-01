import { OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE, renderBrandCard } from "@/lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Helpet — Home Services in Dehradun";

export default function Image() {
  return renderBrandCard({
    eyebrow: "Home Services in Dehradun",
    title: "Cleaning, Plumbing, Electrical & 120+ Services",
    subtitle: "Verified professionals · Same-day booking · Transparent pricing",
  });
}
