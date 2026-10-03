"use client";

import React, { useState } from "react";
import { RiskAnalysis, RecommendedStrategy } from "@/types/analysis";
import { WhyRiskPanel } from "./WhyRiskPanel";

interface RiskOverviewProps {
  risk: RiskAnalysis;
  strategy: RecommendedStrategy;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({ risk, strategy }) => {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <>
      <section className="border-b border-terminal-border bg-background">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row items-stretch gap-px bg-terminal-border border border-terminal-border">
            {/* Primary Dominant Risk Score Display */}
            <div className="bg-[#1D1D1D] p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-muted">
                    PRIMARY RISK ASSESSMENT
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setWhyOpen(true)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-mono tracking-wider uppercase text-terminal-accent bg-terminal-accentDim border border-terminal-accent/40 hover:bg-terminal-accent/20 transition-all cursor-pointer"
                      title="Open mathematical audit attribution"
                    >
                      [ WHY? ]
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tighter text-terminal-text">
                      {risk.risk_score.toFixed(1)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono text-terminal-muted">
                      / 100
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-terminal-negativeDim text-terminal-negative text-sm sm:text-base font-mono font-bold uppercase border border-terminal-negative/40">
                      {risk.risk_level} RISK
                    </span>
                    <span className="text-xs font-mono text-terminal-secondary">
                      CONFIDENCE: {(risk.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-metrics breakdown strip */}
              <div className="mt-8 pt-6 border-t border-terminal-border grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="terminal-label text-[10px]">EST. PORTFOLIO IMPACT</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-terminal-negative mt-1">
                    {(risk.portfolio_impact * 100).toFixed(2)}%
                  </div>
                  <div className="text-[11px] font-mono text-terminal-muted mt-0.5">
                    Projected return drag
                  </div>
                </div>

                <div>
                  <div className="terminal-label text-[10px]">EST. DOLLAR LOSS</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-terminal-negative mt-1">
                    -${Math.abs(risk.estimated_dollar_loss / 1000).toFixed(1)}K
                  </div>
                  <div className="text-[11px] font-mono text-terminal-muted mt-0.5">
                    On $980K portfolio
                  </div>
                </div>

                <div>
                  <div className="terminal-label text-[10px]">ENERGY EXPOSURE</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-terminal-text mt-1">
                    {(risk.energy_exposure_pct * 100).toFixed(0)}%
                  </div>
                  <div className="text-[11px] font-mono text-terminal-muted mt-0.5">
                    $480.2K active allocation
                  </div>
                </div>

                <div>
                  <div className="terminal-label text-[10px]">TARGET MITIGATION</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-terminal-accent mt-1">
                    {strategy.type}
                  </div>
                  <div className="text-[11px] font-mono text-terminal-muted mt-0.5">
                    {strategy.recommended_allocation_pct}% notional hedge
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Strategy Synthesis Sidebar */}
            <div className="bg-[#171717] p-6 sm:p-8 lg:w-96 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-terminal-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="terminal-label text-[10px]">SYNTHESIZED STRATEGY</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-terminal-warningDim text-terminal-warning border border-terminal-warning/30">
                    {strategy.urgency} PRIORITY
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-mono uppercase text-terminal-text">
                    {strategy.title}
                  </h3>
                  <p className="text-xs text-terminal-secondary leading-relaxed">
                    {strategy.reason}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="terminal-label text-[10px]">ACTIONABLE EXECUTION NODES</div>
                  <ul className="space-y-2">
                    {strategy.hedging_vehicles.map((v, i) => (
                      <li
                        key={i}
                        className="text-xs font-mono text-terminal-secondary bg-surface p-2.5 border border-terminal-border flex items-start space-x-2"
                      >
                        <span className="text-terminal-accent font-bold">›</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-terminal-border/60 flex items-center justify-between text-[11px] font-mono text-terminal-muted">
                <span>ORCHESTRATOR STATUS: OK</span>
                <span className="text-terminal-accent">READY FOR DISPATCH</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Drawer Component */}
      <WhyRiskPanel
        risk={risk}
        isOpen={whyOpen}
        onClose={() => setWhyOpen(false)}
      />
    </>
  );
};
