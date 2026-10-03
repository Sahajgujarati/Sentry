"use client";

import React from "react";
import { ExecutionStep } from "@/types/analysis";

interface ExecutionProgressProps {
  query: string;
  steps: ExecutionStep[];
  currentStepIndex: number;
  isComplete: boolean;
}

export const ExecutionProgress: React.FC<ExecutionProgressProps> = ({
  query,
  steps,
  currentStepIndex,
  isComplete,
}) => {
  return (
    <div className="w-full bg-[#1D1D1D] border border-terminal-border p-6 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-terminal-border gap-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              {!isComplete && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-accent opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isComplete ? "bg-terminal-accent" : "bg-terminal-warning"
                }`}
              />
            </span>
            <span className="text-[10px] font-mono tracking-wideTerminal text-terminal-accent uppercase">
              {isComplete ? "ANALYSIS COMPLETE" : "ANALYZING EVENT..."}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-terminal-text uppercase tracking-tight">
            {isComplete ? "Quantitative Synthesis Generated" : "Multi-Agent Pipeline Execution"}
          </h2>
        </div>

        <div className="text-xs font-mono text-terminal-secondary">
          <span>PIPELINE TELEMETRY: </span>
          <span className="text-terminal-accent font-bold">
            {isComplete
              ? "ALL 9 NODES COMPLETE"
              : `PROCESSING NODE 0${Math.min(currentStepIndex + 1, steps.length)} OF 0${steps.length}`}
          </span>
        </div>
      </div>

      {/* Ingested Query Display */}
      <div className="p-4 bg-[#171717] border border-terminal-border flex items-start space-x-3">
        <span className="text-terminal-accent font-mono font-bold select-none">&gt;</span>
        <div className="space-y-1">
          <div className="terminal-label text-[10px]">INGESTED QUERY INSTRUCTION:</div>
          <div className="text-sm font-mono text-terminal-text italic">
            &ldquo;{query}&rdquo;
          </div>
        </div>
      </div>

      {/* Progressive Step List */}
      <div className="border border-terminal-border divide-y divide-terminal-border bg-[#171717]">
        {steps.map((step, idx) => {
          const isDone = step.status === "completed" || idx < currentStepIndex;
          const isCurrent = step.status === "running" || idx === currentStepIndex;
          const isPending = !isDone && !isCurrent;

          return (
            <div
              key={step.id}
              className={`p-3.5 flex items-center justify-between text-xs font-mono transition-colors ${
                isCurrent
                  ? "bg-surface text-terminal-text border-l-2 border-terminal-accent"
                  : isDone
                  ? "bg-transparent text-terminal-text"
                  : "bg-transparent text-terminal-muted opacity-40"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-5 text-center font-bold">
                  {isDone ? (
                    <span className="text-terminal-accent">✓</span>
                  ) : isCurrent ? (
                    <span className="text-terminal-warning animate-pulse">›</span>
                  ) : (
                    <span className="text-terminal-muted">○</span>
                  )}
                </span>
                <span
                  className={
                    isDone
                      ? "text-terminal-text font-semibold"
                      : isCurrent
                      ? "text-terminal-accent font-bold"
                      : "text-terminal-muted"
                  }
                >
                  {step.label}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span className="text-terminal-muted hidden sm:inline">{step.agent}</span>
                <span className="w-16 text-right text-terminal-secondary">
                  {isDone
                    ? `${step.duration_ms}ms`
                    : isCurrent
                    ? "RUNNING"
                    : "QUEUED"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-terminal-muted gap-2">
        <span>NOTE: SIMULATED MULTI-AGENT EXECUTION LATENCIES (DEMO PIPELINE)</span>
        {isComplete ? (
          <span className="text-terminal-accent font-bold animate-pulse">
            [ LOADING OVERVIEW TERMINAL REPORT... ]
          </span>
        ) : (
          <span className="text-terminal-secondary">
            EST. REMAINING: ~{Math.max(0, (steps.length - currentStepIndex - 1) * 300)}ms
          </span>
        )}
      </div>
    </div>
  );
};
