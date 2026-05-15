import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";
const LOGO_URL = `${APP_URL}/assets/helpet-logo.png`;

// ── Structured Data ────────────────────────────────────────────────
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${APP_URL}/#business`,
  name: "Helpet India",
  alternateName: "Helpet Home Services Dehradun",
  description:
    "Helpet is Dehradun's trusted home services platform. Book verified professionals for cleaning, plumbing, electrical work, AC repair, painting, and 120+ services. Same-day booking, transparent pricing, 100% satisfaction guaranteed.",
  url: APP_URL,
  logo: LOGO_URL,
  image: LOGO_URL,
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dehradun",
    addressLocality: "Dehradun",
    addressRegion: "Uttarakhand",
    postalCode: "248001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 30.3165,
    longitude: 78.0322,
  },
  areaServed: [
    {
      "@type": "City",
      name: "Dehradun",
      sameAs: "https://www.wikidata.org/wiki/Q200019",
    },
    { "@type": "AdministrativeArea", name: "Uttarakhand" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "07:00",
      closes: "21:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Home Services in Dehradun",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home Cleaning Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plumbing Services Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Electrical Repair Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AC Service & Repair Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Painting Services Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pest Control Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Carpentry Services Dehradun", areaServed: "Dehradun" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sofa & Carpet Cleaning Dehradun", areaServed: "Dehradun" } },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "380",
  },
  foundingDate: "2024",
  foundingLocation: { "@type": "Place", name: "Dehradun, Uttarakhand, India" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${APP_URL}/#organization`,
  name: "Helpet India",
  url: APP_URL,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  description: "India's growing home services platform, starting from Dehradun, Uttarakhand.",
  foundingDate: "2024",
  foundingLocation: { "@type": "Place", name: "Dehradun, Uttarakhand, India" },
  areaServed: { "@type": "City", name: "Dehradun" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "Hindi"],
    areaServed: "IN",
  },
  sameAs: [
    "https://www.instagram.com/helpetindia",
    "https://www.facebook.com/helpetindia",
    "https://twitter.com/helpetindia",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${APP_URL}/#website`,
  name: "Helpet — Home Services in Dehradun",
  url: APP_URL,
  inLanguage: "en-IN",
  publisher: { "@id": `${APP_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/categories?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Helpet — Home Services in Dehradun | Cleaning, Plumbing & More",
    template: "%s | Helpet Dehradun",
  },
  description:
    "Book verified professionals for home cleaning, plumbing, AC repair, electrical work & 120+ services in Dehradun. Same-day booking, transparent prices, 100% satisfaction guaranteed.",
  keywords: [
    "home services Dehradun",
    "home cleaning Dehradun",
    "plumber in Dehradun",
    "electrician Dehradun",
    "AC repair Dehradun",
    "pest control Dehradun",
    "painting services Dehradun",
    "sofa cleaning Dehradun",
    "carpenter Dehradun",
    "home services near me Dehradun",
    "Helpet",
    "Helpet Dehradun",
    "home services Uttarakhand",
    "book home service online",
  ],
  authors: [{ name: "Helpet India" }],
  creator: "Helpet India",
  publisher: "Helpet India",
  category: "Home Services",
  applicationName: "Helpet",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    title: "Helpet — Home Services in Dehradun | Cleaning, Plumbing & More",
    description:
      "Dehradun's trusted home services app. Book verified professionals for 120+ services. Same-day booking, no hidden charges.",
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
  twitter: {
    card: "summary_large_image",
    title: "Helpet — Home Services in Dehradun",
    description: "Book verified professionals for 120+ home services in Dehradun. Same-day slots available.",
    images: ["/assets/helpet-logo.png"],
    creator: "@helpetindia",
    site: "@helpetindia",
  },
  alternates: {
    canonical: APP_URL,
  },
  // Geo meta tags for local SEO
  other: {
    "geo.region": "IN-UK",
    "geo.placename": "Dehradun, Uttarakhand",
    "geo.position": "30.3165;78.0322",
    "ICBM": "30.3165, 78.0322",
    "og:locale:alternate": "hi_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: "12px", fontSize: "14px" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
