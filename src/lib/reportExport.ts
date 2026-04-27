// ─────────────────────────────────────────────────────────────────────────────
// CVCoach UK — PDF Report Export
// Generates a print-ready HTML document and opens the browser print dialog.
// Uses the browser's native print-to-PDF — no server, no third-party library.
// ─────────────────────────────────────────────────────────────────────────────

import type { CVAnalysisResult } from "./matchingEngine";

function scoreColour(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 50) return "#b45309";
  return "#dc2626";
}

function ring(score: number, label: string, color: string): string {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="6"/>
        <circle cx="38" cy="38" r="${r}" fill="none" stroke="${color}" stroke-width="6"
          stroke-dasharray="${dash} ${circ}" stroke-linecap="round" transform="rotate(-90 38 38)"/>
        <text x="38" y="38" text-anchor="middle" dominant-baseline="central"
          style="font-size:15px;font-weight:700;fill:#111827;font-family:Arial,sans-serif">${score}</text>
      </svg>
      <span style="font-size:11px;color:#6b7280;text-align:center;max-width:72px;line-height:1.3">${label}</span>
    </div>`;
}

function section(title: string, content: string, accentColor = "#2563eb"): string {
  return `
    <div style="margin-bottom:20px;break-inside:avoid">
      <div style="font-size:11px;font-weight:700;color:${accentColor};text-transform:uppercase;
        letter-spacing:1px;padding:10px 16px;background:#f9fafb;border:1px solid #e5e7eb;
        border-bottom:none;border-radius:8px 8px 0 0">
        ${title}
      </div>
      <div style="border:1px solid #e5e7eb;border-radius:0 0 8px 8px;padding:14px 16px;font-size:13px;
        color:#374151;line-height:1.7;background:#fff">
        ${content}
      </div>
    </div>`;
}

function pill(text: string, color: string, bg: string): string {
  return `<span style="display:inline-block;font-size:11px;font-weight:600;color:${color};
    background:${bg};border-radius:12px;padding:2px 9px;margin:2px 3px 2px 0">${text}</span>`;
}

export function exportReportAsPDF(results: CVAnalysisResult, role: string): void {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const overallColor = scoreColour(results.scores.overall);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>CVCoach UK — CV Analysis Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #111827;
      background: #fff;
      padding: 40px 48px;
      max-width: 820px;
      margin: 0 auto;
    }
    h2 { font-size: 15px; font-weight: 700; margin-bottom: 4px; color: #111827; }
    ul { padding-left: 18px; }
    li { margin-bottom: 6px; line-height: 1.6; }
    @media print {
      body { padding: 20px 24px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

<!-- Header -->
<div style="border-bottom:2px solid #111827;padding-bottom:20px;margin-bottom:28px;
  display:flex;justify-content:space-between;align-items:flex-end">
  <div>
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px">CVCoach UK</div>
    <div style="font-size:13px;color:#6b7280;margin-top:3px">CV Analysis Report</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:12px;color:#6b7280">${date}</div>
    <div style="font-size:12px;color:#6b7280;margin-top:2px">cvcoach.uk</div>
  </div>
</div>

<!-- Role + overall score -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;
  margin-bottom:28px;padding:20px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px">
  <div>
    <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;
      letter-spacing:1px;margin-bottom:6px">Target role</div>
    <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:10px">${role}</div>
    <div style="font-size:13px;color:#4b5563;line-height:1.6;max-width:420px">${results.roleFit}</div>
  </div>
  <div style="text-align:center;flex-shrink:0">
    <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;
      letter-spacing:1px;margin-bottom:6px">Overall score</div>
    <div style="font-size:48px;font-weight:700;color:${overallColor};letter-spacing:-2px;line-height:1">
      ${results.scores.overall}
      <span style="font-size:18px;color:#9ca3af;font-weight:400">/100</span>
    </div>
  </div>
</div>

<!-- Score rings -->
<div style="display:flex;justify-content:space-around;margin-bottom:28px;
  padding:20px;border:1px solid #e5e7eb;border-radius:10px">
  ${ring(results.scores.ats,       "ATS match",       "#2563eb")}
  ${ring(results.scores.impact,    "Impact language", "#7c3aed")}
  ${ring(results.scores.structure, "CV structure",    "#16a34a")}
</div>

<!-- Section detection -->
<div style="margin-bottom:28px">
  <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;
    letter-spacing:1px;margin-bottom:10px">Section detection</div>
  <div>
    ${Object.entries({
      "Personal statement": results.sections.hasSummary,
      "Work experience":    results.sections.hasExperience,
      "Education":          results.sections.hasEducation,
      "Skills":             results.sections.hasSkills,
      "Achievements":       results.sections.hasAchievements,
      "Interests":          results.sections.hasHobbies,
    }).map(([label, present]) =>
      pill(
        (present ? "✓ " : "— ") + label,
        present ? "#16a34a" : "#dc2626",
        present ? "#f0fdf4" : "#fef2f2"
      )
    ).join("")}
  </div>
</div>

<!-- PII -->
${results.biasPii.length > 0 ? section(
  "Potentially biasing information — remove before applying",
  `<p style="margin-bottom:10px;color:#b45309">Under the Equality Act 2010, remove these items to protect against unconscious bias in shortlisting.</p>` +
  results.biasPii.map(p => `
    <div style="display:flex;gap:12px;padding:5px 0;border-bottom:1px solid #fef3c7">
      <span style="font-weight:700;color:#b45309;min-width:160px;font-size:11px;
        text-transform:uppercase;letter-spacing:0.5px">${p.type}</span>
      <span style="font-family:monospace;color:#6b7280">${p.value}</span>
    </div>`).join(""),
  "#b45309"
) : ""}

<!-- Strengths and gaps -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
  ${section("Strengths", "<ul>" + results.strengths.map(s => `<li>${s}</li>`).join("") + "</ul>", "#16a34a")}
  ${section("Areas to address", "<ul>" + results.gaps.map(g => `<li>${g}</li>`).join("") + "</ul>", "#dc2626")}
</div>

<!-- ATS keywords -->
${section(
  "ATS keyword analysis",
  `<p style="margin-bottom:10px">${results.atsTip}</p>
   <p style="margin-bottom:6px;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px">Found in CV</p>
   <div style="margin-bottom:12px">${results.matchedKeywords.map(k => pill(k, "#16a34a", "#f0fdf4")).join("")}</div>
   <p style="margin-bottom:6px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px">Missing — add these</p>
   <div>${results.missingKeywords.map(k => pill(k, "#dc2626", "#fef2f2")).join("")}</div>`,
  "#2563eb"
)}

<!-- Rewrite example -->
${results.rewriteExample ? section(
  "Rewrite example",
  `<div style="margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Before</div>
    <div style="background:#fef2f2;border-left:3px solid #dc2626;padding:8px 12px;border-radius:0 4px 4px 0;color:#6b7280">${results.rewriteExample.original}</div>
  </div>
  <div style="text-align:center;color:#9ca3af;margin-bottom:10px">↓</div>
  <div>
    <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">After</div>
    <div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:8px 12px;border-radius:0 4px 4px 0">${results.rewriteExample.improved}</div>
  </div>`,
  "#7c3aed"
) : ""}

<!-- Section advice -->
${section(
  "Section-by-section advice",
  Object.entries(results.sectionAdvice).map(([title, advice]) => `
    <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f3f4f6">
      <div style="font-weight:700;font-size:13px;margin-bottom:5px">${title}</div>
      <div style="color:#4b5563;line-height:1.7">${advice}</div>
    </div>`).join(""),
  "#2563eb"
)}

<!-- Interview questions -->
${section(
  "Interview questions for this role",
  results.interviewQuestions.map((q, i) => `
    <div style="display:flex;gap:10px;margin-bottom:8px;padding:8px 10px;
      background:#f9fafb;border-radius:6px;align-items:flex-start">
      <span style="font-size:10px;font-weight:700;color:#2563eb;background:#eff6ff;
        padding:2px 7px;border-radius:4px;flex-shrink:0;margin-top:1px">Q${i + 1}</span>
      <span style="line-height:1.6">${q}</span>
    </div>`).join("") +
  `<div style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:12px">
    <div style="font-weight:700;margin-bottom:8px">Interview tips for this sector</div>
    <ul>${results.interviewTips.map(t => `<li style="margin-bottom:6px;color:#4b5563">${t}</li>`).join("")}</ul>
  </div>`,
  "#7c3aed"
)}

<!-- Job boards -->
${section(
  "Recommended job boards",
  results.jobBoards.map(b => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6">
      <div>
        <span style="font-weight:600">${b.name}</span>
        <span style="color:#6b7280;margin-left:10px;font-size:12px">${b.description}</span>
      </div>
      <span style="font-size:12px;color:#2563eb">${b.url.replace("https://","")}</span>
    </div>`).join(""),
  "#16a34a"
)}

<!-- Footer -->
<div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;
  display:flex;justify-content:space-between;font-size:11px;color:#9ca3af">
  <span>CVCoach UK — cvcoach.uk</span>
  <span>This report was generated locally. Your CV was never transmitted or stored.</span>
  <span>${date}</span>
</div>

</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups for this site to export your report.");
    return;
  }
  win.document.write(html);
  win.document.close();
  // Give fonts and layout time to settle before printing
  setTimeout(() => {
    win.focus();
    win.print();
  }, 400);
}
