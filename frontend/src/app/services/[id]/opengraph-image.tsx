import { getService } from "@/lib/seo-data";
import { resolveImage } from "@/lib/image";
import { OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE, renderBrandCard, renderPhotoCard } from "@/lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Home Service in Dehradun — Helpet";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const svc = await getService(id);

  const title = svc ? `${svc.name} in Dehradun` : "Home Service in Dehradun";
  const subtitle = "Verified professional · Upfront pricing · Same-day slots";

  const imageUrl = resolveImage(svc?.image, 1200);
  if (imageUrl) {
    return renderPhotoCard({ imageUrl, title, subtitle });
  }

  return renderBrandCard({
    eyebrow: svc?.category?.name ?? "Home Service",
    title,
    subtitle,
  });
}
