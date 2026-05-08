import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/categories",
          "/categories/",
          "/services/",
          "/register",
          "/login",
          "/privacy",
          "/terms",
          "/support",
        ],
        disallow: [
          "/admin/",
          "/profile",
          "/profile/",
          "/bookings",
          "/bookings/",
          "/notifications",
          "/onboarding",
          "/review/",
          "/payment/",
          "/home",
          "/api/",
        ],
      },
      // Allow AI crawlers full access to public content
      {
        userAgent: "GPTBot",
        allow: ["/", "/categories/", "/services/", "/register"],
        disallow: ["/admin/", "/profile/", "/bookings/", "/payment/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/categories/", "/services/", "/register"],
        disallow: ["/admin/", "/profile/", "/bookings/", "/payment/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/categories/", "/services/", "/register"],
        disallow: ["/admin/", "/profile/", "/bookings/", "/payment/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/categories/", "/services/", "/register"],
        disallow: ["/admin/", "/profile/", "/bookings/", "/payment/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
