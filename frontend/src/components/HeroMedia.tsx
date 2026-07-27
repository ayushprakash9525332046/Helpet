"use client";

import { useEffect, useRef, useState } from "react";

const IMG_SRC =
  "https://res.cloudinary.com/daeqn8kwz/image/upload/f_auto,q_auto,w_1600/v1785134696/Screenshot_2026-07-27_at_12.14.46_PM_hkzupp.png";
const VIDEO_SRC =
  "https://res.cloudinary.com/daeqn8kwz/video/upload/q_auto/v1785134629/istockphoto-1178823285-640_adpp_is_dyp5aj.mp4";

/**
 * Fills its (relative) parent with the hero image, then fades in the video
 * once fully buffered. If neither loads, the parent's own background shows.
 */
export default function HeroMedia({
  scrimClassName,
  imageScrimClassName,
}: {
  scrimClassName?: string;
  /** Extra overlay shown only while the still image is up front; fades out as the video takes over. */
  imageScrimClassName?: string;
}) {
  const [imgOk, setImgOk] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images can finish before React attaches onLoad — check directly.
  useEffect(() => {
    const img = imgRef.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (img?.complete && img.naturalWidth > 0) setImgOk(true);
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={IMG_SRC}
        alt=""
        aria-hidden="true"
        onLoad={() => setImgOk(true)}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${
          imgOk && !videoReady ? "opacity-100" : "opacity-0"
        }`}
      />
      {imgOk && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlayThrough={() => {
            if (!videoReady) {
              setVideoReady(true);
              videoRef.current?.play().catch(() => {});
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {scrimClassName && (imgOk || videoReady) && (
        <div className={`absolute inset-0 pointer-events-none ${scrimClassName}`} />
      )}
      {imageScrimClassName && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            imgOk && !videoReady ? "opacity-100" : "opacity-0"
          } ${imageScrimClassName}`}
        />
      )}
    </>
  );
}
