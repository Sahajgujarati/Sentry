"use client";
import { useState } from "react";
import { ScenarioData, RiskReport } from "@/types/analysis";

interface ScenarioChartProps {
  scenarios: ScenarioData;
  risk: RiskReport;
}

const SCENARIOS = [
  { key: "mild" as const, label: "MILD", desc: "Minimal landfall impact on offshore platforms" },
  { key: "base" as const, label: "BASE", desc: "Moderate shut-in with 5-day disruption window" },
  { key: "severe" as const, label: "SEVERE", desc: "Direct platform damage & extended refinery outages" },
];

export default function ScenarioChart({ scenarios, risk }: ScenarioChartProps) {
  const [selected, setSelected] = useState<"mild" | "base" | "severe">("base");

  const values = {
    mild: scenarios.mild,
    base: scenarios.base,
    severe: scenarios.severe,
  };

  return (
    <div className="terminal-panel-box">
      <div className="panel-title-bar">
        <span className="panel-title-text">SCENARIO STRESS TESTING</span>
        <span className="matrix-cell-val-mono">MONTE CARLO (N=10,000)</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {SCENARIOS.map((sc) => (
          <button
            key={sc.key}
            onClick={() => setSelected(sc.key)}
            className="chip-terminal"
            style={{
              flex: 1,
              borderColor: selected === sc.key ? "var(--term-teal)" : "var(--border-subtle)",
              color: selected === sc.key ? "var(--term-teal)" : "var(--text-sub)",
              fontWeight: selected === sc.key ? 700 : 500,
              textAlign: "center",
            }}
          >
            {sc.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: 14, borderRadius: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span className="matrix-cell-label">{selected.toUpperCase()} SCENARIO IMPACT</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color: "var(--term-red)" }}>
            {(values[selected] * 100).toFixed(2)}%
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-sub)", marginBottom: 10 }}>
          {SCENARIOS.find((s) => s.key === selected)?.desc}
        </div>
        <div className="term-pbar">
          <div className="term-pbar-fill" style={{ width: `${Math.min(Math.abs(values[selected] * 1000), 100)}%`, background: "var(--term-red)" }} />
        </div>
      </div>
    </div>
  );
}
