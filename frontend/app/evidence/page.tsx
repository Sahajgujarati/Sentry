"use client";

import React, { useState } from "react";
import { TerminalNav } from "@/components/TerminalNav";
import { TerminalFooter } from "@/components/TerminalFooter";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { MOCK_ANALYSIS_DATA } from "@/lib/mock-analysis";
import { EvidenceSource } from "@/types/analysis";

export default function EvidencePage() {
  const data = MOCK_ANALYSIS_DATA;
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);

  // Derive individual evidence sources for clicking details
  const allEvidence = data.evidence;

  return (
    <div className="min-h-screen bg-background text-terminal-text flex flex-col font-sans selection:bg-terminal-accent/20 selection:text-terminal-accent">
      {/* 1. Terminal Top Navigation */}
      <TerminalNav />

      {/* 2. Interactive Telemetry Banner */}
      <div className="w-full bg-[#1A1A1A] border-b border-terminal-border py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-terminal-accent font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-terminal-accentDim border border-terminal-accent/30">
              EVIDENCE AUDIT TERMINAL
            </span>
            <span className="text-terminal-secondary truncate">
              Multi-Source Verification · Grounded Feeds · Spatial Embeddings Audit
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-terminal-muted uppercase text-[10px]">INTEGRITY CHECK:</span>
            <span className="text-terminal-accent font-bold">100% AUDIT VERIFIED</span>
            <span className="px-2 py-0.5 bg-surface border border-terminal-border text-[10px] text-terminal-accent uppercase font-mono ml-2">
              DEMO MODE
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
        {/* Page Title & Intro */}
        <div className="space-y-2 pb-6 border-b border-terminal-border">
          <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-accent">
            PERSON 2 DATA PLATFORM // GROUND TRUTH AUDIT
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-mono uppercase tracking-tight text-terminal-text">
            Intelligence Evidence & Telemetry Feed
          </h1>
          <p className="text-xs sm:text-sm font-mono text-terminal-secondary max-w-4xl">
            Grounded multi-modal intelligence aggregated across real-time news wires, meteorological feeds, historical event analog databases, and direct market liquidity tick streams. Click any evidence row for audit verification details.
          </p>
        </div>

        {/* SECTION 1: NEWS INTELLIGENCE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
            <div>
              <span className="terminal-label text-[10px] text-terminal-accent">SECTION 01</span>
              <h2 className="text-xl font-bold font-mono text-terminal-text uppercase">
                News & Disruption Sentiment Intelligence
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-terminal-secondary">
              <span>ARTICLES ANALYZED: <strong className="text-terminal-text">{data.news.article_count} BULLETINS</strong></span>
              <span>URGENCY: <strong className="text-terminal-negative">{data.news.urgency}</strong></span>
            </div>
          </div>

          {/* News Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-terminal-border border border-terminal-border">
            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">OVERALL SENTIMENT SCORE</div>
              <div className="text-3xl font-black font-mono text-terminal-negative">
                {data.news.sentiment > 0 ? `+${data.news.sentiment}` : data.news.sentiment}
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Classification: <span className="text-terminal-negative font-bold uppercase">{data.news.sentiment_label}</span>
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">INGESTED FEED SOURCES</div>
              <div className="text-3xl font-black font-mono text-terminal-text">
                18 WIRES
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Reuters, Bloomberg, Argus, BSEE Dispatches
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">PRIMARY IMPACT SECTOR</div>
              <div className="text-3xl font-black font-mono text-terminal-accent">
                ENERGY
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                34% Gulf Production Precautionary Shut-in
              </div>
            </div>
          </div>

          {/* News Headlines List */}
          <div className="border border-terminal-border bg-[#171717] divide-y divide-terminal-border">
            {data.news.top_headlines.map((headline, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedEvidence({
                    id: `ev-news-0${idx + 1}`,
                    type: "NEWS",
                    title: headline.title,
                    source: headline.source,
                    timestamp: headline.time_ago,
                    signal: `Wire bulletin reported by ${headline.source} (${headline.time_ago}). Sentiment impact score: ${headline.sentiment}.`,
                    relevance_score: 0.94 - idx * 0.03,
                  })
                }
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-hover cursor-pointer transition-colors gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-surface border border-terminal-border text-terminal-accent uppercase font-semibold">
                      {headline.source}
                    </span>
                    <span className="text-xs font-mono text-terminal-muted">
                      {headline.time_ago}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold font-mono text-terminal-text">
                    {headline.title}
                  </h4>
                </div>

                <div className="flex items-center space-x-6 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <div className="terminal-label text-[9px]">SENTIMENT</div>
                    <div className="text-terminal-negative font-bold">
                      {headline.sentiment}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="terminal-label text-[9px]">RELEVANCE</div>
                    <div className="text-terminal-accent font-bold">
                      {Math.round((0.94 - idx * 0.03) * 100)}%
                    </div>
                  </div>
                  <span className="text-terminal-accent font-bold"> inspect ›</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: WEATHER INTELLIGENCE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
            <div>
              <span className="terminal-label text-[10px] text-terminal-accent">SECTION 02</span>
              <h2 className="text-xl font-bold font-mono text-terminal-text uppercase">
                Meteorological & Environmental Telemetry
              </h2>
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              SOURCE: <strong className="text-terminal-text">{data.weather.source}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-terminal-border border border-terminal-border">
            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">EVENT CLASSIFICATION</div>
              <div className="text-2xl font-black font-mono text-terminal-accent uppercase">
                {data.event.category}
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                System: {data.event.name} ({data.event.id})
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">SEVERITY SCORE</div>
              <div className="text-3xl font-black font-mono text-terminal-negative">
                {Math.round(data.weather.severity_score * 100)}%
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Status: <span className="text-terminal-negative font-bold">{data.weather.status}</span>
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">SUSTAINED WIND VELOCITY</div>
              <div className="text-3xl font-black font-mono text-terminal-text">
                {data.weather.max_wind_speed_mph} MPH
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Central Pressure: {data.weather.central_pressure_mb} mb
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">OFFSHORE PLATFORMS THREATENED</div>
              <div className="text-3xl font-black font-mono text-terminal-warning">
                {data.weather.offshore_platforms_threatened} PLATFORMS
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Storm Surge: {data.weather.storm_surge_ft} ft
              </div>
            </div>
          </div>

          {/* Weather Location & Landfall Banner */}
          <div className="p-4 bg-[#171717] border border-terminal-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <span className="terminal-label text-[10px]">AFFECTED REGION:</span>
              <span className="text-terminal-text font-bold uppercase">{data.event.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="terminal-label text-[10px]">PROJECTED LANDFALL TRAJECTORY:</span>
              <span className="text-terminal-accent font-bold">{data.weather.projected_landfall}</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: HISTORICAL ANALOG INTELLIGENCE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
            <div>
              <span className="terminal-label text-[10px] text-terminal-accent">SECTION 03</span>
              <h2 className="text-xl font-bold font-mono text-terminal-text uppercase">
                Historical Event Analogs & Drawdown Benchmarks
              </h2>
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              COMPARABLE ANALOGS: <strong className="text-terminal-text">{data.historical.similar_events} MATCHES</strong>
            </div>
          </div>

          {/* Historical Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-terminal-border border border-terminal-border">
            <div className="bg-[#1D1D1D] p-4 space-y-1">
              <div className="terminal-label text-[9px]">MEDIAN IMPACT</div>
              <div className="text-xl font-bold font-mono text-terminal-negative">
                {(data.historical.median_impact * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-[#1D1D1D] p-4 space-y-1">
              <div className="terminal-label text-[9px]">MEAN IMPACT</div>
              <div className="text-xl font-bold font-mono text-terminal-negative">
                {(data.historical.mean_impact * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-[#1D1D1D] p-4 space-y-1">
              <div className="terminal-label text-[9px]">WORST CASE (KATRINA)</div>
              <div className="text-xl font-bold font-mono text-terminal-negative">
                {(data.historical.max_drawdown * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-[#1D1D1D] p-4 space-y-1">
              <div className="terminal-label text-[9px]">BEST CASE (MICHAEL)</div>
              <div className="text-xl font-bold font-mono text-terminal-accent">
                -4.20%
              </div>
            </div>
            <div className="bg-[#1D1D1D] p-4 space-y-1 col-span-2 sm:col-span-1">
              <div className="terminal-label text-[9px]">MEDIAN RECOVERY</div>
              <div className="text-xl font-bold font-mono text-terminal-text">
                {data.historical.recovery_days_median} TRADING DAYS
              </div>
            </div>
          </div>

          {/* Historical Analogs Comparison Table */}
          <div className="border border-terminal-border overflow-x-auto bg-[#171717]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#1D1D1D] border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                <tr>
                  <th className="p-3">HISTORICAL ANALOG EVENT</th>
                  <th className="p-3">YEAR</th>
                  <th className="p-3">INTENSITY CATEGORY</th>
                  <th className="p-3 text-right">EQUITY / SECTOR IMPACT</th>
                  <th className="p-3 text-right">RECOVERY TIMELINE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border">
                {data.historical.key_analogs.map((analog, idx) => (
                  <tr
                    key={idx}
                    onClick={() =>
                      setSelectedEvidence({
                        id: `ev-hist-0${idx + 1}`,
                        type: "HISTORICAL",
                        title: `${analog.name} (${analog.year}) Analog Benchmark`,
                        source: "Sentry Historical Disruption Database",
                        timestamp: `${analog.year}-08-28T00:00:00Z`,
                        signal: `${analog.name} (Category ${analog.category}) produced a total asset drawdown of ${(analog.impact_pct * 100).toFixed(2)}% with a recovery period of ${analog.recovery_days} trading days.`,
                        relevance_score: 0.95 - idx * 0.02,
                      })
                    }
                    className="hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-terminal-text">{analog.name}</td>
                    <td className="p-3 text-terminal-secondary">{analog.year}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-surface border border-terminal-border text-[10px] text-terminal-warning">
                        CATEGORY {analog.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-terminal-negative">
                      {(analog.impact_pct * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-terminal-text">
                      {analog.recovery_days} Days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: MARKET INTELLIGENCE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
            <div>
              <span className="terminal-label text-[10px] text-terminal-accent">SECTION 04</span>
              <h2 className="text-xl font-bold font-mono text-terminal-text uppercase">
                Market Signals & Liquidity Tick Performance
              </h2>
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              FEED: <strong className="text-terminal-text">DIRECT EXCHANGE TICK FEED</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-terminal-border border border-terminal-border">
            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">ENERGY SECTOR INTRADAY</div>
              <div className="text-3xl font-black font-mono text-terminal-negative">
                {(data.market.energy_sector_movement * 100).toFixed(2)}%
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Primary Shock Recipient
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">CRUDE OIL FUTURES (WTI/BRENT)</div>
              <div className="text-3xl font-black font-mono text-terminal-accent">
                +{(data.market.crude_oil_movement * 100).toFixed(2)}%
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Front-Month Premium +$3.40/bbl
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">BENCHMARK S&P 500</div>
              <div className="text-3xl font-black font-mono text-terminal-negative">
                {(data.market.sp500_movement * 100).toFixed(2)}%
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Broad Systemic Equity Drag
              </div>
            </div>

            <div className="bg-[#1D1D1D] p-5 space-y-2">
              <div className="terminal-label text-[10px]">VIX VOLATILITY INDEX</div>
              <div className="text-3xl font-black font-mono text-terminal-warning">
                {data.market.vix_level} (+{(data.market.vix_change_pct * 100).toFixed(1)}%)
              </div>
              <div className="text-xs font-mono text-terminal-secondary">
                Option Implied Volatility Surge
              </div>
            </div>
          </div>

          {/* Sector Performance List */}
          <div className="border border-terminal-border bg-[#171717] p-5 space-y-3">
            <div className="terminal-label text-[10px]">CROSS-SECTOR INTRADAY PERFORMANCE DIVERGENCE</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(data.market.sector_performance).map(([sec, val]) => (
                <div key={sec} className="p-3 bg-surface border border-terminal-border space-y-1">
                  <div className="text-xs font-mono font-bold text-terminal-text">{sec}</div>
                  <div className={`text-lg font-mono font-bold ${val < 0 ? "text-terminal-negative" : "text-terminal-accent"}`}>
                    {val > 0 ? `+${(val * 100).toFixed(2)}%` : `${(val * 100).toFixed(2)}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Evidence Grounding Attestation List */}
        <section className="space-y-4 pt-6 border-t border-terminal-border">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-mono text-terminal-text uppercase">
              Primary Evidence Sources & Spatial Vector Embeddings ({allEvidence.length} Total Feeds)
            </h3>
            <span className="text-xs font-mono text-terminal-muted">CLICK ROW FOR FULL AUDIT DRAWER</span>
          </div>

          <div className="border border-terminal-border bg-[#171717] divide-y divide-terminal-border">
            {allEvidence.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedEvidence(item)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-hover cursor-pointer transition-colors gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-surface border border-terminal-border text-terminal-accent uppercase font-bold">
                      {item.type}
                    </span>
                    <span className="text-xs font-mono text-terminal-text font-bold">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-terminal-muted line-clamp-1">
                    {item.signal}
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <div className="terminal-label text-[9px]">SOURCE</div>
                    <div className="text-terminal-secondary truncate max-w-[150px]">
                      {item.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="terminal-label text-[9px]">RELEVANCE</div>
                    <div className="text-terminal-accent font-bold">
                      {Math.round(item.relevance_score * 100)}%
                    </div>
                  </div>
                  <span className="text-terminal-accent font-bold">[ INSPECT ]</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 3. Reusable Evidence Detail Drawer */}
      <EvidenceDrawer
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* 4. Terminal Footer */}
      <TerminalFooter />
    </div>
  );
}
