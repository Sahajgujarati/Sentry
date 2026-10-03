import React from "react";

export const TerminalFooter: React.FC = () => {
  return (
    <footer className="border-t border-terminal-border bg-[#141414] py-8 text-xs font-mono text-terminal-muted">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-terminal-text tracking-widest">SENTRY</span>
            <span className="text-terminal-border">|</span>
            <span>INSTITUTIONAL QUANTITATIVE RISK & MULTI-AGENT SYNTHESIS</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>ENGINE: SENTRY-QUANT-V2.4</span>
            <span>BUILD: 2026.10-ALPHA</span>
            <span className="text-terminal-accent">SECURE SANDBOX</span>
          </div>
        </div>

        <div className="p-3 bg-[#171717] border border-terminal-border text-[11px] leading-relaxed text-terminal-muted">
          <strong className="text-terminal-secondary">REGULATORY & PROTOTYPE NOTICE:</strong> Sentry is an institutional scenario simulator developed for demonstration. Portfolio impact projections and quantitative risk scores are heuristic mathematical forecasts derived from multi-source real-time intelligence feeds and historical analogs, not guaranteed financial returns or investment advice.
        </div>
      </div>
    </footer>
  );
};
