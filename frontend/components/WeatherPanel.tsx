"use client";
import { WeatherData } from "@/types/analysis";

interface WeatherPanelProps {
  weather: WeatherData;
}

export default function WeatherPanel({ weather }: WeatherPanelProps) {
  const severityPct = Math.round((weather.severity_score || 0.91) * 100);

  return (
    <div className="terminal-panel-box">
      <div className="panel-title-bar">
        <span className="panel-title-text">WEATHER &amp; SATELLITE TELEMETRY</span>
        <span className="matrix-cell-val-mono">NOAA RECON</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: 10 }}>
          <div className="matrix-cell-label">SEVERITY INDEX</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--term-teal)" }}>
            {severityPct}%
          </div>
        </div>
        <div style={{ background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: 10 }}>
          <div className="matrix-cell-label">WIND SPEED</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#fff" }}>
            {weather.wind_speed || 135} mph
          </div>
        </div>
      </div>

      {weather.affected_regions && (
        <div>
          <div className="matrix-cell-label" style={{ marginBottom: 6 }}>MONITORED IMPACT REGIONS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {weather.affected_regions.map((reg) => (
              <span key={reg} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-sub)", background: "#0c0f16", border: "1px solid var(--border-subtle)", padding: "3px 8px" }}>
                {reg}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
