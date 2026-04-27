import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cwgstaging.xyz";
const title = "CVCoach UK — Instant, Private CV Advisor for UK Students";
const description = "Upload your CV and get instant, expert advice tailored to UK graduate roles. ATS scoring, PII detection, interview prep and job board links — free, private, and built for UK students.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: "CV advice UK, graduate CV, ATS score, UK student jobs, CV analyser",
  applicationName: "CVCoach UK",
  authors: [{ name: "CVCoach UK" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "CVCoach UK",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', t);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
