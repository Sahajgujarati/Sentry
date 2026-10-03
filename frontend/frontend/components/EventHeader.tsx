"use client";
import { EventData, WeatherData } from "@/types/analysis";

const SEVERITY_ICONS: Record<number, string> = { 1: "🌀", 2: "🌀", 3: "⚠️", 4: "🔴", 5: "🚨" };
const SEVERITY_COLOR: Record<number, string> = {
  1: "var(--accent-emerald)", 2: "var(--accent-emerald)",
  3: "var(--accent-amber)", 4: "var(--accent-rose)", 5: "var(--risk-critical)",
};

interface EventHeaderProps {
  event: EventData;
  weather: WeatherData;
}

export default function EventHeader({ event, weather }: EventHeaderProps) {
  const sevColor = SEVERITY_COLOR[event.severity] ?? "var(--accent-rose)";
  const sevIcon = SEVERITY_ICONS[event.severity] ?? "⚠️";

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "32px",
      animation: "fadeInUp 0.5s ease forwards",
    }}
      className={`glow-border-${event.severity >= 4 ? "red" : "amber"}`}
    >
      {/* Radial glow background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 20% 50%, ${sevColor}10 0%, transparent 60%)`,
      }}/>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        {/* Left: event info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 36 }}>{sevIcon}</span>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>EVENT DETECTED</div>
              <h1 style={{
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 800,
                color: sevColor,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}>
                CATEGORY {event.severity} {event.type.toUpperCase()}
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 500 }}>{event.location}</span>
          </div>

          {event.description && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 480, lineHeight: 1.6 }}>
              {event.description}
            </p>
          )}
        </div>

        {/* Right: key metrics */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <MetricChip label="Severity Score" value={`${(weather.severity_score * 100).toFixed(0)}%`} color={sevColor} />
          {weather.wind_speed && (
            <MetricChip label="Wind Speed" value={`${weather.wind_speed} mph`} color="var(--accent-cyan)" />
          )}
          {weather.forecast_duration_days && (
            <MetricChip label="Duration Forecast" value={`${weather.forecast_duration_days} days`} color="var(--accent-violet)" />
          )}
        </div>
      </div>

      {/* Affected regions & sectors */}
      <div style={{ marginTop: 24, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>AFFECTED REGIONS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {weather.affected_regions.map((r) => (
              <span key={r} className="badge badge-red">{r}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>AFFECTED SECTORS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {weather.affected_sectors.map((s) => (
              <span key={s} className="badge badge-amber">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      minWidth: 120,
      textAlign: "center",
    }}>
      <div className="section-label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "Outfit" }}>{value}</div>
    </div>
  );
}
