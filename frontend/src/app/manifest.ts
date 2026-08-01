import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Helpet — Home Services in Dehradun",
    short_name: "Helpet",
    description:
      "Book verified professionals for cleaning, plumbing, AC repair & 120+ home services in Dehradun. Same-day booking, transparent pricing.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#8000FF",
    categories: ["utilities", "lifestyle", "shopping"],
    lang: "en-IN",
    dir: "ltr",
    icons: [
      {
        src: "/icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
