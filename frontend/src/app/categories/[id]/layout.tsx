import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.helpet.in/api/v1";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getCategoryName(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/services/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const cats: Array<{ id: number; name: string }> = await res.json();
    return cats.find((c) => c.id === Number(id))?.name ?? null;
  } catch {
    return null;
  }
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
      images: [
        {
          url: "/assets/helpet-logo.png",
          width: 1200,
          height: 1200,
          alt: "Helpet — Home Services in Dehradun",
        },
      ],
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
