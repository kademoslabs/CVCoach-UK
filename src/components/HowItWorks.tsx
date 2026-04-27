const STEPS = [
  {
    number: "01",
    title: "Upload your CV",
    body: "Drop a PDF, DOCX or plain text file. Your CV is read entirely within your browser — nothing is sent to a server.",
  },
  {
    number: "02",
    title: "Enter your target role",
    body: "Tell us the specific role or graduate scheme you are applying for. The more specific you are, the more targeted the advice.",
  },
  {
    number: "03",
    title: "Receive instant analysis",
    body: "Get your ATS score, PII warnings, keyword gaps, section-by-section advice and interview preparation — in under five seconds.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 12 }}>
            How it works
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>
            Three steps. No account. No data stored. Designed specifically for UK students and graduates.
          </p>
        </div>

        <div className="grid-3">
          {STEPS.map(step => (
            <div key={step.number} style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "28px 24px",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: "var(--accent)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "1px",
                marginBottom: 14,
              }}>
                {step.number}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, letterSpacing: "-0.3px" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
