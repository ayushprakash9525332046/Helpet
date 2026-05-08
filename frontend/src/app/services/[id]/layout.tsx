import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.helpet.in/api/v1";

interface ServiceData {
  id: number;
  name: string;
  description?: string;
  price?: number;
  category?: { name: string };
}

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getService(id: string): Promise<ServiceData | null> {
  try {
    const res = await fetch(`${API_URL}/services/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const svc = await getService(id);

  const title = svc
    ? `${svc.name} in Dehradun — Book Online`
    : "Home Service in Dehradun — Book Online";
  const description = svc?.description
    ? `${svc.description} Book a verified professional in Dehradun on Helpet. Upfront pricing, same-day slots.`
    : `Book a verified ${svc?.name?.toLowerCase() ?? "home service"} professional in Dehradun. Upfront pricing, same-day slots, 100% satisfaction guarantee.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/services/${id}`,
    },
    openGraph: {
      title: `${title} | Helpet`,
      description,
      url: `${APP_URL}/services/${id}`,
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

export default async function ServiceDetailLayout({ params, children }: Props) {
  const { id } = await params;
  const svc = await getService(id);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${APP_URL}/categories`,
      },
      ...(svc?.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: svc.category.name,
            },
          ]
        : []),
      ...(svc
        ? [
            {
              "@type": "ListItem",
              position: svc.category ? 4 : 3,
              name: svc.name,
              item: `${APP_URL}/services/${id}`,
            },
          ]
        : []),
    ],
  };

  const serviceSchema = svc
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${svc.name} in Dehradun`,
        description: svc.description,
        provider: {
          "@type": "LocalBusiness",
          name: "Helpet",
          url: APP_URL,
          "@id": `${APP_URL}/#business`,
        },
        areaServed: {
          "@type": "City",
          name: "Dehradun",
        },
        ...(svc.price
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: svc.price,
                availability: "https://schema.org/InStock",
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {serviceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      )}
      {children}
    </>
  );
}
