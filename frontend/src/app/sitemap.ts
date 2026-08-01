import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://helpet.in";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.helpet.in/api/v1";

interface Category {
  id: string;
  name: string;
  updated_at?: string;
}

interface Service {
  id: string;
  name: string;
  image?: string;
  updated_at?: string;
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/services/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/services/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, services] = await Promise.all([
    fetchCategories(),
    fetchServices(),
  ]);

  const now = new Date();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/categories`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${APP_URL}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamic category pages — e.g. /categories/3 (Cleaning)
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${APP_URL}/categories/${cat.id}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Dynamic service pages — e.g. /services/12 (AC Service)
  const servicePages: MetadataRoute.Sitemap = services.map((svc) => ({
    url: `${APP_URL}/services/${svc.id}`,
    lastModified: svc.updated_at ? new Date(svc.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
    ...(svc.image && /^https?:\/\//.test(svc.image) ? { images: [svc.image] } : {}),
  }));

  return [...staticPages, ...categoryPages, ...servicePages];
}
