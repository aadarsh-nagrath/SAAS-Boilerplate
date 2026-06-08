import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = process.env.NEXT_PUBLIC_APP_NAME ?? "App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, color: "#f8fafc" }}>
          {appName}
        </div>
        <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 24 }}>
          {process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "The SaaS you need"}
        </div>
      </div>
    ),
    size
  );
}
