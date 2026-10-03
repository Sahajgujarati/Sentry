import React from "react";
import { EventDetails, WeatherIntelligence } from "@/types/analysis";

interface EventHeaderProps {
  event: EventDetails;
  weather: WeatherIntelligence;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ event, weather }) => {
  return (
    <section className="border-b border-terminal-border bg-surface/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Main Shock Headline */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-mono tracking-wideTerminal text-terminal-muted uppercase">
                EVENT TELEMETRY // {event.id}
              </span>
              <span className="text-terminal-border">|</span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-terminal-negativeDim text-terminal-negative border border-terminal-negative/30">
                {event.status.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-terminal-text uppercase">
                {event.category}
              </h1>
              <div className="text-xl sm:text-2xl font-light text-terminal-secondary tracking-tight">
                {event.location}
              </div>
            </div>

            <p className="text-sm text-terminal-secondary max-w-3xl leading-relaxed pt-1">
              {event.summary}
            </p>
          </div>

          {/* Compact Technical Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-px bg-terminal-border border border-terminal-border self-start lg:w-96">
            <div className="bg-[#171717] p-3.5 space-y-1">
              <div className="terminal-label text-[10px]">EVENT SEVERITY</div>
              <div className="text-xl font-bold font-mono text-terminal-text flex items-baseline space-x-1">
                <span>{Math.round(event.severity * 100)}%</span>
                <span className="text-[10px] text-terminal-negative uppercase font-mono font-normal">
                  CRITICAL
                </span>
              </div>
            </div>

            <div className="bg-[#171717] p-3.5 space-y-1">
              <div className="terminal-label text-[10px]">AFFECTED REGION</div>
              <div className="text-sm font-semibold text-terminal-text truncate">
                {event.location}
              </div>
            </div>

            <div className="bg-[#171717] p-3.5 space-y-1">
              <div className="terminal-label text-[10px]">AFFECTED SECTOR</div>
              <div className="text-sm font-mono font-bold text-terminal-accent">
                {event.affected_sector}
              </div>
            </div>

            <div className="bg-[#171717] p-3.5 space-y-1">
              <div className="terminal-label text-[10px]">SYSTEM DYNAMICS</div>
              <div className="text-sm font-mono text-terminal-secondary">
                {weather.max_wind_speed_mph} mph / {weather.central_pressure_mb} mb
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
