"use client";
import { useState } from "react";
import { RiskReport } from "@/types/analysis";

const RISK_CONFIG = {
  LOW: { color: "var(--risk-low)", bg: "var(--accent-emerald-glow)", border: "rgba(16, 185, 129, 0.3)", gradient: "var(--gradient-success)", label: "LOW RISK" },
  MEDIUM: { color: "var(--risk-medium)", bg: "var(--accent-amber-glow)", border: "rgba(245, 158, 11, 0.3)", gradient: "var(--gradient-amber)", label: "MEDIUM RISK" },
  HIGH: { color: "var(--risk-high)", bg: "var(--accent-rose-glow)", border: "rgba(244, 63, 94, 0.3)", gradient: "var(--gradient-danger)", label: "HIGH RISK" },
  CRITICAL: { color: "var(--risk-critical)", bg: "rgba(220, 38, 38, 0.15)", border: "rgba(220, 38, 38, 0.4)", gradient: "linear-gradient(135deg, #dc2626, #991b1b)", label: "CRITICAL RISK" },
};

interface RiskCardProps {
  risk: RiskReport;
}

export default function RiskCard({ risk }: RiskCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const cfg = RISK_CONFIG[risk.risk_level];
  const formattedImpact = (risk.portfolio_impact * 100).toFixed(2);
  const formattedLoss = Math.abs(risk.portfolio_impact * 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-card)",
      border: `1px solid ${cfg.border}`,
      borderRadius: "var(--radius-xl)",
      padding: 28,
      boxShadow: `0 0 30px ${cfg.bg}`,
      animation: "fadeInUp 0.5s 0.1s ease both",
    }}>
      {/* Radial background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at 80% 20%, ${cfg.bg} 0%, transparent 60%)`,
      }}/>

      <div style={{ position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>PORTFOLIO RISK</div>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: cfg.color,
              letterSpacing: "0.04em",
              fontFamily: "Outfit",
            }}>
              {cfg.label}
            </div>
          </div>

          <div style={{
            width: 72, height: 72,
            borderRadius: "50%",
            background: cfg.bg,
            border: `2px solid ${cfg.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Outfit", color: cfg.color, lineHeight: 1 }}>
              {risk.risk_score}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>/ 100</div>
          </div>
        </div>

        {/* Risk score bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Risk Score</span>
            <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{risk.risk_score}/100</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width: `${risk.risk_score}%`,
              background: cfg.gradient,
            }}/>
          </div>
        </div>

        {/* Divider */}
        <div className="divider"/>

        {/* Portfolio impact */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>ESTIMATED PORTFOLIO IMPACT</div>
          <div style={{
            fontSize: 48,
            fontWeight: 800,
            color: parseFloat(formattedImpact) < 0 ? "var(--accent-rose)" : "var(--accent-emerald)",
            fontFamily: "Outfit",
            letterSpacing: "-0.04em",
          }}>
            {parseFloat(formattedImpact) < 0 ? "" : "+"}{formattedImpact}%
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            ≈ ${formattedLoss} on $1M portfolio
          </div>
        </div>

        {/* Confidence */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Confidence</span>
            <span style={{ fontSize: 12, color: "var(--accent-cyan)", fontWeight: 600 }}>
              {(risk.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width: `${risk.confidence * 100}%`,
              background: "var(--accent-cyan)",
              opacity: 0.8,
            }}/>
          </div>
        </div>

        {/* Why button */}
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="btn btn-secondary"
          style={{ width: "100%", marginTop: 8 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
          </svg>
          {showWhy ? "HIDE REASONING" : "WHY HIGH RISK?"}
        </button>

        {/* Why panel */}
        {showWhy && (
          <div style={{
            marginTop: 16,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: 16,
            animation: "fadeInUp 0.3s ease",
          }}>
            <div className="section-label" style={{ marginBottom: 12 }}>KEY RISK DRIVERS</div>
            {risk.key_risk_drivers.map((driver, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8,
              }}>
                <span style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{driver}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
