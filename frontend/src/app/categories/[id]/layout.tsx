import type { Metadata } from "next";
import { getCategoryName } from "@/lib/seo-data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const name = await getCategoryName(id);
  const title = name
    ? `${name} Services in Dehradun — Book Verified Professionals`
    : "Home Services in Dehradun";
  const description = name
    ? `Book verified ${name.toLowerCase()} professionals in Dehradun. Transparent pricing, same-day slots, 100% satisfaction guarantee. Helpet — Dehradun's trusted home services app.`
    : "Book verified home service professionals in Dehradun. Transparent pricing, same-day slots, 100% satisfaction guarantee.";

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/categories/${id}`,
    },
    openGraph: {
      title: `${title} | Helpet`,
      description,
      url: `${APP_URL}/categories/${id}`,
      type: "website",
      siteName: "Helpet",
    },
  };
}

export default async function CategoryDetailLayout({ params, children }: Props) {
  const { id } = await params;
  const name = await getCategoryName(id);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: APP_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${APP_URL}/categories`,
      },
      ...(name
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name,
              item: `${APP_URL}/categories/${id}`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
