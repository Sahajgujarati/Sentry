"use client";
import { useState } from "react";
import { RiskReport, AssetRisk } from "@/types/analysis";

interface PortfolioExposureProps {
  risk: RiskReport;
}

export default function PortfolioExposure({ risk }: PortfolioExposureProps) {
  const [selectedAsset, setSelectedAsset] = useState<AssetRisk | null>(null);

  const sectorEntries = Object.entries(risk.sector_exposure).sort((a, b) => b[1] - a[1]);
  const maxSector = Math.max(...sectorEntries.map(([, v]) => v));

  const SECTOR_COLORS = [
    "var(--accent-rose)",
    "var(--accent-primary)",
    "var(--accent-cyan)",
    "var(--accent-violet)",
    "var(--accent-emerald)",
    "var(--accent-amber)",
  ];

  return (
    <div className="card" style={{ animation: "fadeInUp 0.5s 0.3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>PORTFOLIO EXPOSURE</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Sector Breakdown</div>
        </div>
        <span className="badge badge-cyan">Real-time</span>
      </div>

      {/* Sector bars */}
      <div style={{ marginBottom: 24 }}>
        {sectorEntries.map(([sector, weight], i) => {
          const color = SECTOR_COLORS[i % SECTOR_COLORS.length];
          const pct = (weight / maxSector) * 100;
          const isAffected = sector === "Energy";

          return (
            <div key={sector} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }}/>
                  <span style={{ fontSize: 13, fontWeight: 500, color: isAffected ? "var(--accent-rose)" : "var(--text-primary)" }}>
                    {sector}
                    {isAffected && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 700,
                        color: "var(--accent-rose)", letterSpacing: "0.06em"
                      }}>
                        ⚠ AT RISK
                      </span>
                    )}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "JetBrains Mono" }}>
                  {(weight * 100).toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${pct}%`,
                  background: color,
                  opacity: isAffected ? 1 : 0.6,
                }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Donut representation */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 24,
        padding: "12px",
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}>
        {sectorEntries.map(([sector, weight], i) => (
          <div
            key={sector}
            style={{
              height: 6,
              borderRadius: 3,
              background: SECTOR_COLORS[i % SECTOR_COLORS.length],
              flex: weight,
            }}
            title={`${sector}: ${(weight * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Top Risk Contributors */}
      {risk.asset_risk.length > 0 && (
        <>
          <div className="divider"/>
          <div style={{ marginTop: 16 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TOP RISK CONTRIBUTORS</div>
            {risk.asset_risk.map((asset) => (
              <div
                key={asset.ticker}
                onClick={() => setSelectedAsset(selectedAsset?.ticker === asset.ticker ? null : asset)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  background: selectedAsset?.ticker === asset.ticker ? "var(--bg-elevated)" : "transparent",
                  border: `1px solid ${selectedAsset?.ticker === asset.ticker ? "var(--border-default)" : "transparent"}`,
                  transition: "all 0.15s",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono",
                    color: "var(--accent-primary)",
                  }}>
                    {asset.ticker}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{asset.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{(asset.weight * 100).toFixed(1)}% weight</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-rose)", fontFamily: "JetBrains Mono" }}>
                    {(asset.portfolio_contribution * 100).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>contribution</div>
                </div>
              </div>
            ))}
          </div>

          {/* Asset detail popup */}
          {selectedAsset && (
            <div style={{
              marginTop: 12,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: 16,
              animation: "fadeInUp 0.2s ease",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--accent-primary)" }}>
                {selectedAsset.ticker} — {selectedAsset.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Portfolio Weight", value: `${(selectedAsset.weight * 100).toFixed(1)}%` },
                  { label: "Scenario Impact", value: `${(selectedAsset.scenario_impact * 100).toFixed(1)}%`, color: "var(--accent-rose)" },
                  { label: "Portfolio Contribution", value: `${(selectedAsset.portfolio_contribution * 100).toFixed(2)}%`, color: "var(--accent-rose)" },
                  { label: "Sector", value: selectedAsset.sector },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2, letterSpacing: "0.06em" }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: color ?? "var(--text-primary)", fontFamily: "JetBrains Mono" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
