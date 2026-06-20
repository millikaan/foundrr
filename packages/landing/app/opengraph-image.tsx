import { ImageResponse } from "next/og";

// Next App-Router OG convention: this file becomes the site's og:image + twitter
// image at build time. A dark Aqua card — ◆ wordmark, the hero line, a muted
// subline — so shares render on-brand instead of a blank link preview.
export const alt = "Foundrr — supervise your AI coding agents from anywhere";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1014",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ width: "22px", height: "22px", background: "#f2a23c", transform: "rotate(45deg)" }} />
          <div style={{ fontSize: "34px", color: "#e6eaf0", letterSpacing: "-0.5px" }}>Foundrr</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "76px",
              color: "#e6eaf0",
              lineHeight: 1.05,
              fontWeight: 300,
              letterSpacing: "-2px",
              maxWidth: "920px",
            }}
          >
            You left the desk. Your agents kept working.
          </div>
          <div style={{ fontSize: "30px", color: "#8a95a3", maxWidth: "780px" }}>
            A local command center for your terminal agents — watch every session,
            and approve from anywhere.
          </div>
        </div>

        <div style={{ fontSize: "24px", color: "#5b6573" }}>foundrr.online</div>
      </div>
    ),
    { ...size },
  );
}
