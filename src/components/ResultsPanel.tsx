"use client";

import { useState } from "react";
import type { CVAnalysisResult } from "@/lib/matchingEngine";
import JDComparePanel from "@/components/JDComparePanel";
import { exportReportAsPDF } from "@/lib/reportExport";

interface Props {
  results: CVAnalysisResult;
  role: string;
  cvText: string;
  onReset: () => void;
}

type Tab = "overview" | "sections" | "projects" | "interview" | "jobs" | "compare";

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
        <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 18, fontWeight: 700, fill: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

function SectionTag({ present, label }: { present: boolean; label: string }) {
  return (
    <span className={`badge ${present ? "badge-green" : "badge-red"}`} style={{ fontSize: 11 }}>
      {present ? "✓" : "—"} {label}
    </span>
  );
}

const IMPORTANCE_COLOUR: Record<string, string> = {
  essential:            "var(--red)",
  "highly recommended": "var(--amber)",
  useful:               "var(--accent)",
};

export default function ResultsPanel({ results, role, cvText, onReset }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  const {
    scores, biasPii, contactIssues, matchedKeywords, missingKeywords,
    strengths, gaps, sectionAdvice, projectsAdvice, rewriteExample,
    interviewQuestions, interviewTips, jobBoards, atsTip, sections, roleFit, wordCount,
  } = results;

  const scoreColor = scores.overall >= 70 ? "var(--green)" : scores.overall >= 50 ? "var(--amber)" : "var(--red)";
  const missingContacts = contactIssues.filter(c => !c.present);

  const TABS: { id: Tab; label: string; alert?: boolean }[] = [
    { id: "overview",  label: "Overview" },
    { id: "sections",  label: "Section Advice" },
    { id: "projects",  label: "Projects" },
    { id: "interview", label: "Interview Prep" },
    { id: "jobs",      label: "Job Boards" },
    { id: "compare",   label: "JD Match" },
  ];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>Analysis complete</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Role: <strong>{role}</strong> &middot; {wordCount} words detected
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => exportReportAsPDF(results, role)}
            style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export PDF
          </button>
          <button className="btn btn-secondary" onClick={onReset} style={{ fontSize: 13 }}>Start over</button>
        </div>
      </div>

      {/* Score card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
                Overall score
              </div>
              <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-2px", color: scoreColor, lineHeight: 1 }}>
                {scores.overall}<span style={{ fontSize: 20, color: "var(--text-muted)", fontWeight: 400 }}>/100</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 10, maxWidth: 400, lineHeight: 1.6 }}>{roleFit}</p>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <ScoreRing score={scores.ats}       label="ATS match"       color="var(--accent)" />
              <ScoreRing score={scores.impact}    label="Impact language" color="#7c3aed" />
              <ScoreRing score={scores.structure} label="CV structure"    color="var(--green)" />
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
              Section detection
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <SectionTag present={sections.hasSummary}     label="Personal statement" />
              <SectionTag present={sections.hasExperience}  label="Work experience" />
              <SectionTag present={sections.hasEducation}   label="Education" />
              <SectionTag present={sections.hasSkills}      label="Skills" />
              <SectionTag present={sections.hasProjects}    label="Projects" />
              <SectionTag present={sections.hasAchievements}label="Achievements" />
              <SectionTag present={sections.hasHobbies}     label="Interests" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact completeness panel ── */}
      <div style={{ marginBottom: 16 }}>
        {/* Missing contacts — red alert */}
        {missingContacts.length > 0 && (
          <div style={{
            background: "var(--red-light)", border: "1px solid rgba(220,38,38,0.25)",
            borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 10,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Missing contact details — recruiters cannot reach you without these
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {missingContacts.map((c, i) => (
                <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                    {c.type} — not found
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.advice}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Present contacts — green confirmation */}
        {missingContacts.length === 0 && (
          <div style={{
            background: "var(--green-light)", border: "1px solid rgba(22,163,74,0.2)",
            borderRadius: "var(--radius-md)", padding: "10px 16px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}>
              Contact details confirmed — email, phone and LinkedIn are all present.
            </span>
          </div>
        )}

        {/* Partial: show which are present as reassurance */}
        {missingContacts.length > 0 && contactIssues.filter(c => c.present).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {contactIssues.filter(c => c.present).map((c, i) => (
              <span key={i} className="badge badge-green" style={{ fontSize: 12 }}>
                ✓ {c.type}: {c.value?.slice(0, 35)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Bias PII warning — only for genuinely biasing information ── */}
      {biasPii.length > 0 && (
        <div style={{
          background: "var(--amber-light)", border: "1px solid rgba(180,83,9,0.25)",
          borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Potentially biasing information detected — consider removing
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
            Under the Equality Act 2010, UK employers must not use the following information in shortlisting decisions.
            Sharing it on your CV exposes you to the risk of unconscious bias, whether or not the employer acts on it.
            Remove these items from your CV before submitting applications.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {biasPii.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: 13,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: 160 }}>
                  {p.type}
                </span>
                <span style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{p.value}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "var(--red)", background: "var(--red-light)", padding: "2px 7px", borderRadius: 4 }}>Remove</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: 0, marginBottom: 20, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", padding: "10px 16px",
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? "var(--accent)" : "var(--text-muted)",
            borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`,
            marginBottom: -1, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}>
            {t.label}
            {t.id === "compare" && (
              <span style={{ marginLeft: 5, fontSize: 9, background: "#7c3aed", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>New</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="grid-2">
            <div className="card">
              <div className="card-header" style={{ borderLeft: "3px solid var(--green)" }}>
                <span className="card-header-title" style={{ color: "var(--green)" }}>Strengths</span>
              </div>
              <div className="card-body">
                <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  {strengths.map((s, i) => <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s}</li>)}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-header" style={{ borderLeft: "3px solid var(--red)" }}>
                <span className="card-header-title" style={{ color: "var(--red)" }}>Areas to address</span>
              </div>
              <div className="card-body">
                <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  {gaps.map((g, i) => <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{g}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-header-title">ATS keyword analysis</span>
              <span className="badge badge-blue" style={{ marginLeft: "auto" }}>{matchedKeywords.length} matched</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>{atsTip}</p>
              {matchedKeywords.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Found in your CV</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {matchedKeywords.map(k => <span key={k} className="badge badge-green" style={{ fontSize: 12 }}>{k}</span>)}
                  </div>
                </div>
              )}
              {missingKeywords.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Missing — add these</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {missingKeywords.map(k => <span key={k} className="badge badge-red" style={{ fontSize: 12 }}>{k}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {rewriteExample && (
            <div className="card">
              <div className="card-header"><span className="card-header-title">Rewrite example — before and after</span></div>
              <div className="card-body">
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Before</div>
                  <div style={{ background: "var(--bg-secondary)", borderLeft: "3px solid var(--red)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
                    {rewriteExample.original}
                  </div>
                </div>
                <div style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 12 }}>↓</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>After</div>
                  <div style={{ background: "var(--green-light)", borderLeft: "3px solid var(--green)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
                    {rewriteExample.improved}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Reasonable adjustments and alternative application routes ── */}
          <div className="card" style={{ background: "var(--accent-light)", borderColor: "rgba(37,99,235,0.2)" }}>
            <div className="card-header" style={{ background: "transparent", borderBottom: "1px solid rgba(37,99,235,0.2)" }}>
              <span className="card-header-title" style={{ color: "var(--accent)" }}>Reasonable adjustments and alternative application routes</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Many UK employers — including the Civil Service, NHS, and most major graduate scheme operators — offer specific adjustments for applicants with disabilities, neurodivergent conditions (autism, ADHD, dyslexia, dyspraxia), or mental health conditions. These are legal obligations under the Equality Act 2010, not discretionary.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                If you have a condition that affects how you complete applications or perform in interviews, you are entitled to request adjustments. This may include: extended time for online tests, written questions in advance of interviews, or an alternative format interview.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Disclosing a condition is a personal decision. Most employers use a separate, confidential diversity monitoring form — this information is not seen by the hiring panel. The Disability Confident scheme (disabilityconfident.campaign.gov.uk) lists employers committed to inclusive hiring.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Useful resources: Disability Rights UK (disabilityrightsuk.org), ACAS guidance on reasonable adjustments, and your university&apos;s disability service — which can provide a formal needs assessment letter to send to employers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Section advice ── */}
      {tab === "sections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.entries(sectionAdvice).map(([sec, advice]) => (
            <div key={sec} className="card">
              <div className="card-header"><span className="card-header-title">{sec}</span></div>
              <div className="card-body">
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>{advice}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Projects ── */}
      {tab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Status banner */}
          <div style={{
            padding: "16px 20px",
            background: projectsAdvice.hasProjects ? "var(--green-light)" : "var(--amber-light)",
            border: `1px solid ${projectsAdvice.hasProjects ? "rgba(22,163,74,0.2)" : "rgba(180,83,9,0.25)"}`,
            borderRadius: "var(--radius-lg)",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: projectsAdvice.hasProjects ? "var(--green)" : "var(--amber)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {projectsAdvice.hasProjects
                  ? <polyline points="20 6 9 17 4 12"/>
                  : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: projectsAdvice.hasProjects ? "var(--green)" : "var(--amber)", marginBottom: 4 }}>
                {projectsAdvice.hasProjects ? "Projects section detected" : "No projects section found"}
                {" "}&middot;{" "}
                <span style={{ textTransform: "capitalize", color: IMPORTANCE_COLOUR[projectsAdvice.importance] }}>
                  {projectsAdvice.importance} for {role} roles
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {projectsAdvice.analysis}
              </p>
            </div>
          </div>

          {/* What to highlight */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                {projectsAdvice.hasProjects ? "What to highlight in each project entry" : "What to include when you add a projects section"}
              </span>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {projectsAdvice.whatToHighlight.map((item, i) => (
                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Example projects for this sector */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title">
                {projectsAdvice.hasProjects ? "Benchmark — strong projects for this sector" : "Suggested projects to build and add"}
              </span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {projectsAdvice.exampleProjects.map((ex, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "10px 14px",
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-light)",
                    padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{ex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formatting guidance */}
          <div className="card">
            <div className="card-header"><span className="card-header-title">How to format a project entry</span></div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Project title", "Give it a clear, descriptive name — not just 'University Project'. E.g. 'Student Finance Dashboard — React/Node.js'."],
                  ["Tech / tools / methods", "List exactly what you used. Recruiters and ATS systems scan for these terms."],
                  ["Your role and contribution", "If it was a team project, state your specific responsibilities. Avoid 'we built' — use 'I designed', 'I led', 'I implemented'."],
                  ["Outcome or evidence", "What did it achieve? Users, performance metrics, marks, deployment link, GitHub stars, client feedback. Link where possible."],
                  ["Duration", "Include rough dates or duration — shows you can see a project through."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Interview prep ── */}
      {tab === "interview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-header-title">Likely interview questions for this role</span></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {interviewQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-light)", padding: "2px 8px", borderRadius: 4, flexShrink: 0, marginTop: 2 }}>Q{i + 1}</span>
                  <span style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-header-title">Interview preparation tips</span></div>
            <div className="card-body">
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {interviewTips.map((t, i) => <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{t}</li>)}
              </ul>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-header-title">Structuring your answers — the STAR method</span></div>
            <div className="card-body">
              <div className="grid-2">
                {[
                  ["Situation", "Set the context. Where were you, what was the challenge?"],
                  ["Task", "What was your specific goal or responsibility?"],
                  ["Action", "What did you do? Use 'I', not 'we'. Be specific."],
                  ["Result", "What was the outcome? Quantify wherever possible."],
                ].map(([h, d]) => (
                  <div key={h} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>{h}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Job boards ── */}
      {tab === "jobs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-header-title">Recommended job boards for this role</span></div>
            <div className="card-body">
              <div className="grid-2">
                {jobBoards.map(b => (
                  <a key={b.name} href={b.url} target="_blank" rel="noreferrer"
                    style={{ display: "block", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px", textDecoration: "none", transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {b.name}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.description}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-header-title">Search strategy for <em>{role}</em></span></div>
            <div className="card-body">
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>
                Pair your target role with these modifiers when searching UK job boards:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {["graduate scheme","entry level","junior","trainee","associate","placement year","apprenticeship","early careers"].map(t => (
                  <span key={t} className="badge badge-blue" style={{ fontSize: 12 }}>{t}</span>
                ))}
              </div>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                <strong style={{ color: "var(--text)" }}>Timing matters significantly.</strong> Set up job alerts on LinkedIn and Indeed immediately.
                Applications submitted within the first 24 to 48 hours of a posting going live receive materially more callbacks.
                For graduate schemes, check application deadlines on Prospects and Target Jobs — many close three to six months before the start date.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── JD comparison ── */}
      {tab === "compare" && (
        <div>
          <div style={{ marginBottom: 20, padding: "16px 20px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.3px" }}>Word-for-word job description matching</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Paste the full text of a specific job posting. The tool extracts every meaningful term and phrase from the employer's own description and shows you exactly which appear in your CV and which do not — with no AI and no guessing.
            </p>
          </div>
          <JDComparePanel cvText={cvText} />
        </div>
      )}

      {/* ── Always-visible reference panels (below all tabs) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
        {/* Panel A — Application Timeline */}
        <div className="card">
          <div className="card-header"><span className="card-header-title">Key UK Graduate Application Deadlines</span></div>
          <div className="card-body">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>Sector</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>Typical window opens</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>Hard deadline note</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Law (Training Contract)", "September–November (2 yrs ahead)", "Many firms close Oct/Nov"],
                    ["Civil Service Fast Stream", "October–November", "Usually closes December"],
                    ["Investment Banking", "June–September (1 yr ahead)", "Some close August"],
                    ["Big Four Accountancy", "September–November", "Ongoing but early = better"],
                    ["NHS Graduate Scheme", "January–March", "Check specific trust"],
                    ["Engineering grad schemes", "October–February", "Rolling, apply early"],
                    ["Teaching (PGCE/SD)", "October–March", "Via DfE Teach service"],
                    ["Tech graduate schemes", "Year-round", "Many close March–April"],
                  ].map(([s, w, d]) => (
                    <tr key={s}>
                      <td style={{ padding: "10px 12px", color: "var(--text)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{s}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>{w}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginTop: 14, fontStyle: "italic" }}>
              Applications submitted in the first week of a window opening receive materially more callbacks. Set calendar reminders for September 1st (law, banking, civil service) and October 1st (engineering, accountancy).
            </p>
          </div>
        </div>

        {/* Panel B — LinkedIn Profile Checklist */}
        <div className="card">
          <div className="card-header"><span className="card-header-title">LinkedIn Profile — 8-Point Checklist for Graduate Applicants</span></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Professional headline", "Not 'Student at X University'. Write: '[Degree] graduate | Targeting [sector] roles | [1 key skill]'."],
              ["Profile photo", "Professional, plain background, face fills 60% of frame. Not a holiday or group photo."],
              ["About section", "3–5 sentences: who you are, what you studied, what you are looking for, one specific achievement or interest."],
              ["Featured section", "Pin your best project, GitHub, portfolio, or a published article. Recruiters check this first after your headline."],
              ["Experience entries", "Mirror your CV exactly. Inconsistencies between CV and LinkedIn are a red flag in background checks."],
              ["Skills section", "Add all sector-relevant skills. LinkedIn's algorithm surfaces your profile in recruiter searches based on skills listed."],
              ["Education", "Include university, degree title, grade (if 2:1 or above), and graduation year. Add relevant modules as description."],
              ["Connection strategy", "Connect with every professional you meet. 500+ connections significantly increases profile visibility. Send a personalised note with every request."],
            ].map(([title, desc], i) => (
              <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                  border: "1.5px solid var(--accent)", background: "var(--accent-light)",
                  color: "var(--accent)", fontSize: 11, fontWeight: 700, marginTop: 1,
                }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel C — Covering Letter Guidance */}
        <div className="card">
          <div className="card-header"><span className="card-header-title">When and How to Write a Covering Letter</span></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>When is a covering letter required?</div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Covering letters are required for most UK law firm applications, the majority of civil service application forms, many NHS and healthcare roles, and whenever a job posting explicitly requests one. They are optional but recommended for consulting and finance graduate schemes. They are rarely required for most tech roles. When in doubt, include one — omitting one when expected is fatal; including one when not expected is harmless.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>The four-paragraph structure</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Para 1 — The Hook", "Name the exact role and where you found it. State one specific thing about the organisation that attracted you (not generic praise — name a case, deal, project, or initiative)."],
                  ["Para 2 — Your Relevant Evidence", "Two to three sentences matching your strongest experience directly to the role's stated requirements. Use the same language as the job description."],
                  ["Para 3 — Why This Organisation", "What specifically about this employer, not the sector. Reference their values, a recent initiative, or something a current employee told you."],
                  ["Para 4 — The Close", "Confirm your availability, express enthusiasm without desperation, and state you look forward to discussing further."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              Keep the covering letter to one A4 page. Address it to a named individual wherever possible — call reception if needed. Never use &apos;To Whom It May Concern&apos;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
