"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import AnalyserPanel from "@/components/AnalyserPanel";
import ResultsPanel from "@/components/ResultsPanel";
import HowItWorks from "@/components/HowItWorks";
import WhatYouGet from "@/components/WhatYouGet";
import Footer from "@/components/Footer";
import { analyseCV, type CVAnalysisResult } from "@/lib/matchingEngine";
import { extractTextFromFile } from "@/lib/pdfExtractor";

export default function Home() {
  const [cvText, setCvText]     = useState("");
  const [role, setRole]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [results, setResults]   = useState<CVAnalysisResult | null>(null);
  const [fileError, setFileError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setFileError("");
    setLoading(true);
    setLoadStep(0);
    try {
      const text = await extractTextFromFile(file);
      setCvText(text);
    } catch (err: any) {
      setFileError("Could not read this file. Please paste your CV text below.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalyse = useCallback(async () => {
    const text = cvText.trim();
    const roleVal = role.trim();
    if (!text || !roleVal) return;

    setLoading(true);
    setResults(null);

    // Animate loading steps
    const steps = [0, 1, 2, 3];
    for (const s of steps) {
      setLoadStep(s);
      await new Promise(r => setTimeout(r, 420));
    }

    // Local analysis — no API call
    const result = analyseCV(text, roleVal);
    setResults(result);
    setLoading(false);

    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [cvText, role]);

  const handleReset = useCallback(() => {
    setResults(null);
    setCvText("");
    setRole("");
    setLoadStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Nav />
      <main>
        {/* Hero + analyser tool */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container-narrow">
            <Hero />
            <AnalyserPanel
              cvText={cvText}
              role={role}
              loading={loading}
              loadStep={loadStep}
              fileError={fileError}
              onCvChange={setCvText}
              onRoleChange={setRole}
              onFile={handleFile}
              onAnalyse={handleAnalyse}
            />
          </div>
        </section>

        {/* Results */}
        {results && (
          <section id="results" className="section-sm">
            <div className="container-narrow">
              <ResultsPanel results={results} role={role} cvText={cvText} onReset={handleReset} />
            </div>
          </section>
        )}

        {/* How it works */}
        {!results && (
          <>
            <HowItWorks />
            <WhatYouGet />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
