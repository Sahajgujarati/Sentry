"use client";
import { useState, useEffect } from "react";

interface NavbarProps {
  mode: "live" | "demo";
  onModeChange: (mode: "live" | "demo") => void;
  isAnalyzing?: boolean;
}

export default function Navbar({ mode, onModeChange, isAnalyzing }: NavbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      borderBottom: "1px solid var(--border-subtle)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background: "rgba(5, 8, 16, 0.85)",
    }}>
      <div className="container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #00f5ff, #b026ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(0, 245, 255, 0.6)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1, background: "linear-gradient(135deg, #fff, #00f5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 10px rgba(0,245,255,0.4))" }}>
              SENTRY
            </div>
            <div style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: "0.1em", fontWeight: 700 }}>
              AI INTELLIGENCE TERMINAL
            </div>
          </div>
        </div>

        {/* Center: Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {isAnalyzing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-amber)" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--accent-amber)",
                animation: "pulse 1s infinite"
              }}/>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>ANALYZING</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-emerald)" }}>
              <div className="pulse-dot green" />
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>SYSTEM ONLINE</span>
            </div>
          )}

          <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }}/>

          {/* Clock */}
          <div className="mono" style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>

        {/* Right: Mode toggle + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mode toggle */}
          <div style={{
            display: "flex",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}>
            {(["demo", "live"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.15s",
                  background: mode === m
                    ? m === "live" ? "var(--accent-rose)" : "var(--gradient-primary)"
                    : "transparent",
                  color: mode === m ? "white" : "var(--text-muted)",
                }}
              >
                {m === "live" && <span style={{ marginRight: 4 }}>●</span>}
                {m}
              </button>
            ))}
          </div>

          <a href="/" style={{
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            transition: "color 0.15s",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
          }}>
            New Analysis
          </a>
        </div>
      </div>
    </nav>
  );
}
