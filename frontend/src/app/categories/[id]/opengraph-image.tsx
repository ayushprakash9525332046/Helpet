import { getCategory } from "@/lib/seo-data";
import { resolveImage } from "@/lib/image";
import { OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE, renderBrandCard, renderPhotoCard } from "@/lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Home Services in Dehradun — Helpet";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const cat = await getCategory(id);

  const title = cat ? `${cat.name} Services in Dehradun` : "Home Services in Dehradun";
  const subtitle = "Book verified professionals · Same-day slots · Upfront pricing";

  const imageUrl = resolveImage(cat?.icon, 1200);
  if (imageUrl) {
    return renderPhotoCard({ imageUrl, title, subtitle });
  }

  return renderBrandCard({
    eyebrow: "Service Category",
    title,
    subtitle,
  });
}
