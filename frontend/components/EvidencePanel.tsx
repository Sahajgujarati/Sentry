"use client";
import { MarketData, MacroData } from "@/types/analysis";

interface EvidencePanelProps {
  market: MarketData;
  macro?: MacroData;
}

export default function EvidencePanel({ market, macro }: EvidencePanelProps) {
  return (
    <div className="terminal-panel-box">
      <div className="panel-title-bar">
        <span className="panel-title-text">MARKET TICK &amp; MACRO TELEMETRY</span>
        <span className="matrix-cell-val-mono">INTRADAY FEEDS</span>
      </div>

      {/* Asset Table */}
      <div style={{ marginBottom: 16 }}>
        <div className="matrix-cell-label" style={{ marginBottom: 6 }}>MONITORED ASSETS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {market.assets.map((asset) => {
            const isDown = asset.change_1d < 0;
            return (
              <div
                key={asset.ticker}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  background: "#0c0f16",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 2,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, color: "var(--term-teal)", width: 44 }}>
                    {asset.ticker}
                  </span>
                  <span style={{ color: "var(--text-sub)", fontSize: 11 }}>
                    {asset.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    ${asset.price.toFixed(2)}
                  </span>
                  <span style={{ color: isDown ? "var(--term-red)" : "var(--term-teal)", fontWeight: 700, width: 56, textAlign: "right" }}>
                    {isDown ? "" : "+"}{(asset.change_1d * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Indicators */}
      {macro && macro.indicators && (
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
          <div className="matrix-cell-label" style={{ marginBottom: 6 }}>MACRO VARIABLES</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {macro.indicators.slice(0, 4).map((ind) => (
              <div key={ind.indicator} style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: "6px 8px", borderRadius: 2 }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{ind.indicator}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  {ind.value}{ind.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
