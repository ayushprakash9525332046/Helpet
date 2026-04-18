import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helpet — Trusted Home Services at Your Doorstep",
  description:
    "Book trusted local professionals for cleaning, plumbing, electrical repairs, and more. Quality service guaranteed with Helpet India.",
  keywords: [
    "home services",
    "cleaning",
    "plumbing",
    "electrician",
    "helpet",
    "india",
    "service booking",
  ],
  authors: [{ name: "Helpet India" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet-frontend.vercel.app"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/assets/helpet-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet-frontend.vercel.app",
    title: "Helpet — Trusted Home Services at Your Doorstep",
    description:
      "Expert professionals for all your home needs. Safe, reliable, and affordable services in India.",
    siteName: "Helpet India",
    images: [
      {
        url: "/assets/helpet-logo.png",
        width: 1200,
        height: 1200,
        alt: "Helpet India Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helpet — Trusted Home Services",
    description: "Book trusted local professionals for all your home needs.",
    images: ["/assets/helpet-logo.png"],
    creator: "@helpetindia",
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
    <html lang="en" data-scroll-behavior="smooth">
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
