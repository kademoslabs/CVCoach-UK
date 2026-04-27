import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CVCoach UK — Instant, Private CV Advisor for UK Students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1220 0%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#22d3ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#0b1220",
            }}
          >
            CV
          </div>
          <div style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            CVCoach UK
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "1000px",
            }}
          >
            Instant, Private CV Advisor for UK Students
          </div>
          <div
            style={{
              fontSize: "30px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "950px",
            }}
          >
            ATS scoring, PII detection, interview prep — runs in your browser. No AI. No account. No data stored.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "22px",
            color: "#cbd5e1",
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(34, 211, 238, 0.12)",
              border: "1px solid rgba(34, 211, 238, 0.4)",
            }}
          >
            Free
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(34, 211, 238, 0.12)",
              border: "1px solid rgba(34, 211, 238, 0.4)",
            }}
          >
            Private
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(34, 211, 238, 0.12)",
              border: "1px solid rgba(34, 211, 238, 0.4)",
            }}
          >
            Zero AI
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
