"use client";
import { useState } from "react";
import { HistoricalData, HistoricalMatch } from "@/types/analysis";

interface HistoricalEventsProps {
  historical: HistoricalData;
}

export default function HistoricalEvents({ historical }: HistoricalEventsProps) {
  const [selected, setSelected] = useState<HistoricalMatch | null>(null);

  const sorted = [...historical.matches].sort((a, b) => b.similarity - a.similarity);

  const getSimilarityColor = (sim: number) =>
    sim >= 0.85 ? "var(--accent-emerald)" : sim >= 0.7 ? "var(--accent-amber)" : "var(--accent-rose)";

  return (
    <div className="card" style={{ animation: "fadeInUp 0.5s 0.3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>HISTORICAL INTELLIGENCE</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Vector DB Retrieval</div>
        </div>
        <span className="badge badge-blue">{historical.count} matches</span>
      </div>

      {/* Aggregate stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 20,
      }}>
        {[
          { label: "MEDIAN", value: `${(historical.aggregate_impact.median * 100).toFixed(1)}%`, color: "var(--accent-amber)" },
          { label: "MEAN", value: `${(historical.aggregate_impact.mean * 100).toFixed(1)}%`, color: "var(--accent-primary)" },
          { label: "WORST", value: `${(historical.aggregate_impact.worst * 100).toFixed(1)}%`, color: "var(--accent-rose)" },
          { label: "BEST", value: `${(historical.aggregate_impact.best * 100).toFixed(1)}%`, color: "var(--accent-emerald)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 10px",
            textAlign: "center",
          }}>
            <div className="section-label" style={{ marginBottom: 4, fontSize: 9 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "Outfit" }}>{value}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>energy sector</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="section-label" style={{ marginBottom: 12 }}>COMPARABLE EVENTS (BY SIMILARITY)</div>

      <div style={{ maxHeight: 360, overflowY: "auto" }} className="scrollable">
        {sorted.map((match, idx) => {
          const simColor = getSimilarityColor(match.similarity);
          const isSelected = selected?.event_id === match.event_id;

          return (
            <div
              key={match.event_id}
              onClick={() => setSelected(isSelected ? null : match)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px",
                borderRadius: "var(--radius-md)",
                marginBottom: 8,
                cursor: "pointer",
                background: isSelected ? "var(--bg-elevated)" : "var(--bg-surface)",
                border: `1px solid ${isSelected ? simColor + "30" : "var(--border-subtle)"}`,
                transition: "all 0.15s",
                animation: `fadeInUp 0.3s ${idx * 0.07}s ease both`,
              }}
            >
              {/* Rank */}
              <div style={{
                width: 28, height: 28,
                borderRadius: "50%",
                background: isSelected ? `${simColor}20` : "var(--bg-elevated)",
                border: `1px solid ${isSelected ? simColor : "var(--border-default)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: isSelected ? simColor : "var(--text-muted)",
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>

              {/* Main content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{match.event_name}</div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-rose)", fontFamily: "JetBrains Mono" }}>
                      {(match.sector_impact * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>energy impact</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {/* Similarity bar */}
                  <div style={{ flex: 1, height: 4, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${match.similarity * 100}%`,
                      height: "100%",
                      background: simColor,
                      borderRadius: 2,
                    }}/>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: simColor, width: 36, textAlign: "right", fontFamily: "JetBrains Mono", flexShrink: 0 }}>
                    {(match.similarity * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                    {new Date(match.date).getFullYear()}
                  </span>
                  {match.severity && (
                    <span className="badge badge-amber" style={{ fontSize: 10, padding: "2px 8px", flexShrink: 0 }}>
                      CAT {match.severity}
                    </span>
                  )}
                </div>

                {isSelected && match.description && (
                  <div style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    animation: "fadeIn 0.2s ease",
                  }}>
                    {match.description}
                    {match.location && (
                      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ color: "var(--text-muted)" }}>{match.location} · {new Date(match.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vector DB note */}
      <div style={{
        marginTop: 16,
        padding: "10px 14px",
        background: "var(--accent-primary-glow)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "var(--radius-sm)",
      }}>
        <div style={{ fontSize: 12, color: "var(--accent-primary)" }}>
          🔍 <strong>Semantic retrieval</strong> via vector similarity + metadata filtering (event_type=hurricane, sector=energy, region=Gulf)
        </div>
      </div>
    </div>
  );
}
