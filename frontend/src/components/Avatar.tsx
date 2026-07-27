"use client";

import { useState } from "react";
import { resolveImage } from "@/lib/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: string;       // Tailwind size class e.g. "w-24 h-24"
  radius?: string;     // Tailwind radius class e.g. "rounded-2xl"
  textSize?: string;   // Tailwind text size e.g. "text-3xl"
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = "w-10 h-10",
  radius = "rounded-full",
  textSize = "text-base",
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  if (src && !imgError) {
    return (
      <img
        src={resolveImage(src, 256) ?? src}
        alt={name ?? "Profile"}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
        className={`${size} ${radius} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${size} ${radius} bg-brand-100 flex items-center justify-center text-brand-700 font-bold select-none ${textSize} ${className}`}
    >
      {initial}
    </div>
  );
}
