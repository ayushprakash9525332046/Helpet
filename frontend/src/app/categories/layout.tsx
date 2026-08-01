import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";

export const metadata: Metadata = {
  title: "Browse Home Services in Dehradun — All Categories",
  description:
    "Explore 120+ home services in Dehradun. Cleaning, plumbing, AC repair, electrical, painting, pest control, carpentry & more. Book a verified professional today.",
  keywords: [
    "home services categories Dehradun",
    "cleaning services Dehradun",
    "plumber Dehradun",
    "electrician Dehradun",
    "AC service Dehradun",
    "pest control Dehradun",
    "painting services Dehradun",
    "carpenter Dehradun",
    "book home service Dehradun",
    "Helpet services",
  ],
  alternates: {
    canonical: `${APP_URL}/categories`,
  },
  openGraph: {
    title: "Browse Home Services in Dehradun | Helpet",
    description:
      "120+ services in Dehradun. Book verified pros for cleaning, plumbing, AC, electrical & more. Upfront pricing, same-day slots.",
    url: `${APP_URL}/categories`,
    type: "website",
    siteName: "Helpet",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
