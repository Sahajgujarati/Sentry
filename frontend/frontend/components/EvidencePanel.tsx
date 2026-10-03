"use client";
import { MarketData, MacroData } from "@/types/analysis";

interface EvidencePanelProps {
  market: MarketData;
  macro?: MacroData;
}

export default function EvidencePanel({ market, macro }: EvidencePanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Market Data */}
      <div className="card" style={{ animation: "fadeInUp 0.5s ease both" }}>
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>MARKET DATA</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Asset Performance</div>
        </div>

        {/* Sector performance summary */}
        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
          padding: 12,
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
        }}>
          {Object.entries(market.sector_performance).map(([sector, perf]) => (
            <div key={sector} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2, letterSpacing: "0.06em" }}>
                {sector.toUpperCase()}
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "JetBrains Mono",
                color: perf < 0 ? "var(--accent-rose)" : "var(--accent-emerald)",
              }}>
                {perf > 0 ? "+" : ""}{(perf * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* Asset table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["TICKER", "NAME", "PRICE", "1D", "7D", "SECTOR"].map((h) => (
                  <th key={h} style={{
                    textAlign: h === "TICKER" || h === "NAME" ? "left" : "right",
                    padding: "6px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {market.assets.map((asset, i) => (
                <tr key={asset.ticker} style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  transition: "background 0.15s",
                }}>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      fontFamily: "JetBrains Mono",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                    }}>{asset.ticker}</span>
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 13, color: "var(--text-secondary)" }}>{asset.name}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 600 }}>
                    ${asset.price.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "JetBrains Mono",
                      fontSize: 13,
                      fontWeight: 700,
                      color: asset.change_1d < 0 ? "var(--accent-rose)" : "var(--accent-emerald)",
                    }}>
                      {asset.change_1d > 0 ? "+" : ""}{(asset.change_1d * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    {asset.change_7d !== undefined && (
                      <span style={{
                        fontFamily: "JetBrains Mono",
                        fontSize: 13,
                        fontWeight: 700,
                        color: asset.change_7d < 0 ? "var(--accent-rose)" : "var(--accent-emerald)",
                      }}>
                        {asset.change_7d > 0 ? "+" : ""}{(asset.change_7d * 100).toFixed(2)}%
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <span className="badge badge-blue" style={{ fontSize: 10, padding: "2px 8px" }}>{asset.sector}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {market.timestamp && (
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", textAlign: "right" }} className="mono">
            Last updated: {new Date(market.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Macro indicators */}
      {macro && macro.indicators.length > 0 && (
        <div className="card" style={{ animation: "fadeInUp 0.5s 0.15s ease both" }}>
          <div style={{ marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 4 }}>MACRO ENVIRONMENT</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Key Economic Indicators</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {macro.indicators.map((indicator) => {
              const isPositive = indicator.change > 0;
              const changeColor = indicator.indicator.includes("Inflation") || indicator.indicator.includes("Rate") || indicator.indicator.includes("Yield")
                ? isPositive ? "var(--accent-rose)" : "var(--accent-emerald)"
                : isPositive ? "var(--accent-emerald)" : "var(--accent-rose)";

              return (
                <div key={indicator.indicator} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{indicator.indicator}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                        {indicator.value}{indicator.unit === "%" ? "%" : ""}
                        {indicator.unit && indicator.unit !== "%" && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{indicator.unit}</span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      background: `${changeColor}15`,
                      border: `1px solid ${changeColor}30`,
                      borderRadius: 100,
                    }}>
                      <span style={{ fontSize: 11, color: changeColor }}>
                        {isPositive ? "▲" : "▼"}
                      </span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: changeColor }}>
                        {Math.abs(indicator.change).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
