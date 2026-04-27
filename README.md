# CVCoach UK

Free CV analysis and 1-to-1 advisor for UK students and graduates.

## What it does

- ATS keyword scoring against a curated sector database (zero AI, runs in the browser)
- PII detection using UK-specific regex patterns (NI numbers, postcodes, phone numbers, DOB)
- Section-by-section CV advice
- Impact language analysis (action verbs, quantified achievements)
- Role-specific interview questions and preparation tips
- Job board signposting by sector
- Light / dark theme toggle
- PDF parsing via PDF.js (client-side only)

**Privacy by design:** all analysis runs in the user's browser. No CV text is transmitted or stored.

---

## Getting started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
npm start
```

---

## Deploy to Vercel (recommended — free tier)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel auto-detects Next.js — no configuration needed
4. Deploy

That's it. Zero environment variables required. Zero running costs on the free tier for typical student traffic.

---

## Project structure

```
src/
  app/
    layout.tsx        # Root layout, fonts, theme init
    globals.css       # Design tokens, light/dark theme variables
    page.tsx          # Main page orchestration
  components/
    Nav.tsx           # Sticky nav with theme toggle
    Hero.tsx          # Landing headline and subtitle
    AnalyserPanel.tsx # CV upload, role input, analyse button
    ResultsPanel.tsx  # Scores, tabs, advice display
    HowItWorks.tsx    # Three-step explainer section
    WhatYouGet.tsx    # Feature cards and privacy callout
    Footer.tsx        # Footer with resource links
  lib/
    matchingEngine.ts # Local TF-IDF ATS matching, PII detection, scoring
    pdfExtractor.ts   # Client-side PDF.js text extraction
```

---

## Extending the matching engine

The sector database lives in `src/lib/matchingEngine.ts` in the `SECTOR_DATABASE` object.

To add a new sector, add an entry following the existing pattern:

```typescript
"your-sector-key": {
  keywords: ["keyword1", "keyword2", ...],
  mustHave: ["critical keyword"],
  niceToHave: ["bonus keyword"],
  structureAdvice: "Advice string for this sector's CV structure.",
  interviewQuestions: ["Question 1?", "Question 2?", ...],
  interviewTips: ["Tip 1", "Tip 2", ...],
  jobBoards: [
    { name: "Board name", url: "https://...", description: "Brief description" }
  ],
}
```

Then add detection logic to the `normaliseSector` function.

---

## Roadmap

- [ ] Job description paste — compare CV against a specific posting word for word
- [ ] More sectors (Engineering, Education, Civil Service, Retail)
- [ ] Exportable PDF report
- [ ] mammoth.js integration for full DOCX fidelity
- [ ] University / careers service white-label option

---

## Security and privacy

- No API keys required
- No backend — purely static Next.js output
- CV text never leaves the browser
- PII patterns are UK-specific (NI number format, UK phone, UK postcode)
- GDPR compliant by architecture, not policy
