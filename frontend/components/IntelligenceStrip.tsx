import React from "react";
import {
  WeatherIntelligence,
  NewsIntelligence,
  HistoricalIntelligence,
  MarketIntelligence,
} from "@/types/analysis";

interface IntelligenceStripProps {
  weather: WeatherIntelligence;
  news: NewsIntelligence;
  historical: HistoricalIntelligence;
  market: MarketIntelligence;
}

export const IntelligenceStrip: React.FC<IntelligenceStripProps> = ({
  weather,
  news,
  historical,
  market,
}) => {
  return (
    <section className="border-b border-terminal-border bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-muted">
              MULTI-AGENT SIGNAL FEEDS
            </span>
          </div>
          <span className="text-[10px] font-mono text-terminal-muted uppercase">
            LIVE SYNCHRONIZATION // 4 SOURCES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-terminal-border border border-terminal-border">
          {/* Weather */}
          <div className="bg-[#1D1D1D] p-4 flex flex-col justify-between hover:bg-surface-hover transition-colors">
            <div className="flex items-center justify-between">
              <span className="terminal-label text-[10px]">WEATHER FEED</span>
              <span className="text-[10px] font-mono text-terminal-secondary">NOAA RECON</span>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold font-mono text-terminal-text">
                {Math.round(weather.severity_score * 100)}%
              </div>
              <div className="text-xs text-terminal-secondary font-mono">SEVERITY INDEX</div>
            </div>
            <div className="text-[11px] text-terminal-muted truncate pt-1 border-t border-terminal-border/60">
              {weather.max_wind_speed_mph} mph · {weather.offshore_platforms_threatened} platforms in path
            </div>
          </div>

          {/* News Sentiment */}
          <div className="bg-[#1D1D1D] p-4 flex flex-col justify-between hover:bg-surface-hover transition-colors">
            <div className="flex items-center justify-between">
              <span className="terminal-label text-[10px]">NEWS SENTIMENT</span>
              <span className="text-[10px] font-mono text-terminal-secondary">
                {news.article_count} BULLETINS
              </span>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold font-mono text-terminal-negative">
                {news.sentiment > 0 ? `+${news.sentiment.toFixed(2)}` : news.sentiment.toFixed(2)}
              </div>
              <div className="text-xs text-terminal-secondary font-mono">BEARISH DISRUPTION</div>
            </div>
            <div className="text-[11px] text-terminal-muted truncate pt-1 border-t border-terminal-border/60">
              34% Gulf output shut-in confirmed
            </div>
          </div>

          {/* Historical Precedents */}
          <div className="bg-[#1D1D1D] p-4 flex flex-col justify-between hover:bg-surface-hover transition-colors">
            <div className="flex items-center justify-between">
              <span className="terminal-label text-[10px]">HISTORICAL ANALOGS</span>
              <span className="text-[10px] font-mono text-terminal-secondary">KATRINA/IDA/HARVEY</span>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold font-mono text-terminal-text">
                {historical.similar_events}{" "}
                <span className="text-sm font-normal text-terminal-secondary">CLUSTERS</span>
              </div>
              <div className="text-xs text-terminal-secondary font-mono">
                MEDIAN DRAWDOWN {(historical.median_impact * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-[11px] text-terminal-muted truncate pt-1 border-t border-terminal-border/60">
              {historical.recovery_days_median} trading days median recovery
            </div>
          </div>

          {/* Market Signal */}
          <div className="bg-[#1D1D1D] p-4 flex flex-col justify-between hover:bg-surface-hover transition-colors">
            <div className="flex items-center justify-between">
              <span className="terminal-label text-[10px]">MARKET TICK</span>
              <span className="text-[10px] font-mono text-terminal-secondary">XLE INTRADAY</span>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold font-mono text-terminal-negative">
                {(market.energy_sector_movement * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-terminal-secondary font-mono">ENERGY INDEX DRAG</div>
            </div>
            <div className="text-[11px] text-terminal-muted truncate pt-1 border-t border-terminal-border/60">
              Brent crude +4.2% · VIX at {market.vix_level}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
