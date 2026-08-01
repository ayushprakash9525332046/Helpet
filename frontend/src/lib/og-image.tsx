import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

const BRAND_GRADIENT_FROM = "#8000FF";
const BRAND_GRADIENT_TO = "#3D007A";

interface BrandCardProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

function BrandCard({ title, subtitle, eyebrow }: BrandCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: `linear-gradient(135deg, ${BRAND_GRADIENT_FROM} 0%, ${BRAND_GRADIENT_TO} 100%)`,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(255,255,255,0.16)",
            color: "#fff",
            fontSize: 34,
            fontWeight: 700,
            marginRight: 20,
          }}
        >
          H
        </div>
        <div style={{ display: "flex", color: "#fff", fontSize: 30, fontWeight: 700 }}>
          Helpet
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
        {eyebrow && (
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.72)",
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 14,
              letterSpacing: 1,
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            display: "flex",
            color: "#fff",
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.85)",
              fontSize: 30,
              fontWeight: 500,
              marginTop: 20,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          color: "rgba(255,255,255,0.72)",
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        helpet.in · Dehradun, Uttarakhand
      </div>
    </div>
  );
}

interface PhotoCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
}

function PhotoCard({ imageUrl, title, subtitle }: PhotoCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        width={OG_IMAGE_SIZE.width}
        height={OG_IMAGE_SIZE.height}
        style={{ objectFit: "cover", position: "absolute", top: 0, left: 0 }}
        alt=""
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 56,
          display: "flex",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,0.22)",
            fontSize: 28,
            fontWeight: 700,
            marginRight: 14,
          }}
        >
          H
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>Helpet</div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 56,
          right: 56,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", color: "#fff", fontSize: 54, fontWeight: 800, lineHeight: 1.15 }}>
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.88)",
              fontSize: 28,
              fontWeight: 500,
              marginTop: 16,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function renderBrandCard(props: BrandCardProps) {
  return new ImageResponse(<BrandCard {...props} />, OG_IMAGE_SIZE);
}

export function renderPhotoCard(props: PhotoCardProps) {
  return new ImageResponse(<PhotoCard {...props} />, OG_IMAGE_SIZE);
}
