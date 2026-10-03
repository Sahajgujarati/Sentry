"use client";
import { StrategyData } from "@/types/analysis";

interface StrategyPanelProps {
  strategy: StrategyData;
}

export default function StrategyPanel({ strategy }: StrategyPanelProps) {
  return (
    <div className="terminal-panel-box">
      {/* Title Bar */}
      <div className="panel-title-bar">
        <span className="panel-title-text">SYNTHESIZED STRATEGY</span>
        <span className="tag-badge-amber">
          {strategy.urgency} PRIORITY
        </span>
      </div>

      {/* Recommended Strategy Badge */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "#fff" }}>
            {strategy.type.toUpperCase()}: HEDGE ENERGY EXPOSURE
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6 }}>
          {strategy.reason}
        </p>
      </div>

      {/* Action items */}
      <div style={{ marginBottom: 16 }}>
        <div className="matrix-cell-label" style={{ marginBottom: 8 }}>MANDATED TACTICAL ACTIONS</div>
        {strategy.actions.map((action, i) => (
          <div key={i} className="action-terminal-item">
            <span className="action-num-badge">0{i + 1}</span>
            <span>{action}</span>
          </div>
        ))}
      </div>

      {/* Evidence summary tags */}
      {strategy.evidence_summary && strategy.evidence_summary.length > 0 && (
        <div style={{ paddingTop: 10, borderTop: "1px solid var(--border-ultra)" }}>
          <div className="matrix-cell-label" style={{ marginBottom: 6 }}>SYNTHESIS VALIDATION</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {strategy.evidence_summary.map((ev, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-muted)",
                background: "#0a0c10",
                border: "1px solid var(--border-subtle)",
                padding: "3px 8px",
                borderRadius: 2,
              }}>
                ✓ {ev}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
