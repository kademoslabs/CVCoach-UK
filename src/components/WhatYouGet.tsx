const FEATURES = [
  {
    title: "ATS Keyword Scoring",
    body: "Your CV is scored against a curated database of role-specific keywords used by applicant tracking systems across UK employers. See exactly what is missing.",
  },
  {
    title: "PII Detection",
    body: "We identify personal information that UK employers neither need nor should have — including National Insurance numbers, home addresses and dates of birth.",
  },
  {
    title: "Section-by-Section Advice",
    body: "Detailed, specific guidance on your personal statement, work experience, education and skills sections — not generic tips.",
  },
  {
    title: "Impact Language Analysis",
    body: "We identify weak, passive language and show you how to replace it with direct action verbs and quantified achievements that recruiters respond to.",
  },
  {
    title: "Interview Preparation",
    body: "Role-specific interview questions, sector tips and STAR method guidance — all generated without an AI model, from a curated question bank.",
  },
  {
    title: "Job Board Signposting",
    body: "Direct links to the most relevant UK job boards for your target sector, with search strategy advice for graduate and entry-level applications.",
  },
  {
    title: "Application Timeline Guidance",
    body: "Sector-specific UK graduate application deadlines — law, banking, civil service, NHS, engineering and more — so you apply in the right window, not after it closes.",
  },
  {
    title: "Covering Letter Framework",
    body: "Structured guidance on when a covering letter is required in UK graduate applications and a four-paragraph framework used by successful applicants across law, consulting, and the civil service.",
  },
];

export function WhatYouGet() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 12 }}>
            What you receive
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto", fontWeight: 300 }}>
            A complete picture of your CV — scored, analysed and annotated — with no account, no fee and no data leaving your device.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "var(--shadow-md)";
                el.style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "var(--shadow-sm)";
                el.style.borderColor = "var(--border)";
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--accent)", marginBottom: 14,
              }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.3px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy callout */}
        <div style={{
          marginTop: 40,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "28px 32px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 24,
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.3px" }}>
              Your CV stays on your device
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300, maxWidth: 600 }}>
              CVCoach UK performs all analysis locally in your browser using a rules-based matching engine.
              Your CV text is never transmitted to a server, never stored, and never shared.
              This is a deliberate design choice — not a future plan.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            {["No account required", "No data transmitted", "GDPR by design"].map(l => (
              <span key={l} className="badge badge-green" style={{ whiteSpace: "nowrap", justifyContent: "center" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatYouGet;
