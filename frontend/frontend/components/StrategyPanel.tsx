"use client";
import { StrategyData } from "@/types/analysis";

const STRATEGY_CONFIG = {
  HOLD: { color: "var(--accent-emerald)", icon: "⏸", label: "HOLD", description: "Maintain current positions" },
  HEDGE: { color: "var(--accent-amber)", icon: "🛡", label: "HEDGE", description: "Protect against downside risk" },
  REBALANCE: { color: "var(--accent-primary)", icon: "⚖", label: "REBALANCE", description: "Adjust sector allocations" },
  REDUCE: { color: "var(--accent-rose)", icon: "⬇", label: "REDUCE EXPOSURE", description: "Trim at-risk positions" },
  EXIT: { color: "var(--risk-critical)", icon: "🚪", label: "EXIT", description: "Exit positions immediately" },
};

interface StrategyPanelProps {
  strategy: StrategyData;
}

export default function StrategyPanel({ strategy }: StrategyPanelProps) {
  const cfg = STRATEGY_CONFIG[strategy.type];
  const urgencyColor = strategy.urgency === "HIGH" ? "var(--accent-rose)" : strategy.urgency === "MEDIUM" ? "var(--accent-amber)" : "var(--accent-emerald)";

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-card)",
      border: `1px solid ${cfg.color}30`,
      borderRadius: "var(--radius-xl)",
      padding: 28,
      boxShadow: `0 0 40px ${cfg.color}15`,
      animation: "fadeInUp 0.5s 0.5s ease both",
    }}>
      {/* Background gradient */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 100% 0%, ${cfg.color}10 0%, transparent 50%)`,
      }}/>

      <div style={{ position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>AI STRATEGY RECOMMENDATION</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{cfg.icon}</span>
              <div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: cfg.color,
                  fontFamily: "Outfit",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>{cfg.description}</div>
              </div>
            </div>
          </div>

          <div style={{
            padding: "8px 20px",
            background: `${urgencyColor}20`,
            border: `1px solid ${urgencyColor}40`,
            borderRadius: 100,
          }}>
            <div className="section-label" style={{ color: urgencyColor, marginBottom: 2 }}>URGENCY</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: urgencyColor, fontFamily: "Outfit" }}>
              {strategy.urgency}
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div style={{
          padding: 16,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          marginBottom: 20,
        }}>
          <div className="section-label" style={{ marginBottom: 8 }}>REASONING</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{strategy.reason}</p>
        </div>

        {/* Recommended actions */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>RECOMMENDED ACTIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strategy.actions.map((action, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 16px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderLeft: `3px solid ${cfg.color}`,
                borderRadius: `0 var(--radius-sm) var(--radius-sm) 0`,
                animation: `fadeInUp 0.3s ${i * 0.1}s ease both`,
              }}>
                <div style={{
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: `${cfg.color}20`,
                  border: `1px solid ${cfg.color}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: cfg.color,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>EVIDENCE SUPPORTING THIS RECOMMENDATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            {strategy.evidence_summary.map((evidence, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "10px 12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
              }}>
                <span style={{ color: "var(--accent-emerald)", flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{evidence}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: 20,
          padding: "10px 14px",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
            ⚠️ This strategy recommendation is generated by an AI system for informational purposes only and does not constitute financial advice. 
            All investment decisions should be made with the guidance of a qualified financial professional.
          </p>
        </div>
      </div>
    </div>
  );
}
