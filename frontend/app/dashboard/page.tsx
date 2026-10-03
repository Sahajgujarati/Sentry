"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResponse } from "@/types/analysis";
import { MOCK_ANALYSIS } from "@/lib/mockData";
import Navbar from "@/components/Navbar";
import EventHeader from "@/components/EventHeader";
import RiskCard from "@/components/RiskCard";
import StrategyPanel from "@/components/StrategyPanel";
import WeatherPanel from "@/components/WeatherPanel";
import NewsPanel from "@/components/NewsPanel";
import HistoricalEvents from "@/components/HistoricalEvents";
import PortfolioExposure from "@/components/PortfolioExposure";
import EvidencePanel from "@/components/EvidencePanel";
import AgentTracePanel from "@/components/AgentTrace";
import ScenarioChart from "@/components/ScenarioChart";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [mode, setMode] = useState<"live" | "demo">("demo");

  // Load analysis data and synchronize tab from URL
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sentry_analysis");
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setData(MOCK_ANALYSIS);
      }
    } catch (_) {
      setData(MOCK_ANALYSIS);
    }

    // Sync tab from URL query param or hash
    const syncTabFromUrl = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get("tab") || window.location.hash.replace("#", "");
        if (tabParam) {
          const upper = tabParam.toUpperCase();
          if (["OVERVIEW", "EVIDENCE", "PORTFOLIO", "AGENTS"].includes(upper)) {
            setActiveTab(upper);
          }
        }
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--term-teal)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  const handleRunLiveQuery = () => {
    router.push("/analysis");
  };

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    if (tab === "RUN ANALYSIS") {
      router.push("/analysis");
      return;
    }
    const targetUrl = tab === "OVERVIEW" ? "/dashboard" : `/dashboard?tab=${tab.toLowerCase()}`;
    window.history.replaceState(null, "", targetUrl);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Top Classic Terminal Navigation */}
      <Navbar
        mode={mode}
        onModeChange={(m) => setMode(m)}
        activeTab={activeTab}
        onTabChange={handleTabSelect}
      />

      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div>
            {/* Event Header with Scenario Bar and 2x2 Telemetry Matrix */}
            <EventHeader
              event={data.event}
              weather={data.weather}
              onRunLiveQuery={handleRunLiveQuery}
            />

            {/* Multi-Agent Signal Feeds Bar Header */}
            <div className="section-bar-header">
              <span className="section-bar-title">MULTI-AGENT SIGNAL FEEDS</span>
              <span className="section-bar-meta">LIVE SYNCHRONIZATION // 4 SOURCES</span>
            </div>

            {/* 4-Card Multi-Agent Grid */}
            <div className="signal-feeds-grid">
              {/* Card 1: Weather Feed */}
              <div className="signal-card">
                <div>
                  <div className="signal-card-header">
                    <span className="signal-card-title">WEATHER FEED</span>
                    <span className="signal-card-tag">NOAA RECON</span>
                  </div>
                  <div className="signal-card-val-row">
                    <span className="signal-big-val">
                      {Math.round((data.weather?.severity_score || 0.91) * 100)}%
                    </span>
                  </div>
                  <div className="signal-card-sublabel">SEVERITY INDEX</div>
                </div>
                <div className="signal-card-footer">
                  {data.weather?.wind_speed || 135} mph · 142 platforms in path
                </div>
              </div>

              {/* Card 2: News Sentiment */}
              <div className="signal-card">
                <div>
                  <div className="signal-card-header">
                    <span className="signal-card-title">NEWS SENTIMENT</span>
                    <span className="signal-card-tag">{data.news?.article_count || 18} BULLETINS</span>
                  </div>
                  <div className="signal-card-val-row">
                    <span className="signal-big-val val-red">
                      {data.news?.overall_sentiment ? data.news.overall_sentiment.toFixed(2) : "-0.72"}
                    </span>
                  </div>
                  <div className="signal-card-sublabel sublabel-red">BEARISH DISRUPTION</div>
                </div>
                <div className="signal-card-footer">
                  34% Gulf output shut-in confirmed
                </div>
              </div>

              {/* Card 3: Historical Analogs */}
              <div className="signal-card">
                <div>
                  <div className="signal-card-header">
                    <span className="signal-card-title">HISTORICAL ANALOGS</span>
                    <span className="signal-card-tag">KATRINA/IDA/HARVEY</span>
                  </div>
                  <div className="signal-card-val-row">
                    <span className="signal-big-val">{data.historical?.count || 7}</span>
                    <span className="signal-val-unit">CLUSTERS</span>
                  </div>
                  <div className="signal-card-sublabel">
                    MEDIAN DRAWDOWN {((data.historical?.aggregate_impact?.median || -0.058) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="signal-card-footer">
                  14 trading days median recovery
                </div>
              </div>

              {/* Card 4: Market Tick */}
              <div className="signal-card">
                <div>
                  <div className="signal-card-header">
                    <span className="signal-card-title">MARKET TICK</span>
                    <span className="signal-card-tag">XLE INTRADAY</span>
                  </div>
                  <div className="signal-card-val-row">
                    <span className="signal-big-val val-red">-3.8%</span>
                  </div>
                  <div className="signal-card-sublabel sublabel-red">ENERGY INDEX DRAG</div>
                </div>
                <div className="signal-card-footer">
                  Brent crude +4.2% · VIX at 21.4
                </div>
              </div>
            </div>

            {/* Lower 2-Column Split: Primary Risk Assessment & Synthesized Strategy */}
            <div className="terminal-lower-grid">
              <RiskCard risk={data.risk} />
              <StrategyPanel strategy={data.strategy} />
            </div>

            {/* Overview Detailed intelligence rows */}
            <div className="section-bar-header">
              <span className="section-bar-title">PORTFOLIO EXPOSURE &amp; SCENARIO SIMULATION</span>
              <span className="section-bar-meta">MONTE CARLO PROJECTIONS</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-void)" }}>
              <PortfolioExposure risk={data.risk} />
              <ScenarioChart scenarios={data.scenarios} risk={data.risk} />
            </div>

            <div className="section-bar-header">
              <span className="section-bar-title">EVIDENCE SOURCES &amp; HISTORICAL ANALOGS</span>
              <span className="section-bar-meta">VECTOR DB RETRIEVAL</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-void)" }}>
              <EvidencePanel market={data.market} macro={data.macro} />
              <HistoricalEvents historical={data.historical} />
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE */}
        {activeTab === "EVIDENCE" && (
          <div>
            {/* Header Status Strip */}
            <div className="section-bar-header" style={{ padding: "10px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="section-bar-title">EVIDENCE INTELLIGENCE &amp; TELEMETRY</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--term-teal)", background: "var(--term-teal-dim)", padding: "2px 6px", borderRadius: 2 }}>
                  TARGET: {data.event.type.toUpperCase()} (CAT {data.event.severity})
                </span>
              </div>
              <span className="section-bar-meta">4/4 STREAMS SYNCHRONIZED</span>
            </div>

            {/* Row 1: Monitored Assets & News Feed */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-void)" }}>
              <EvidencePanel market={data.market} macro={data.macro} />
              <NewsPanel news={data.news} />
            </div>

            {/* Section bar for deeper feeds */}
            <div className="section-bar-header" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <span className="section-bar-title">HISTORICAL ANALOG EXTRACTION &amp; NOAA SATELLITE RECON</span>
              <span className="section-bar-meta">VECTOR SIMILARITY SEARCH</span>
            </div>

            {/* Row 2: Vector DB Historical Analogs & NOAA Weather */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-void)" }}>
              <HistoricalEvents historical={data.historical} />
              <WeatherPanel weather={data.weather} />
            </div>
          </div>
        )}

        {/* TAB 3: PORTFOLIO */}
        {activeTab === "PORTFOLIO" && (
          <div>
            {/* Header Status Strip */}
            <div className="section-bar-header" style={{ padding: "10px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="section-bar-title">PORTFOLIO EXPOSURE &amp; VALUE-AT-RISK SIMULATION</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--term-red)", background: "var(--term-red-dim)", padding: "2px 6px", borderRadius: 2 }}>
                  ESTIMATED IMPACT: {(data.risk.portfolio_impact * 100).toFixed(2)}%
                </span>
              </div>
              <span className="section-bar-meta">HOLDINGS: $12.4M AUM // ENERGY WEIGHT 49.0%</span>
            </div>

            {/* Row 1: Holdings Exposure Breakdown & Scenario Stress Testing */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-void)" }}>
              <PortfolioExposure risk={data.risk} />
              <ScenarioChart scenarios={data.scenarios} risk={data.risk} />
            </div>

            {/* Section bar for Risk & Strategy */}
            <div className="section-bar-header" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <span className="section-bar-title">QUANTITATIVE RISK MATRIX &amp; ALPHA HEDGE SYNTHESIS</span>
              <span className="section-bar-meta">ACTIONABLE REBALANCE DIRECTIVES</span>
            </div>

            {/* Row 2: Risk Card & Strategy Panel */}
            <div className="terminal-lower-grid">
              <RiskCard risk={data.risk} />
              <StrategyPanel strategy={data.strategy} />
            </div>
          </div>
        )}

        {/* TAB 4: AGENTS */}
        {activeTab === "AGENTS" && (
          <div>
            {/* Header Status Strip */}
            <div className="section-bar-header" style={{ padding: "10px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="section-bar-title">MULTI-AGENT SWARM ORCHESTRATION</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--term-teal)", background: "var(--term-teal-dim)", padding: "2px 6px", borderRadius: 2 }}>
                  SWARM STATUS: 6/6 AGENTS CONVERGED
                </span>
              </div>
              <span className="section-bar-meta">TOTAL PIPELINE LATENCY: {data.agent_trace?.total_duration_ms || 3420}ms</span>
            </div>

            {/* Swarm Telemetry Metric Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ padding: "12px 16px", borderRight: "1px solid var(--border-subtle)" }}>
                <div className="matrix-cell-label">ACTIVE AGENT WORKERS</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                  {data.agent_trace?.steps?.length || 6} NODES
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--term-teal)", marginTop: 2 }}>
                  ALL PASSES RESOLVED
                </div>
              </div>

              <div style={{ padding: "12px 16px", borderRight: "1px solid var(--border-subtle)" }}>
                <div className="matrix-cell-label">VECTOR EMBEDDING INDEX</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--term-teal)", marginTop: 2 }}>
                  CHROMA / FAISS ONLINE
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  SIMILARITY THRESHOLD: 0.75
                </div>
              </div>

              <div style={{ padding: "12px 16px", borderRight: "1px solid var(--border-subtle)" }}>
                <div className="matrix-cell-label">REASONING LATENCY</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--term-amber)", marginTop: 2 }}>
                  {data.agent_trace?.total_duration_ms || 3420}ms
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  P95 TARGET: &lt; 4000ms
                </div>
              </div>

              <div style={{ padding: "12px 16px" }}>
                <div className="matrix-cell-label">QUANT REFINEMENT PASS</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--term-teal)", marginTop: 2 }}>
                  100% COMPLETE
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  CONFIDENCE: {((data.risk?.confidence || 0.88) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Interactive Agent Trace Execution Panel */}
            <div style={{ padding: "20px", background: "var(--bg-void)" }}>
              <AgentTracePanel trace={data.agent_trace} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
