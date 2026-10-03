"use client";
import { useState } from "react";
import { RiskReport } from "@/types/analysis";

interface RiskCardProps {
  risk: RiskReport;
}

export default function RiskCard({ risk }: RiskCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const formattedImpact = (risk.portfolio_impact * 100).toFixed(2);
  const formattedLoss = Math.abs(risk.portfolio_impact * 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="terminal-panel-box">
      {/* Title Bar */}
      <div className="panel-title-bar">
        <span className="panel-title-text">PRIMARY RISK ASSESSMENT</span>
        <button onClick={() => setShowWhy(!showWhy)} className="btn-tag-cyan">
          [ {showWhy ? "COLLAPSE" : "WHY?"} ]
        </button>
      </div>

      {/* Main Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Risk Score */}
        <div style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: 14, borderRadius: 2 }}>
          <div className="matrix-cell-label">PORTFOLIO RISK SCORE</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "var(--term-red)", fontFamily: "var(--font-display)" }}>
              {risk.risk_score}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>/ 100 · {risk.risk_level}</span>
          </div>
          <div className="term-pbar" style={{ marginTop: 8 }}>
            <div className="term-pbar-fill" style={{ width: `${risk.risk_score}%`, background: "var(--term-red)" }} />
          </div>
        </div>

        {/* Portfolio Impact */}
        <div style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: 14, borderRadius: 2 }}>
          <div className="matrix-cell-label">ESTIMATED PORTFOLIO IMPACT</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "var(--term-red)", fontFamily: "var(--font-display)" }}>
              {parseFloat(formattedImpact) < 0 ? "" : "+"}{formattedImpact}%
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>(-${formattedLoss})</span>
          </div>
          <div className="term-pbar" style={{ marginTop: 8 }}>
            <div className="term-pbar-fill" style={{ width: `${Math.min(Math.abs(risk.portfolio_impact * 1000), 100)}%`, background: "var(--term-red)" }} />
          </div>
        </div>
      </div>

      {/* Tactical Rows */}
      <div style={{ marginBottom: 14 }}>
        <div className="tactical-row">
          <span className="tactical-row-label">MODEL CONFIDENCE</span>
          <span className="tactical-row-val" style={{ color: "var(--term-teal)" }}>
            {(risk.confidence * 100).toFixed(0)}% HIGH
          </span>
        </div>
        <div className="tactical-row">
          <span className="tactical-row-label">TOP AT-RISK EXPOSURE</span>
          <span className="tactical-row-val" style={{ color: "var(--term-amber)" }}>
            ENERGY SECTOR (49.0%)
          </span>
        </div>
        <div className="tactical-row">
          <span className="tactical-row-label">DOWNSIDE VAR (99% 1-DAY)</span>
          <span className="tactical-row-val" style={{ color: "var(--term-red)" }}>
            -${(Math.abs(risk.portfolio_impact * 1_000_000) * 1.35).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Collapsible reasoning / drivers */}
      {showWhy && (
        <div style={{ marginTop: 12, padding: 12, background: "#080a0e", border: "1px solid var(--border-mid)", borderRadius: 2 }}>
          <div className="matrix-cell-label" style={{ marginBottom: 8, color: "var(--term-teal)" }}>KEY RISK DRIVERS</div>
          {risk.key_risk_drivers.map((driver, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--text-main)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--term-red)" }}>&gt;</span>
              <span>{driver}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
