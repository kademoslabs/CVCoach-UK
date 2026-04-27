"use client";

import { useRef, useState } from "react";

interface Props {
  cvText: string;
  role: string;
  loading: boolean;
  loadStep: number;
  fileError: string;
  onCvChange: (t: string) => void;
  onRoleChange: (r: string) => void;
  onFile: (f: File) => void;
  onAnalyse: () => void;
}

const LOAD_STEPS = [
  "Extracting text and detecting layout…",
  "Scanning for personal information…",
  "Matching against sector keyword database…",
  "Scoring structure and impact language…",
];

const ROLE_EXAMPLES = [
  "Software Engineer",
  "NHS Graduate Scheme",
  "Investment Banking Analyst",
  "Marketing Executive",
  "Solicitor Training Contract",
  "Management Consultant",
];

export default function AnalyserPanel({
  cvText, role, loading, loadStep, fileError,
  onCvChange, onRoleChange, onFile, onAnalyse,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showIndustry, setShowIndustry] = useState(false);

  const canAnalyse = cvText.trim().length > 50 && role.trim().length > 2 && !loading;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="card" style={{ boxShadow: "var(--shadow-lg)" }}>
      {/* Role input — primary, at the top */}
      <div style={{
        padding: "28px 28px 0",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 24,
      }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          What role are you targeting?
        </label>
        <input
          type="text"
          value={role}
          onChange={e => onRoleChange(e.target.value)}
          placeholder="Enter a job title, role or graduate scheme…"
          style={{ fontSize: 16, fontWeight: 500 }}
          autoFocus
        />
        {/* Example chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center", marginRight: 2 }}>e.g.</span>
          {ROLE_EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => onRoleChange(ex)}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 12,
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.borderColor = "var(--accent)";
                (e.target as HTMLElement).style.color = "var(--accent)";
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.borderColor = "var(--border)";
                (e.target as HTMLElement).style.color = "var(--text-secondary)";
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* CV upload */}
      <div style={{ padding: "24px 28px" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Upload or paste your CV
        </label>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "var(--accent-light)" : "var(--bg-secondary)",
            transition: "all 0.2s",
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>
            Drop your CV file here, or click to browse
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            PDF, DOCX or TXT accepted
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: "none" }}
            onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </div>

        {fileError && (
          <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{fileError}</p>
        )}

        {/* Paste area */}
        <div style={{ position: "relative" }}>
          <textarea
            value={cvText}
            onChange={e => onCvChange(e.target.value)}
            placeholder="Or paste your CV text directly here…"
            rows={cvText.length > 200 ? 6 : 4}
            style={{ fontFamily: "inherit", fontSize: 14, lineHeight: 1.7 }}
          />
          {cvText.length > 50 && (
            <span style={{
              position: "absolute", bottom: 10, right: 12,
              fontSize: 11, color: "var(--text-muted)",
            }}>
              {cvText.split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          padding: "0 28px 20px",
          borderTop: "1px solid var(--border)",
          paddingTop: 20,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LOAD_STEPS.map((step, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                opacity: i <= loadStep ? 1 : 0.3,
                transition: "opacity 0.3s",
              }}>
                {i < loadStep ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : i === loadStep ? (
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid var(--border)",
                    borderTopColor: "var(--accent)",
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }} />
                ) : (
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--border)", flexShrink: 0 }} />
                )}
                <span style={{ color: i <= loadStep ? "var(--text)" : "var(--text-muted)" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{
        padding: "20px 28px 28px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={onAnalyse}
          disabled={!canAnalyse}
          style={{ width: "100%", fontSize: 15 }}
        >
          {loading ? "Analysing…" : "Analyse my CV"}
          {!loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          )}
        </button>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          fontSize: 12,
          color: "var(--text-muted)",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Analysed locally in your browser
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 12 8 10 12 16 16 10 19 12 21 6"/>
            </svg>
            No data stored or transmitted
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            GDPR compliant
          </span>
        </div>
      </div>
    </div>
  );
}
