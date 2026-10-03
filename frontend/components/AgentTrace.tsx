import React from "react";
import { AgentTraceStep } from "@/types/analysis";

interface AgentTraceProps {
  trace: AgentTraceStep[];
}

export const AgentTrace: React.FC<AgentTraceProps> = ({ trace }) => {
  return (
    <section id="agents" className="border-b border-terminal-border bg-surface/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-terminal-border gap-2">
          <div>
            <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-muted">
              MULTI-AGENT ORCHESTRATION PIPELINE
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-terminal-text uppercase font-mono mt-0.5">
              Agent Execution Trace
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-terminal-secondary px-2 py-0.5 border border-terminal-border bg-surface uppercase">
              STATUS: DETERMINISTIC SIMULATION
            </span>
            <span className="text-xs font-mono text-terminal-accent">
              TOTAL PIPELINE LATENCY: 2.68s
            </span>
          </div>
        </div>

        {/* Technical Flow Layout */}
        <div className="pt-6">
          <div className="relative">
            {/* Grid of pipeline execution nodes: 7-stage pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-px bg-terminal-border border border-terminal-border">
              {trace.map((step, idx) => (
                <div
                  key={step.id}
                  className="bg-[#1D1D1D] p-3.5 sm:p-4 flex flex-col justify-between hover:bg-surface-hover transition-colors space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-terminal-muted">
                        0{idx + 1}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.2 text-[8px] font-mono font-semibold uppercase bg-terminal-accentDim text-terminal-accent border border-terminal-accent/30">
                        {step.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold font-mono text-terminal-text uppercase pt-0.5 truncate">
                      {step.agent_name}
                    </div>
                    <div className="text-[10px] font-mono text-terminal-secondary truncate">
                      {step.role}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-terminal-border/60">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="terminal-label text-[9px] truncate">{step.metric_label}:</span>
                      <span className="text-[11px] font-mono font-bold text-terminal-text truncate text-right">
                        {step.metric_value}
                      </span>
                    </div>

                    <div className="text-[11px] text-terminal-muted leading-tight line-clamp-2">
                      {step.summary}
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-terminal-muted pt-1">
                      <span>{step.latency_ms}ms</span>
                      <span className="truncate">{step.timestamp.split(".")[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#171717] border border-terminal-border flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-terminal-muted gap-2">
            <span>PIPELINE FLOW: USER QUERY → SUPERVISOR → [WEATHER ‖ NEWS ‖ HISTORICAL] → RISK ENGINE → STRATEGY</span>
            <span className="text-terminal-secondary">LANGGRAPH STATEFUL DIRECTED ACYCLIC GRAPH</span>
          </div>
        </div>
      </div>
    </section>
  );
};
