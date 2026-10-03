"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResponse } from "@/types/analysis";
import { MOCK_ANALYSIS } from "@/lib/mockData";

/* ── Nav items ── */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: IconDashboard },
  { id: "analysis", label: "Live Analysis", icon: IconAnalysis },
  { id: "portfolio", label: "Portfolio", icon: IconPortfolio },
  { id: "market", label: "Market Data", icon: IconMarket },
  { id: "news", label: "News & Sentiment", icon: IconNews },
  { id: "weather", label: "Weather", icon: IconWeather },
  { id: "historical", label: "Historical Events", icon: IconHistory },
  { id: "agents", label: "Agent Trace", icon: IconAgents },
  { id: "reports", label: "Reports", icon: IconReports },
];

// Professional palette: blue-indigo accent + semantic status tones
const SECTOR_COLORS = ["#4f7ef8", "#818cf8", "#6ea8fe", "#93c5fd", "#bfdbfe", "#dbeafe"];

const SECTOR_BAR_IMPACTS = [
  { name: "Energy", impact: -5.2, fill: "#f43f5e" },
  { name: "Oil & Gas Stocks", impact: -4.8, fill: "#fb7185" },
  { name: "Utilities", impact: -2.1, fill: "#f59e0b" },
  { name: "Tech Stocks", impact: -1.3, fill: "#4f7ef8" },
  { name: "Consumer Goods", impact: -0.8, fill: "#10b981" },
];

const SCENARIO_TABS = ["Mild", "Base", "Severe", "Custom"] as const;
type ScenarioKey = (typeof SCENARIO_TABS)[number];

const SCENARIO_DATA: Record<ScenarioKey, { impact: string; dollar: string; riskScore: number; assets: number; loss: string }> = {
  Mild:   { impact: "-0.98%", dollar: "(-$9,800)",  riskScore: 38, assets: 4, loss: "~$9,800" },
  Base:   { impact: "-2.84%", dollar: "(-$28,400)", riskScore: 72, assets: 8, loss: "~$28,400" },
  Severe: { impact: "-4.66%", dollar: "(-$46,600)", riskScore: 88, assets: 12, loss: "~$46,600" },
  Custom: { impact: "-3.50%", dollar: "(-$35,000)", riskScore: 80, assets: 10, loss: "~$35,000" },
};

const EVIDENCE_TABS = ["News", "Weather", "Market", "Historical"] as const;
type EvidenceTab = (typeof EVIDENCE_TABS)[number];

const EVIDENCE_ITEMS: Record<EvidenceTab, { icon: string; text: string; source: string; time: string }[]> = {
  News: [
    { icon: "📰", text: "Energy markets brace for major hurricane impact", source: "Reuters", time: "2h ago" },
    { icon: "🛢️", text: "Gulf of Mexico production at risk as storm strengthens", source: "Bloomberg", time: "3h ago" },
    { icon: "📈", text: "Oil prices rise on hurricane concerns", source: "CNBC", time: "4h ago" },
    { icon: "⚡", text: "Energy sector hit by storm-related disruptions", source: "Financial Times", time: "5h ago" },
  ],
  Weather: [
    { icon: "🌀", text: "Category 4 hurricane approaching Gulf Coast at 145mph", source: "NOAA", time: "1h ago" },
    { icon: "🌧️", text: "Forecast: 5-day disruption window for offshore rigs", source: "NHC", time: "2h ago" },
    { icon: "📡", text: "Satellite imagery confirms storm intensification", source: "NWS", time: "3h ago" },
    { icon: "🗺️", text: "TX, LA, MS coastal advisories in effect", source: "FEMA", time: "4h ago" },
  ],
  Market: [
    { icon: "📊", text: "XOM down 4.1% as offshore shutdowns begin", source: "NYSE", time: "30m ago" },
    { icon: "💹", text: "USO crude ETF surges 3.2% on supply fears", source: "CBOE", time: "1h ago" },
    { icon: "📉", text: "Energy sector ETF (XLE) drops 3.8% intraday", source: "NYSE", time: "2h ago" },
    { icon: "🔻", text: "OXY, CVX follow XOM lower on Gulf exposure", source: "NYSE", time: "3h ago" },
  ],
  Historical: [
    { icon: "🕵️", text: "Hurricane Ida 2021: Energy sector -6.4%", source: "VectorDB", time: "sim: 91%" },
    { icon: "🕵️", text: "Hurricane Laura 2020: Energy sector -5.2%", source: "VectorDB", time: "sim: 84%" },
    { icon: "🕵️", text: "Hurricane Harvey 2017: Energy sector -7.1%", source: "VectorDB", time: "sim: 78%" },
    { icon: "🕵️", text: "Hurricane Ike 2008: Energy sector -8.9%", source: "VectorDB", time: "sim: 71%" },
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [scenario, setScenario] = useState<ScenarioKey>("Mild");
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>("News");
  const [now, setNow] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sentry_analysis");
      if (stored) { setData(JSON.parse(stored)); return; }
    } catch (_) {}
    setData(MOCK_ANALYSIS);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
    </div>
  );

  const sd = SCENARIO_DATA[scenario];
  const portfolioSectors = [
    { name: "Energy", pct: 49, color: SECTOR_COLORS[0] },
    { name: "Technology", pct: 18, color: SECTOR_COLORS[1] },
    { name: "Healthcare", pct: 12, color: SECTOR_COLORS[2] },
    { name: "Financials", pct: 8, color: SECTOR_COLORS[3] },
    { name: "Consumer Goods", pct: 7, color: SECTOR_COLORS[4] },
    { name: "Others", pct: 6, color: SECTOR_COLORS[5] },
  ];

  const agentSteps = data.agent_trace.steps;

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Sentry AI</div>
            <div className="sidebar-brand-sub">Financial Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {NAV.slice(0, 5).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => {
                if (id === "analysis") { router.push("/analysis"); return; }
                setActiveNav(id);
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
          <div className="sidebar-section-label">Intelligence</div>
          {NAV.slice(5).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer card */}
        <div className="sidebar-footer">
          <div className="sidebar-agent-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4f7ef8,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>AI Agents Active</div>
                <div style={{ fontSize: 10, color: "var(--text-3)" }}>5 / 5</div>
              </div>
            </div>
            <div className="agent-dot-row">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="agent-dot" style={{ background: "var(--success)", boxShadow: "0 0 5px var(--success)" }}/>
              ))}
            </div>
            <p style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.5 }}>
              Real-time intelligence.<br />Smarter decisions.<br />Better outcomes.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Header ── */}
      <header className="header">
        <div className="header-title-block">
          <div className="header-title">Financial Intelligence Terminal</div>
          <div className="header-sub">Real-time event analysis, risk assessment and strategic recommendations</div>
        </div>

        <div className="header-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, assets, or ask a question..."
          />
        </div>

        <div className="header-right">
          <div className="header-date" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
            {now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            &nbsp;&nbsp;
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} UTC
          </div>
          <div className="live-badge">
            <div className="pulse-green"/>
            System Online
          </div>
          <div className="avatar" title="User">JD</div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="main page-enter">
        {/* Stat cards */}
        <div className="stat-grid">
          {/* Event Detected */}
          <div className="stat-card anim-1" style={{ borderLeft: "3px solid var(--rose)" }}>
            <div className="stat-card-label">
              <div className="stat-card-icon" style={{ background: "var(--rose-glow)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span style={{ color: "var(--rose)" }}>Event Detected</span>
            </div>
            <div className="stat-value" style={{ fontSize: 16, marginTop: 6 }}>Hurricane — Gulf of Mexico</div>
            <div className="stat-sub">Category 4&nbsp;&nbsp;|&nbsp;&nbsp;Gulf of Mexico</div>
          </div>

          {/* Portfolio Risk */}
          <div className="stat-card anim-2" style={{ borderLeft: "3px solid var(--rose)" }}>
            <div className="stat-card-label">
              <div className="stat-card-icon" style={{ background: "var(--rose-glow)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span>Portfolio Risk</span>
            </div>
            <div className="stat-value text-rose">High</div>
            <div className="stat-sub">Risk Score {data.risk.risk_score} / 100</div>
            <div className="pbar" style={{ marginTop: 8 }}>
              <div className="pbar-fill" style={{ width: `${data.risk.risk_score}%`, background: "linear-gradient(90deg,#f43f5e,#dc2626)" }}/>
            </div>
          </div>

          {/* Estimated Impact */}
          <div className="stat-card anim-3" style={{ borderLeft: "3px solid var(--violet)" }}>
            <div className="stat-card-label">
              <div className="stat-card-icon" style={{ background: "rgba(167,139,250,0.12)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2.5">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                </svg>
              </div>
              <span>Estimated Impact</span>
            </div>
            <div className="stat-value text-rose">{(data.risk.portfolio_impact * 100).toFixed(2)}%</div>
            <div className="stat-sub">(~${Math.abs(data.risk.portfolio_impact * 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 0 })})</div>
          </div>

          {/* Confidence */}
          <div className="stat-card anim-4" style={{ borderLeft: "3px solid var(--emerald)" }}>
            <div className="stat-card-label">
              <div className="stat-card-icon" style={{ background: "var(--emerald-glow)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>Confidence</span>
            </div>
            <div className="stat-value text-emerald">{(data.risk.confidence * 100).toFixed(0)}%</div>
            <div className="stat-sub">AI model confidence score</div>
            <div className="pbar" style={{ marginTop: 8 }}>
              <div className="pbar-fill" style={{ width: `${data.risk.confidence * 100}%`, background: "linear-gradient(90deg,#10b981,#059669)" }}/>
            </div>
          </div>
        </div>

        {/* Portfolio Exposure + Sector Impact */}
        <div className="card card-p anim-5" style={{ marginBottom: 14 }}>
          <div className="section-hdr">
            <div className="section-hdr-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
            </div>
            <span className="section-title">Portfolio Exposure &amp; Sector Impact</span>
            <span className="section-badge badge badge-rose">High Risk Zone</span>
          </div>

          <div className="donut-section">
            {/* Donut + legend */}
            <div>
              <div className="donut-canvas-wrap">
                <DonutChart sectors={portfolioSectors} />
              </div>
              <div className="donut-legend" style={{ marginTop: 14 }}>
                {portfolioSectors.map((s) => (
                  <div key={s.name} className="legend-row">
                    <div className="legend-dot" style={{ background: s.color }}/>
                    <span className="legend-name">{s.name}</span>
                    <span className="legend-val">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector impact bars */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 14, letterSpacing: "0.02em" }}>
                Sector Impact (Estimated)
              </div>
              <div className="sector-bars">
                {SECTOR_BAR_IMPACTS.map((s) => {
                  const width = (Math.abs(s.impact) / 6) * 100;
                  return (
                    <div key={s.name} className="sector-row">
                      <span className="sector-name">{s.name}</span>
                      <div className="sector-bar-wrap">
                        <div className="sector-bar-fill" style={{ width: `${width}%`, background: s.fill }}/>
                      </div>
                      <span className="sector-impact-val" style={{ color: s.fill }}>{s.impact}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3-col: Scenarios | Strategy | Evidence */}
        <div className="bottom-grid">
          {/* Scenario Analysis */}
          <div className="card card-p anim-6">
            <div className="section-hdr">
              <div className="section-hdr-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <span className="section-title">Scenario Analysis</span>
            </div>

            <div className="scenario-tabs">
              {SCENARIO_TABS.map((t) => (
                <button key={t} className={`scenario-tab ${scenario === t ? "active" : ""}`} onClick={() => setScenario(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div key={scenario} className="tab-fade-in">
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>PORTFOLIO IMPACT</div>
                <div className="scenario-big-num">{sd.impact}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{sd.dollar}</div>
                <div className="pbar" style={{ marginTop: 8 }}>
                  <div className="pbar-fill" style={{ width: `${sd.riskScore}%`, background: "linear-gradient(90deg, #f43f5e, #dc2626)" }}/>
                </div>
              </div>

              <div>
                {[
                  { label: "Risk Score", value: `${sd.riskScore} / 100` },
                  { label: "Affected Assets", value: sd.assets.toString() },
                  { label: "Potential Loss", value: sd.loss },
                ].map(({ label, value }) => (
                  <div key={label} className="scenario-row">
                    <span className="scenario-row-label">{label}</span>
                    <span className="scenario-row-val">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Strategy */}
          <div className="card card-p anim-6">
            <div className="section-hdr">
              <div className="section-hdr-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <span className="section-title">Recommended Strategy</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  🛡 Hedge Energy Exposure
                </span>
                <span className="badge badge-emerald">Recommended</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 14 }}>
              {data.strategy.reason.slice(0, 140)}...
            </p>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase" }}>
              Key Actions:
            </div>
            {data.strategy.actions.slice(0, 4).map((action, i) => (
              <div key={i} className="strategy-action">
                <div className="strategy-check">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span>{action.slice(0, 60)}{action.length > 60 ? "..." : ""}</span>
              </div>
            ))}
          </div>

          {/* Evidence & Sources */}
          <div className="card card-p anim-6">
            <div className="section-hdr">
              <div className="section-hdr-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <span className="section-title">Evidence &amp; Sources</span>
            </div>

            <div className="evidence-tabs">
              {EVIDENCE_TABS.map((t) => (
                <button key={t} className={`evidence-tab ${evidenceTab === t ? "active" : ""}`} onClick={() => setEvidenceTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div key={evidenceTab} className="tab-fade-in">
              {EVIDENCE_ITEMS[evidenceTab].map((item, i) => (
                <div key={i} className="evidence-item">
                  <div className="evidence-thumb">{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="evidence-headline">{item.text}</div>
                    <div className="evidence-meta">{item.time} · {item.source}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="view-trace-btn"
              onClick={() => router.push("/dashboard")}
              style={{ cursor: "pointer" }}
            >
              <span>View All Sources</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* ── Right Panel ── */}
      <aside className="right-panel">
        {/* Event Intelligence */}
        <div style={{ marginBottom: 28 }}>
          <div className="right-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="2">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>
            </svg>
            Event Intelligence
          </div>

          {[
            { label: "Weather Severity", icon: "🌤", value: "91%", color: "var(--rose)" },
            { label: "News Sentiment", icon: "📰", value: "-0.72", color: "var(--rose)" },
            { label: "Historical Events", icon: "🕐", value: data.historical.count.toString(), color: "var(--text-1)" },
            { label: "Market Impact", icon: "📈", value: "-3.8%", sub: "(Energy)", color: "var(--rose)" },
          ].map(({ label, icon, value, sub, color }) => (
            <div key={label} className="right-row">
              <span className="right-row-label">
                <span>{icon}</span>
                {label}
              </span>
              <span className="right-row-val" style={{ color }}>
                {value}
                {sub && <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: 4 }}>{sub}</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="sep"/>

        {/* Agent Execution Trace */}
        <div>
          <div className="right-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            Agent Execution Trace
          </div>

          {agentSteps.map((step, i) => (
            <div key={i} className="agent-trace-item">
              <div className="agent-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="agent-name">{step.agent}</div>
                <div className="agent-meta">
                  Completed · {step.latency_ms ? `${step.latency_ms}ms` : "—"} · {step.sources?.[0] ?? ""}
                </div>
              </div>
            </div>
          ))}

          <button className="view-trace-btn" onClick={() => router.push("/analysis")}>
            <span>View Full Trace</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          {/* Chat shortcut card */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Ask Sentry AI
            </div>
            <button
              onClick={() => router.push("/analysis")}
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(79, 126, 248, 0.08)",
                border: "1px solid rgba(79, 126, 248, 0.28)",
                borderRadius: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => { 
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(79, 126, 248, 0.55)"; 
                (e.currentTarget as HTMLElement).style.background = "rgba(79, 126, 248, 0.14)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => { 
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(79, 126, 248, 0.28)"; 
                (e.currentTarget as HTMLElement).style.background = "rgba(79, 126, 248, 0.08)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #4f7ef8, #818cf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 10px rgba(79, 126, 248, 0.45)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>Open Live Analysis</div>
                <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>Chat with 5 AI agents</div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => router.push("/analysis")}
        style={{
          position: "fixed", bottom: 28, right: 24,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #4f7ef8, #818cf8)",
          border: "1.5px solid rgba(255, 255, 255, 0.2)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(79, 126, 248, 0.5)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 200,
        }}
        title="Open Live Analysis Chat"
        onMouseEnter={(e) => { 
          (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; 
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(79, 126, 248, 0.7)"; 
        }}
        onMouseLeave={(e) => { 
          (e.currentTarget as HTMLElement).style.transform = "scale(1)"; 
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(79, 126, 248, 0.5)"; 
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Donut Chart (pure SVG, no deps) ── */
function DonutChart({ sectors }: { sectors: { name: string; pct: number; color: string }[] }) {
  const size = 180;
  const cx = size / 2, cy = size / 2;
  const R = 72, r = 46;
  let cumAngle = -Math.PI / 2;

  const slices = sectors.map((s) => {
    const angle = (s.pct / 100) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cumAngle), y1 = cy + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + R * Math.cos(cumAngle), y2 = cy + R * Math.sin(cumAngle);
    const ix1 = cx + r * Math.cos(cumAngle - angle), iy1 = cy + r * Math.sin(cumAngle - angle);
    const ix2 = cx + r * Math.cos(cumAngle), iy2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { ...s, d };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} opacity={0.9} strokeWidth={1} stroke="var(--bg-card)"/>
      ))}
      <circle cx={cx} cy={cy} r={r - 2} fill="var(--bg-card)"/>
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-1)" fontFamily="'Plus Jakarta Sans',sans-serif">
        Portfolio
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="var(--text-3)" fontFamily="Inter,sans-serif">
        Exposure
      </text>
    </svg>
  );
}

/* ── Icon Components ── */
function IconDashboard({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconAnalysis({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>;
}
function IconPortfolio({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
}
function IconMarket({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IconNews({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function IconWeather({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>;
}
function IconHistory({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconAgents({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></svg>;
}
function IconReports({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>;
}
