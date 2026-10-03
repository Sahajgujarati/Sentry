"use client";
import { useState } from "react";
import { HistoricalData, HistoricalMatch } from "@/types/analysis";

interface HistoricalEventsProps {
  historical: HistoricalData;
}

export default function HistoricalEvents({ historical }: HistoricalEventsProps) {
  const [selected, setSelected] = useState<HistoricalMatch | null>(null);
  const sorted = [...historical.matches].sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="terminal-panel-box">
      <div className="panel-title-bar">
        <span className="panel-title-text">HISTORICAL ANALOGS // VECTOR DB</span>
        <span className="matrix-cell-val-mono">{historical.count} CLUSTERS</span>
      </div>

      {/* Aggregate Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { label: "MEDIAN", val: `${(historical.aggregate_impact.median * 100).toFixed(1)}%`, col: "var(--term-red)" },
          { label: "MEAN", val: `${(historical.aggregate_impact.mean * 100).toFixed(1)}%`, col: "var(--term-red)" },
          { label: "WORST", val: `${(historical.aggregate_impact.worst * 100).toFixed(1)}%`, col: "var(--term-red)" },
          { label: "BEST", val: `${(historical.aggregate_impact.best * 100).toFixed(1)}%`, col: "var(--term-teal)" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: "8px 10px", borderRadius: 2 }}>
            <div className="matrix-cell-label" style={{ fontSize: 9, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: item.col }}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Historical List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 340, overflowY: "auto" }}>
        {sorted.map((match, idx) => {
          const isSel = selected?.event_id === match.event_id;
          return (
            <div
              key={match.event_id}
              onClick={() => setSelected(isSel ? null : match)}
              style={{
                padding: "10px 12px",
                background: isSel ? "#121722" : "#0c0f16",
                border: `1px solid ${isSel ? "var(--term-teal-border)" : "var(--border-subtle)"}`,
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--term-teal)", fontWeight: 700 }}>
                    0{idx + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                    {match.event_name}
                  </span>
                  {match.severity && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--term-amber)", background: "var(--term-amber-dim)", padding: "1px 5px", borderRadius: 2 }}>
                      CAT {match.severity}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--term-red)" }}>
                  {(match.sector_impact * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                <span>SIMILARITY: {(match.similarity * 100).toFixed(0)}%</span>
                <span>{new Date(match.date).getFullYear()}</span>
              </div>
              {isSel && match.description && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-sub)", lineHeight: 1.5 }}>
                  {match.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
