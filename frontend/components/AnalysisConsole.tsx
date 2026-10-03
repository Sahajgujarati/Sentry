"use client";

import React, { useState } from "react";

interface AnalysisConsoleProps {
  initialQuery?: string;
  onRunAnalysis: (query: string) => void;
  isLoading?: boolean;
}

export const SUGGESTED_QUERIES = [
  "Hurricane impact on energy portfolio",
  "Oil supply shock analysis",
  "Interest-rate shock on technology",
  "Energy sector stress test",
];

export const AnalysisConsole: React.FC<AnalysisConsoleProps> = ({
  initialQuery = "How will a Category 4 hurricane in the Gulf of Mexico affect my energy holdings?",
  onRunAnalysis,
  isLoading = false,
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onRunAnalysis(query.trim());
    }
  };

  const handleSelectSuggested = (suggested: string) => {
    setQuery(suggested);
    if (!isLoading) {
      onRunAnalysis(suggested);
    }
  };

  return (
    <div className="w-full bg-[#1D1D1D] border border-terminal-border p-6 sm:p-8 space-y-6">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-wideTerminal text-terminal-accent uppercase">
            LIVE FINANCIAL ANALYSIS CONSOLE // INTERACTIVE
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-terminal-text uppercase tracking-tight">
            Terminal Query Input
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono text-terminal-secondary">
          <span className="text-terminal-muted">TARGET PORTFOLIO:</span>
          <span className="text-terminal-text font-bold">$980K (ENERGY 49% / TECH 51%)</span>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="query-input"
            className="terminal-label text-[11px] block font-mono text-terminal-secondary"
          >
            ENTER FINANCIAL EVENT OR MACROECONOMIC SHOCK QUERY
          </label>
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-[#171717] border border-terminal-border p-2 focus-within:border-terminal-accent transition-colors">
            <span className="hidden sm:inline-flex items-center pl-3 text-terminal-accent font-mono font-bold select-none">
              &gt;
            </span>
            <input
              id="query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. How will a Category 4 hurricane affect my energy holdings?"
              className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base font-mono text-terminal-text placeholder-terminal-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 bg-terminal-accent text-[#171717] font-mono font-bold text-xs uppercase tracking-wider hover:bg-terminal-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>{isLoading ? "ANALYZING..." : "[ RUN ANALYSIS ]"}</span>
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="space-y-2.5 pt-2">
          <div className="terminal-label text-[10px] text-terminal-muted">
            SUGGESTED FINANCIAL ANALYSIS SCENARIOS:
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggested(sq)}
                disabled={isLoading}
                className="text-left text-xs font-mono text-terminal-secondary hover:text-terminal-text bg-[#171717] hover:bg-surface-hover border border-terminal-border px-3 py-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span className="text-terminal-accent font-semibold mr-1.5">›</span>
                {sq}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Audit & Grounding Notice */}
      <div className="pt-4 border-t border-terminal-border/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-terminal-muted gap-2">
        <span>ORCHESTRATOR INTERACTION: DIRECT MULTI-AGENT INGESTION PIPELINE</span>
        <span className="text-terminal-secondary">MODE: DEMO SIMULATION ENGINE</span>
      </div>
    </div>
  );
};
