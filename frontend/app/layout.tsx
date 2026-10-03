import type { Metadata } from "next";
import AnimatedBackground from "@/components/AnimatedBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTRY AI — Financial Intelligence Terminal",
  description: "Multi-agent AI system for real-time financial event analysis, portfolio risk assessment, and intelligent strategy generation.",
  keywords: ["financial intelligence", "portfolio risk", "AI analysis", "hurricane impact"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
