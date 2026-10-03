"use client";

import React from "react";
import { RiskAnalysis } from "@/types/analysis";

interface WhyRiskPanelProps {
  risk: RiskAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyRiskPanel: React.FC<WhyRiskPanelProps> = ({
  risk,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-none animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} aria-label="Close panel" />

      {/* Slide-out Terminal Disclosure Panel */}
      <div className="w-full max-w-xl bg-[#1D1D1D] border-l border-terminal-border h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-terminal-border flex items-center justify-between bg-[#171717]">
          <div>
            <div className="text-[10px] font-mono tracking-wideTerminal text-terminal-accent uppercase">
              MODEL AUDIT TRAIL // QUANT-V2.4
            </div>
            <h2 className="text-xl font-bold tracking-tight text-terminal-text uppercase mt-0.5">
              Risk Score Attribution Matrix
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono text-terminal-secondary hover:text-terminal-text border border-terminal-border hover:bg-surface-hover transition-colors"
          >
            [ ESC / CLOSE ]
          </button>
        </div>

        {/* Primary Score Summary */}
        <div className="p-6 border-b border-terminal-border bg-surface/50 grid grid-cols-3 gap-4">
          <div>
            <div className="terminal-label text-[10px]">COMPOSITE SCORE</div>
            <div className="text-2xl font-bold font-mono text-terminal-negative">
              {risk.risk_score.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="terminal-label text-[10px]">RISK CLASSIFICATION</div>
            <div className="text-sm font-mono font-semibold text-terminal-text mt-1">
              {risk.risk_level}
            </div>
          </div>
          <div>
            <div className="terminal-label text-[10px]">CONFIDENCE LEVEL</div>
            <div className="text-sm font-mono text-terminal-accent mt-1">
              {(risk.confidence * 100).toFixed(0)}% (1.00)
            </div>
          </div>
        </div>

        {/* Detailed Audit Factors */}
        <div className="p-6 space-y-6 flex-1">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-terminal-secondary uppercase mb-3">
              PRIMARY FACTOR CONTRIBUTIONS
            </div>
            <div className="border border-terminal-border divide-y divide-terminal-border bg-[#171717]">
              {risk.audit_factors.map((item, idx) => (
                <div key={idx} className="p-4 space-y-1.5 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-terminal-text">
                      {item.factor}
                    </span>
                    <span className="text-xs font-mono font-bold text-terminal-negative">
                      {item.weight}
                    </span>
                  </div>
                  <div className="text-[11px] text-terminal-secondary font-mono">
                    Observed Metric: <span className="text-terminal-text">{item.value}</span>
                  </div>
                  <p className="text-xs text-terminal-muted leading-relaxed pt-1">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Model Formulation Formula */}
          <div className="p-4 border border-terminal-border bg-[#171717] space-y-2">
            <div className="terminal-label text-[10px]">METHODOLOGY & AUDIT NOTE</div>
            <div className="text-xs font-mono text-terminal-secondary leading-relaxed">
              Risk Score = ∑(SectorExposure × EventSeverity × HistoricalDrawdownMultiplier)
              + NewsSentimentAdjustment + RealtimeLiquiditySpread.
            </div>
            <p className="text-[11px] text-terminal-muted leading-relaxed">
              Calculated deterministically using Sentry Quantitative Risk Engine v2.4. All factor metrics are grounded in verifiable multi-source feeds with cross-validation against 7 historical Category 4+ analogs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-terminal-border bg-[#171717] flex justify-between items-center text-[10px] font-mono text-terminal-muted">
          <span>AUDIT HASH: 0x8f2d...41a9</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-surface border border-terminal-border text-terminal-text hover:text-terminal-accent text-xs font-mono uppercase"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
