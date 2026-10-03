"use client";
import { useState } from "react";
import { ScenarioData, RiskReport } from "@/types/analysis";

interface ScenarioChartProps {
  scenarios: ScenarioData;
  risk: RiskReport;
  portfolioValue?: number;
}

const SCENARIO_CONFIG = [
  { key: "mild" as const, label: "Mild", color: "var(--accent-emerald)", description: "Best-case trajectory; storm weakens or misses key infrastructure" },
  { key: "base" as const, label: "Base", color: "var(--accent-amber)", description: "Most probable outcome based on historical precedent and current data" },
  { key: "severe" as const, label: "Severe", color: "var(--accent-rose)", description: "Direct hit on major refinery corridor; extended production shutdown" },
  { key: "extreme" as const, label: "Extreme", color: "var(--risk-critical)", description: "Worst-case scenario comparable to Hurricane Katrina-level disruption" },
];

export default function ScenarioChart({ scenarios, risk, portfolioValue = 1_000_000 }: ScenarioChartProps) {
  const [selected, setSelected] = useState<"mild" | "base" | "severe" | "extreme">("base");

  const values: ScenarioData & { extreme: number } = {
    mild: scenarios.mild,
    base: scenarios.base,
    severe: scenarios.severe,
    extreme: scenarios.extreme ?? scenarios.severe * 1.75,
  };

  const maxAbs = Math.max(...Object.values(values).map((v) => Math.abs(v)));
  const selectedCfg = SCENARIO_CONFIG.find((s) => s.key === selected)!;
  const selectedValue = values[selected];
  const selectedDollar = Math.abs(selectedValue * portfolioValue).toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="card" style={{ animation: "fadeInUp 0.5s 0.2s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>SCENARIO ANALYSIS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Portfolio Impact Range</div>
        </div>
        <span className="badge badge-blue">Monte Carlo</span>
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 24 }}>
        {SCENARIO_CONFIG.map((cfg) => {
          const val = values[cfg.key];
          const pct = Math.abs(val) / maxAbs;
          const isSelected = selected === cfg.key;

          return (
            <div
              key={cfg.key}
              onClick={() => setSelected(cfg.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: isSelected ? "var(--bg-elevated)" : "transparent",
                border: isSelected ? `1px solid ${cfg.color}30` : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: isSelected ? cfg.color : "var(--text-muted)", flexShrink: 0 }}>
                {cfg.label.toUpperCase()}
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{
                  width: `${pct * 100}%`,
                  height: 28,
                  borderRadius: 4,
                  background: `${cfg.color}${isSelected ? "30" : "18"}`,
                  border: `1px solid ${cfg.color}${isSelected ? "60" : "30"}`,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                  transition: "all 0.3s",
                  minWidth: 60,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: "JetBrains Mono" }}>
                    {(val * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div style={{ width: 80, textAlign: "right", fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
                -${(Math.abs(val) * portfolioValue / 1000).toFixed(1)}K
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider"/>

      {/* Selected scenario details */}
      <div style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${selectedCfg.color}30`,
        borderRadius: "var(--radius-md)",
        padding: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: selectedCfg.color }}>
            {selectedCfg.label} Scenario Selected
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: selectedCfg.color, fontFamily: "Outfit" }}>
            {(selectedValue * 100).toFixed(2)}%
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{selectedCfg.description}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Estimated loss on $1M portfolio: <strong style={{ color: selectedCfg.color }}>${selectedDollar}</strong>
        </div>
      </div>

      {/* Interactive scenario tabs */}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {SCENARIO_CONFIG.map((cfg) => (
          <button
            key={cfg.key}
            onClick={() => setSelected(cfg.key)}
            className="btn"
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              background: selected === cfg.key ? `${cfg.color}20` : "var(--bg-elevated)",
              color: selected === cfg.key ? cfg.color : "var(--text-muted)",
              border: `1px solid ${selected === cfg.key ? cfg.color + "40" : "var(--border-subtle)"}`,
            }}
          >
            {cfg.label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
