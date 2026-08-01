# Helpet — Frontend

Next.js 16 (App Router) storefront and admin panel. See the [root README](../README.md) for architecture, environment variables and the full setup guide.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

Requires `frontend/.env.local` with at least `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL`.

## Layout

| Path | Contents |
| ---- | -------- |
| `src/app/` | Routes — public pages, `admin/`, plus `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts` |
| `src/components/` | Shared UI |
| `src/lib/` | API client, OG image renderer, SEO data fetchers, Cloudinary URL resolver |
| `src/context/` | Auth provider |
