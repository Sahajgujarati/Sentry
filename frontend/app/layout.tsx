import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTRY // Financial Intelligence Terminal",
  description:
    "Institutional financial intelligence and quantitative portfolio risk engine for global macroeconomic and environmental disruption shocks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-terminal-text min-h-screen selection:bg-terminal-accent/20 selection:text-terminal-accent font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
