export default function Hero() {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ marginBottom: 16 }}>
        <span className="badge badge-blue" style={{ fontSize: 12 }}>
          Free &middot; Private &middot; Built for UK Students
        </span>
      </div>
      <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.1 }}>
        CV Analysis &amp;{" "}
        <span className="display" style={{ fontSize: "1.05em" }}>
          1-to-1 Advisor
        </span>
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto 8px", fontWeight: 300, lineHeight: 1.6 }}>
        Upload your CV, enter the role you are targeting, and receive instant,
        detailed guidance — ATS scoring, PII warnings, section advice and
        interview preparation.
      </p>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 12 }}>
        Your CV is analysed entirely in your browser. Nothing is stored or transmitted.
      </p>
    </div>
  );
}
