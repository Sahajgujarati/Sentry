import React from "react";
import { TerminalNav } from "@/components/TerminalNav";
import { EventHeader } from "@/components/EventHeader";
import { IntelligenceStrip } from "@/components/IntelligenceStrip";
import { RiskOverview } from "@/components/RiskOverview";
import { ScenarioChart } from "@/components/ScenarioChart";
import { PortfolioExposure } from "@/components/PortfolioExposure";
import { AgentTrace } from "@/components/AgentTrace";
import { EvidencePreview } from "@/components/EvidencePreview";
import { TerminalFooter } from "@/components/TerminalFooter";
import { MOCK_ANALYSIS_DATA } from "@/lib/mock-analysis";

export default function TerminalOverviewPage() {
  const data = MOCK_ANALYSIS_DATA;

  return (
    <div className="min-h-screen bg-background text-terminal-text flex flex-col font-sans selection:bg-terminal-accent/20 selection:text-terminal-accent">
      {/* 1. Technical Top Navigation */}
      <TerminalNav />

      {/* Interactive Run Analysis Telemetry Bar */}
      <div className="w-full bg-[#1A1A1A] border-b border-terminal-border py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-terminal-accent font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-terminal-accentDim border border-terminal-accent/30">
              TERMINAL ACTIVE
            </span>
            <span className="text-terminal-secondary truncate">
              Scenario: Category 4 Hurricane in Gulf of Mexico (Energy Portfolio)
            </span>
          </div>
          <a
            href="/analysis"
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-surface hover:bg-surface-hover border border-terminal-border hover:border-terminal-accent text-terminal-accent text-xs font-mono font-semibold uppercase tracking-wider transition-colors shrink-0"
          >
            <span>[ RUN LIVE ANALYSIS QUERY ]</span>
            <span>›</span>
          </a>
        </div>
      </div>

      <main className="flex-1">
        {/* 2. Event Shock & Status Header */}
        <EventHeader event={data.event} weather={data.weather} />

        {/* 3. Multi-Agent Telemetry Strip */}
        <IntelligenceStrip
          weather={data.weather}
          news={data.news}
          historical={data.historical}
          market={data.market}
        />

        {/* 4. Primary Quantitative Risk & Impact Hero */}
        <RiskOverview risk={data.risk} strategy={data.strategy} />

        {/* 5. Scenario Sensitivity & Drawdown Analysis */}
        <ScenarioChart scenarios={data.scenarios} />

        {/* 6. Portfolio Exposure & Risk Contributions */}
        <PortfolioExposure
          sectors={data.portfolio.sectors}
          topContributors={data.portfolio.top_risk_contributors}
          totalValue={data.portfolio.total_value}
        />

        {/* 7. Multi-Agent Orchestration Trace */}
        <AgentTrace trace={data.agent_trace} />

        {/* 8. Grounded Evidence Attestation */}
        <EvidencePreview evidence={data.evidence} />
      </main>

      {/* 9. Technical Terminal Footer */}
      <TerminalFooter />
    </div>
  );
}
