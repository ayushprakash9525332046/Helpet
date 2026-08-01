const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.helpet.in/api/v1";

export interface SeoCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface SeoService {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  category?: { name: string };
}

export async function getCategory(id: string): Promise<SeoCategory | null> {
  try {
    const res = await fetch(`${API_URL}/services/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const cats: SeoCategory[] = await res.json();
    return cats.find((c) => c.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function getCategoryName(id: string): Promise<string | null> {
  const cat = await getCategory(id);
  return cat?.name ?? null;
}

export async function getService(id: string): Promise<SeoService | null> {
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
