export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg-secondary)",
      padding: "40px 0 32px",
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 40,
          marginBottom: 40,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 10 }}>
              CVCoach{" "}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--text-secondary)" }}>UK</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 320, fontWeight: 300 }}>
              Free CV analysis and career advice for UK students and graduates.
              No account. No AI model. No data stored.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
              Tool
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["ATS Scoring", "PII Detection", "Interview Prep", "Job Boards"].map(l => (
                <a key={l} href="/#" style={{ fontSize: 14, color: "var(--text-secondary)", textDecoration: "none" }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text)"}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-secondary)"}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
              Resources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Prospects", href: "https://prospects.ac.uk" },
                { label: "Target Jobs", href: "https://targetjobs.co.uk" },
                { label: "Dorkmyjob", href: "https://dorkmyjob.com" },
                { label: "UCAS", href: "https://ucas.com" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                  style={{ fontSize: 14, color: "var(--text-secondary)", textDecoration: "none" }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text)"}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-secondary)"}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 13,
          color: "var(--text-muted)",
        }}>
          <span>CVCoach UK &copy; {new Date().getFullYear()} &middot; Free for all UK students</span>
          <span>Analysis runs locally &middot; No data transmitted &middot; GDPR compliant by design</span>
        </div>
      </div>
    </footer>
  );
}
