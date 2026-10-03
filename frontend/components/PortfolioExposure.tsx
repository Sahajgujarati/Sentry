"use client";
import { RiskReport } from "@/types/analysis";

interface PortfolioExposureProps {
  risk: RiskReport;
}

export default function PortfolioExposure({ risk }: PortfolioExposureProps) {
  const sectorEntries = Object.entries(risk.sector_exposure || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="terminal-panel-box">
      <div className="panel-title-bar">
        <span className="panel-title-text">PORTFOLIO EXPOSURE BREAKDOWN</span>
        <span className="matrix-cell-val-mono">ENERGY WEIGHT: 49.0%</span>
      </div>

      {/* Sector List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {sectorEntries.map(([sector, weight]) => {
          const isEnergy = sector.toLowerCase().includes("energy");
          const pct = weight * 100;
          return (
            <div key={sector}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isEnergy ? "var(--term-teal)" : "var(--text-sub)", fontWeight: isEnergy ? 700 : 500 }}>
                  {sector.toUpperCase()} {isEnergy && " [TARGET ZONE]"}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: isEnergy ? "var(--term-teal)" : "#fff" }}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="term-pbar">
                <div
                  className="term-pbar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isEnergy ? "var(--term-teal)" : "#2d3748",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Assets */}
      {risk.asset_risk && risk.asset_risk.length > 0 && (
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
          <div className="matrix-cell-label" style={{ marginBottom: 8 }}>CRITICAL HOLDINGS AT RISK</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {risk.asset_risk.slice(0, 4).map((asset) => (
              <div key={asset.ticker} style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: "8px 10px", borderRadius: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--term-teal)" }}>
                    {asset.ticker}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--term-red)" }}>
                    {(asset.scenario_impact * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {asset.name} · {(asset.weight * 100).toFixed(0)}% weight
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
