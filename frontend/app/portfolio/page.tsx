"use client";

import React, { useState } from "react";
import { TerminalNav } from "@/components/TerminalNav";
import { TerminalFooter } from "@/components/TerminalFooter";
import { PortfolioExposure } from "@/components/PortfolioExposure";
import { ScenarioChart } from "@/components/ScenarioChart";
import { MOCK_ANALYSIS_DATA, formatNumber } from "@/lib/mock-analysis";

export default function PortfolioPage() {
  const data = MOCK_ANALYSIS_DATA;
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const allAssets = [
    ...data.portfolio.top_risk_contributors,
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      weight_pct: 28.0,
      current_value: 274400,
      current_price: 224.5,
      estimated_impact_pct: 0.0,
      estimated_dollar_impact: 0,
      risk_contribution_pct: 0.0,
      risk_tier: "LOW" as const,
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp.",
      sector: "Technology",
      weight_pct: 23.0,
      current_value: 225400,
      current_price: 428.1,
      estimated_impact_pct: 0.0,
      estimated_dollar_impact: 0,
      risk_contribution_pct: 0.0,
      risk_tier: "LOW" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-terminal-text flex flex-col font-sans selection:bg-terminal-accent/20 selection:text-terminal-accent">
      {/* 1. Terminal Navigation */}
      <TerminalNav />

      {/* 2. Telemetry Banner */}
      <div className="w-full bg-[#1A1A1A] border-b border-terminal-border py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-terminal-accent font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-terminal-accentDim border border-terminal-accent/30">
              QUANTITATIVE RISK ENGINE
            </span>
            <span className="text-terminal-secondary truncate">
              Portfolio Valuation · Sector Exposure · Asset Attribution Matrix
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-terminal-muted uppercase text-[10px]">ENGINE STATUS:</span>
            <span className="text-terminal-accent font-bold">P3 QUANT ENGINE NOMINAL</span>
            <span className="px-2 py-0.5 bg-surface border border-terminal-border text-[10px] text-terminal-accent uppercase font-mono ml-2">
              DEMO MODE
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
        {/* Title Header */}
        <div className="space-y-2 pb-6 border-b border-terminal-border">
          <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-accent">
            PERSON 3 QUANTITATIVE RISK ENGINE // AUDIT MATRIX
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-mono uppercase tracking-tight text-terminal-text">
            Portfolio Exposure & Quantitative Valuation
          </h1>
          <p className="text-xs sm:text-sm font-mono text-terminal-secondary max-w-4xl">
            Asset allocation breakdown, sector-level vulnerability metrics, and asset-level drawdown contribution calculations derived from multi-agent event intelligence.
          </p>
        </div>

        {/* Quant KPI Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-terminal-border border border-terminal-border">
          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">TOTAL PORTFOLIO NOTIONAL</div>
            <div className="text-3xl font-black font-mono text-terminal-text">
              $980,000 USD
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              100.0% Capital Allocated Across 5 Assets
            </div>
          </div>

          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">QUANTITATIVE RISK SCORE</div>
            <div className="text-3xl font-black font-mono text-terminal-negative">
              {data.risk.risk_score} <span className="text-sm text-terminal-muted">/ 100</span>
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              Risk Tier: <span className="text-terminal-negative font-bold uppercase">{data.risk.risk_level}</span>
            </div>
          </div>

          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">PROJECTED PORTFOLIO DRAWDOWN</div>
            <div className="text-3xl font-black font-mono text-terminal-negative">
              {(data.risk.portfolio_impact * 100).toFixed(2)}%
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              Estimated Drag: <span className="text-terminal-negative font-bold">${formatNumber(Math.abs(data.risk.estimated_dollar_loss))} USD</span>
            </div>
          </div>

          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">AFFECTED SECTOR CONCENTRATION</div>
            <div className="text-3xl font-black font-mono text-terminal-warning">
              49.0%
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              Energy Allocation ($480,200 USD)
            </div>
          </div>
        </div>

        {/* Reusable Portfolio Component */}
        <PortfolioExposure
          sectors={data.portfolio.sectors}
          topContributors={data.portfolio.top_risk_contributors}
          totalValue={data.portfolio.total_value}
        />

        {/* Detailed Full Asset Attribution Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <h2 className="text-lg font-bold font-mono text-terminal-text uppercase">
              Full Asset-Level Risk Attribution Matrix
            </h2>
            <span className="text-xs font-mono text-terminal-muted">5 HOLDINGS REGISTERED</span>
          </div>

          <div className="border border-terminal-border overflow-x-auto bg-[#171717]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#1D1D1D] border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                <tr>
                  <th className="p-3">TICKER & HOLDING NAME</th>
                  <th className="p-3">SECTOR</th>
                  <th className="p-3 text-right">CURRENT PRICE</th>
                  <th className="p-3 text-right">WEIGHT %</th>
                  <th className="p-3 text-right">POSITION VALUE</th>
                  <th className="p-3 text-right">EST. DRAWDOWN %</th>
                  <th className="p-3 text-right">EST. DOLLAR DRAG</th>
                  <th className="p-3 text-right">RISK CONTRIBUTION</th>
                  <th className="p-3 text-center">RISK TIER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border">
                {allAssets.map((asset) => (
                  <tr
                    key={asset.ticker}
                    onClick={() => setSelectedAsset(asset.ticker)}
                    className={`hover:bg-surface-hover cursor-pointer transition-colors ${
                      selectedAsset === asset.ticker ? "bg-surface" : ""
                    }`}
                  >
                    <td className="p-3 font-bold text-terminal-text">
                      <div className="flex items-center space-x-2">
                        <span className="text-terminal-accent font-black">{asset.ticker}</span>
                        <span className="text-terminal-muted text-[11px] hidden sm:inline">{asset.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-terminal-secondary">{asset.sector}</td>
                    <td className="p-3 text-right text-terminal-text">${asset.current_price.toFixed(2)}</td>
                    <td className="p-3 text-right text-terminal-text">{asset.weight_pct.toFixed(1)}%</td>
                    <td className="p-3 text-right text-terminal-text">${formatNumber(asset.current_value)}</td>
                    <td className={`p-3 text-right font-bold ${asset.estimated_impact_pct < 0 ? "text-terminal-negative" : "text-terminal-muted"}`}>
                      {asset.estimated_impact_pct < 0 ? `${(asset.estimated_impact_pct * 100).toFixed(2)}%` : "0.00%"}
                    </td>
                    <td className={`p-3 text-right font-bold ${asset.estimated_dollar_impact < 0 ? "text-terminal-negative" : "text-terminal-muted"}`}>
                      {asset.estimated_dollar_impact < 0 ? `-$${formatNumber(Math.abs(asset.estimated_dollar_impact))}` : "$0"}
                    </td>
                    <td className="p-3 text-right text-terminal-text">{asset.risk_contribution_pct.toFixed(1)}%</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                          asset.risk_tier === "HIGH"
                            ? "bg-terminal-negativeDim text-terminal-negative border-terminal-negative/30"
                            : "bg-surface text-terminal-muted border-terminal-border"
                        }`}
                      >
                        {asset.risk_tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quant Risk Drivers Breakdown */}
        <section className="space-y-4">
          <div className="pb-3 border-b border-terminal-border">
            <h2 className="text-lg font-bold font-mono text-terminal-text uppercase">
              Quantitative Risk Driver Audit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.risk.audit_factors.map((factor, idx) => (
              <div key={idx} className="p-4 bg-[#171717] border border-terminal-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-terminal-text uppercase">{factor.factor}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                    factor.direction === "NEGATIVE" ? "bg-terminal-negativeDim text-terminal-negative" : "bg-terminal-accentDim text-terminal-accent"
                  }`}>
                    {factor.direction} ({factor.weight})
                  </span>
                </div>
                <div className="text-xs font-mono text-terminal-secondary">{factor.value}</div>
                <p className="text-xs font-mono text-terminal-muted pt-1 border-t border-terminal-border/60">
                  {factor.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Scenario Analysis */}
        <ScenarioChart scenarios={data.scenarios} />
      </main>

      {/* Terminal Footer */}
      <TerminalFooter />
    </div>
  );
}
