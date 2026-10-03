"use client";
import { WeatherData } from "@/types/analysis";

interface WeatherPanelProps {
  weather: WeatherData;
}

const CATEGORY_LABELS: Record<number, string> = {
  1: "Tropical Storm",
  2: "Category 2",
  3: "Category 3",
  4: "Category 4",
  5: "Category 5",
};

export default function WeatherPanel({ weather }: WeatherPanelProps) {
  const severityPct = weather.severity_score * 100;
  const catColor = weather.severity >= 4 ? "var(--accent-rose)" : weather.severity >= 3 ? "var(--accent-amber)" : "var(--accent-emerald)";

  return (
    <div className="card" style={{ animation: "fadeInUp 0.5s 0.2s ease both" }}>
      <div style={{ marginBottom: 20 }}>
        <div className="section-label" style={{ marginBottom: 4 }}>WEATHER INTELLIGENCE</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Event Analysis</div>
      </div>

      {/* Central weather display */}
      <div style={{
        textAlign: "center",
        padding: "28px 20px",
        background: `radial-gradient(ellipse at 50% 50%, ${catColor}15 0%, transparent 70%)`,
        border: `1px solid ${catColor}30`,
        borderRadius: "var(--radius-xl)",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Spinning animation for category 4+ */}
        <div style={{
          fontSize: 72,
          lineHeight: 1,
          marginBottom: 8,
          display: "inline-block",
          animation: weather.severity >= 3 ? "spin 8s linear infinite" : "none",
          filter: `drop-shadow(0 0 20px ${catColor}80)`,
        }}>
          🌀
        </div>

        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: catColor,
          fontFamily: "Outfit",
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}>
          {CATEGORY_LABELS[weather.severity] ?? `Category ${weather.severity}`}
        </div>

        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {weather.event_type.charAt(0).toUpperCase() + weather.event_type.slice(1)}
        </div>

        {weather.coordinates && (
          <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            {weather.coordinates.lat.toFixed(1)}°N, {Math.abs(weather.coordinates.lon).toFixed(1)}°W
          </div>
        )}
      </div>

      {/* Severity gauge */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Severity Score</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: catColor }}>{severityPct.toFixed(0)}%</span>
        </div>

        {/* Segmented gauge */}
        <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
          {Array.from({ length: 20 }, (_, i) => {
            const filled = i < Math.round(severityPct / 5);
            const color = i < 6 ? "var(--accent-emerald)" : i < 12 ? "var(--accent-amber)" : "var(--accent-rose)";
            return (
              <div key={i} style={{
                flex: 1,
                height: 8,
                borderRadius: 2,
                background: filled ? color : "var(--border-subtle)",
                transition: `background 0.3s ${i * 0.03}s`,
              }}/>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "var(--accent-emerald)" }}>LOW</span>
          <span style={{ fontSize: 10, color: "var(--accent-amber)" }}>MODERATE</span>
          <span style={{ fontSize: 10, color: "var(--accent-rose)" }}>EXTREME</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "WIND SPEED", value: weather.wind_speed ? `${weather.wind_speed} mph` : "N/A", color: "var(--accent-cyan)" },
          { label: "DURATION FORECAST", value: weather.forecast_duration_days ? `${weather.forecast_duration_days} days` : "N/A", color: "var(--accent-violet)" },
          { label: "SEVERITY CATEGORY", value: `CAT ${weather.severity}`, color: catColor },
          { label: "EVENT TYPE", value: weather.event_type.toUpperCase(), color: "var(--text-secondary)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "12px",
          }}>
            <div className="section-label" style={{ marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "JetBrains Mono" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Affected regions */}
      <div>
        <div className="section-label" style={{ marginBottom: 10 }}>AFFECTED REGIONS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {weather.affected_regions.map((region, i) => (
            <div key={region} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: 100,
              animation: `fadeInUp 0.3s ${i * 0.08}s ease both`,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: catColor,
                boxShadow: `0 0 6px ${catColor}`,
              }}/>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{region}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sector impact warning */}
      {weather.affected_sectors.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: 14,
          background: "var(--accent-rose-glow)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-rose)", marginBottom: 4 }}>
            ⚠ SECTOR EXPOSURE ALERT
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Storm path threatens <strong style={{ color: "var(--text-primary)" }}>
              {weather.affected_sectors.join(", ")}
            </strong> sector operations
          </div>
        </div>
      )}
    </div>
  );
}
