"use client";
import { EventData, WeatherData } from "@/types/analysis";

interface EventHeaderProps {
  event: EventData;
  weather: WeatherData;
  onRunLiveQuery?: () => void;
}

export default function EventHeader({ event, weather, onRunLiveQuery }: EventHeaderProps) {
  const severityPct = Math.round((weather.severity_score || 0.91) * 100);
  const severityLabel = severityPct >= 85 ? "CRITICAL" : severityPct >= 65 ? "HIGH" : "ELEVATED";
  const primarySector = weather.affected_sectors?.[0] || "ENERGY";
  const primaryRegion = weather.affected_regions?.[0] || event.location || "Gulf of Mexico";
  const windSpeed = weather.wind_speed || 135;

  return (
    <div>
      {/* Subheader / Scenario Bar */}
      <div className="scenario-bar">
        <div className="scenario-bar-left">
          <span className="badge-active-terminal">[ TERMINAL ACTIVE ]</span>
          <span className="scenario-bar-title">
            Scenario: Category {event.severity} {event.type.charAt(0).toUpperCase() + event.type.slice(1)} in {event.location} ({primarySector.charAt(0).toUpperCase() + primarySector.slice(1).toLowerCase()} Portfolio)
          </span>
        </div>

        <button onClick={onRunLiveQuery} className="btn-terminal-action">
          [ RUN LIVE ANALYSIS QUERY ] &gt;
        </button>
      </div>

      {/* Main Event Telemetry Hero */}
      <div className="event-telemetry-container">
        {/* Meta top line */}
        <div className="event-meta-line">
          <span className="event-telemetry-id">
            EVENT TELEMETRY // EVT-2026-0941
          </span>
          <span className="badge-active-tracking">
            ACTIVE TRACKING
          </span>
        </div>

        {/* 2-Column layout */}
        <div className="event-main-grid">
          {/* Left Column: Heading + Description */}
          <div>
            <h1 className="event-title-hero">
              CATEGORY {event.severity} {event.type}
            </h1>
            <div className="event-subtitle-hero">
              {event.location}
            </div>
            <p className="event-desc-hero">
              {event.description ||
                `Rapidly intensifying system sustained at ${windSpeed} mph heading toward major offshore production corridors. Expected landfall within 36 hours.`}
            </p>
          </div>

          {/* Right Column: 2x2 Matrix Box */}
          <div className="telemetry-matrix">
            {/* Cell 1: Severity */}
            <div className="matrix-cell">
              <div className="matrix-cell-label">EVENT SEVERITY</div>
              <div className="matrix-cell-val">
                <span>{severityPct}%</span>
                <span className="matrix-cell-tag-red">{severityLabel}</span>
              </div>
            </div>

            {/* Cell 2: Region */}
            <div className="matrix-cell">
              <div className="matrix-cell-label">AFFECTED REGION</div>
              <div className="matrix-cell-val" style={{ fontSize: "14px" }}>
                {primaryRegion}
              </div>
            </div>

            {/* Cell 3: Sector */}
            <div className="matrix-cell">
              <div className="matrix-cell-label">AFFECTED SECTOR</div>
              <div className="matrix-cell-val-teal">
                {primarySector.toUpperCase()}
              </div>
            </div>

            {/* Cell 4: System Dynamics */}
            <div className="matrix-cell">
              <div className="matrix-cell-label">SYSTEM DYNAMICS</div>
              <div className="matrix-cell-val-mono">
                {windSpeed} mph / 938 mb
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
