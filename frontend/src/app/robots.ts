import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet-frontend.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/categories", "/register", "/login"],
        disallow: [
          "/admin/",
          "/profile",
          "/bookings",
          "/notifications",
          "/onboarding",
          "/review/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
