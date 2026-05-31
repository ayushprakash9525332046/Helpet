// Shared image URL resolver + Cloudinary optimizer.
//
// resolveImage() normalizes a stored image value (absolute URL, data URI, or a
// backend-relative path) into something the browser can load. When the source
// is a Cloudinary URL we inject `f_auto,q_auto` (modern format + auto quality)
// and an optional width cap so we ship far smaller bytes than the original.

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

/**
 * @param url   stored image value (may be undefined)
 * @param width optional max render width in px — Cloudinary downscales to it
 */
export function resolveImage(url?: string | null, width?: number): string | null {
  if (!url) return null;

  if (url.startsWith("http")) return optimizeCloudinary(url, width);
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null;
}

/** Insert `f_auto,q_auto[,w_<width>]` after `/upload/` for Cloudinary URLs. */
function optimizeCloudinary(url: string, width?: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url; // non-Cloudinary host — leave untouched
  }
  // Avoid double-transforming if a transform is already present.
  const [head, tail] = url.split("/upload/");
  if (/^(f_|q_|w_|c_|h_)/.test(tail)) return url;

  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  return `${head}/upload/${transforms.join(",")}/${tail}`;
}
