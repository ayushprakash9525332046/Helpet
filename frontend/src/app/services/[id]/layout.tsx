import type { Metadata } from "next";
import { getService } from "@/lib/seo-data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
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
        ...(svc.image ? { image: svc.image } : {}),
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
