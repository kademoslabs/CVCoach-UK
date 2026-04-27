"use client";

import { useState } from "react";
import { compareWithJobDescription, type JDComparisonResult } from "@/lib/matchingEngine";

interface Props {
  cvText: string;
}

function ImportancePill({ importance }: { importance: "critical" | "important" | "useful" }) {
  const styles = {
    critical:  { bg: "var(--red-light)",   color: "var(--red)",   label: "Essential" },
    important: { bg: "var(--amber-light)", color: "var(--amber)", label: "Important" },
    useful:    { bg: "var(--accent-light)", color: "var(--accent)", label: "Useful" },
  };
  const s = styles[importance];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 6px",
      borderRadius: 4, background: s.bg, color: s.color,
      textTransform: "uppercase", letterSpacing: "0.4px", flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function MatchScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "var(--green)" : score >= 45 ? "var(--amber)" : "var(--red)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Match score</span>
        <span style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.5px" }}>
          {score}%
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--bg-tertiary)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, borderRadius: 4,
          background: color, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

export default function JDComparePanel({ cvText }: Props) {
  const [jdText, setJdText]       = useState("");
  const [result, setResult]       = useState<JDComparisonResult | null>(null);
  const [running, setRunning]     = useState(false);
  const [view, setView]           = useState<"missing" | "matched" | "all">("missing");

  const canRun = cvText.trim().length > 50 && jdText.trim().length > 100;

  const handleRun = () => {
    if (!canRun) return;
    setRunning(true);
    // Small timeout so the UI updates before the synchronous computation
    setTimeout(() => {
      const r = compareWithJobDescription(cvText, jdText);
      setResult(r);
      setRunning(false);
    }, 80);
  };

  const displayTerms = result
    ? view === "missing"
      ? result.terms.filter(t => !t.inCV)
      : view === "matched"
      ? result.terms.filter(t => t.inCV)
      : result.terms
    : [];

  return (
    <div>
      {/* Instructions */}
      {!result && (
        <div style={{
          background: "var(--accent-light)",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--accent)" }}>How this works:</strong> Paste the full text
          of a job description below. The tool extracts every meaningful term and phrase from the
          posting, checks which appear in your CV, and shows you exactly what is missing — word for word.
          No AI. No guessing.
        </div>
      )}

      {/* JD input */}
      {!result && (
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block", fontSize: 13, fontWeight: 600,
            color: "var(--text-secondary)", textTransform: "uppercase",
            letterSpacing: "0.6px", marginBottom: 8,
          }}>
            Paste job description
          </label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste the full job description text here — responsibilities, requirements, person specification…"
            rows={10}
            style={{ fontFamily: "inherit", fontSize: 14, lineHeight: 1.7 }}
          />
          {jdText.length > 0 && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {jdText.split(/\s+/).filter(Boolean).length} words
              {jdText.length < 100 && (
                <span style={{ color: "var(--amber)", marginLeft: 8 }}>
                  — paste more of the job description for accurate results
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {!result && (
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={!canRun || running}
          style={{ width: "100%" }}
        >
          {running ? "Comparing…" : "Compare CV against this job description"}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="animate-fade-up">
          {/* Score header */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ padding: "20px 24px" }}>
              <MatchScoreBar score={result.matchScore} />
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12, marginTop: 16, paddingTop: 16,
                borderTop: "1px solid var(--border)",
              }}>
                {[
                  { label: "Terms in JD", value: result.totalJDTerms },
                  { label: "Found in your CV", value: result.matchedCount, color: "var(--green)" },
                  { label: "Missing from CV",  value: result.missingCount,  color: "var(--red)" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color || "var(--text)", letterSpacing: "-0.5px" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tailoring advice */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-header-title">Tailoring recommendations</span>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {result.tailoringAdvice.map((a, i) => (
                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Term-by-term breakdown */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-header-title">Term-by-term breakdown</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {(["missing", "matched", "all"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    background: view === v ? "var(--accent)" : "var(--bg-tertiary)",
                    color: view === v ? "#fff" : "var(--text-muted)",
                    border: "none", borderRadius: "var(--radius-sm)",
                    padding: "4px 10px", fontSize: 12, fontWeight: view === v ? 600 : 400,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}>
                    {v === "missing" ? `Missing (${result.missingCount})` :
                     v === "matched" ? `Found (${result.matchedCount})` : "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body" style={{ padding: "12px 16px" }}>
              {displayTerms.length === 0 ? (
                <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                  No terms to display for this filter.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {displayTerms.map((t, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 10px", borderRadius: "var(--radius-sm)",
                      background: t.inCV ? "var(--green-light)" : "var(--bg-secondary)",
                      border: `1px solid ${t.inCV ? "rgba(22,163,74,0.12)" : "var(--border)"}`,
                    }}>
                      {/* Present/absent indicator */}
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: t.inCV ? "var(--green)" : "var(--bg-tertiary)",
                        border: t.inCV ? "none" : "1px solid var(--border-strong)",
                      }}>
                        {t.inCV && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>

                      <span style={{
                        fontSize: 13, fontWeight: t.isPhrase ? 600 : 400,
                        color: t.inCV ? "var(--green)" : "var(--text)",
                        flex: 1, fontFamily: t.isPhrase ? "inherit" : "inherit",
                      }}>
                        {t.term}
                        {t.isPhrase && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 5, fontWeight: 400 }}>phrase</span>
                        )}
                      </span>

                      <ImportancePill importance={t.importance} />

                      <span style={{
                        fontSize: 11, color: "var(--text-muted)",
                        minWidth: 40, textAlign: "right",
                      }}>
                        ×{t.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reset */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setResult(null); setJdText(""); }}
              style={{ flex: 1, fontSize: 13 }}
            >
              Compare a different job description
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
