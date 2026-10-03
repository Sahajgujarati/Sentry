"use client";

import React from "react";

interface QueryStatusBarProps {
  query: string;
  onNewQuery: () => void;
  onSwitchScenario?: (query: string) => void;
  scenarioName?: string;
}

export const QueryStatusBar: React.FC<QueryStatusBarProps> = ({
  query,
  onNewQuery,
  onSwitchScenario,
  scenarioName,
}) => {
  return (
    <div className="w-full bg-[#1A1A1A] border-b border-terminal-border py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active Query Label */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-terminal-accentDim text-terminal-accent border border-terminal-accent/30 shrink-0">
            ACTIVE ANALYSIS
          </span>
          <div className="flex items-center space-x-2 truncate text-xs font-mono">
            <span className="text-terminal-muted hidden sm:inline">QUERY:</span>
            <span className="text-terminal-text font-semibold truncate">
              &ldquo;{query}&rdquo;
            </span>
          </div>
        </div>

        {/* Right: Actions & Switchers */}
        <div className="flex items-center space-x-3 shrink-0">
          {scenarioName && (
            <span className="hidden lg:inline text-[10px] font-mono text-terminal-muted uppercase">
              DATASET: {scenarioName}
            </span>
          )}

          <button
            onClick={onNewQuery}
            className="px-3 py-1 bg-surface hover:bg-surface-hover border border-terminal-border hover:border-terminal-accent text-terminal-accent text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            [ RUN NEW ANALYSIS ]
          </button>
        </div>
      </div>
    </div>
  );
};
