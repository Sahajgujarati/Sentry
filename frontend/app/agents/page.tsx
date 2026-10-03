"use client";

import React, { useState } from "react";
import { TerminalNav } from "@/components/TerminalNav";
import { TerminalFooter } from "@/components/TerminalFooter";
import { AgentTrace } from "@/components/AgentTrace";
import { MOCK_ANALYSIS_DATA } from "@/lib/mock-analysis";
import { AgentTraceStep } from "@/types/analysis";

export default function AgentsPage() {
  const data = MOCK_ANALYSIS_DATA;
  const [selectedAgent, setSelectedAgent] = useState<AgentTraceStep | null>(null);

  return (
    <div className="min-h-screen bg-background text-terminal-text flex flex-col font-sans selection:bg-terminal-accent/20 selection:text-terminal-accent">
      {/* 1. Terminal Top Navigation */}
      <TerminalNav />

      {/* 2. Interactive Telemetry Banner */}
      <div className="w-full bg-[#1A1A1A] border-b border-terminal-border py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-terminal-accent font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-terminal-accentDim border border-terminal-accent/30">
              LANGGRAPH AGENT TELEMETRY
            </span>
            <span className="text-terminal-secondary truncate">
              7 Autonomous Nodes · Stateful Directed Acyclic Graph (DAG) · Multi-Agent Orchestration
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-terminal-muted uppercase text-[10px]">PIPELINE LATENCY:</span>
            <span className="text-terminal-accent font-bold">2,687 MS</span>
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
            PERSON 1 AI ORCHESTRATION // SYSTEM ARCHITECTURE
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-mono uppercase tracking-tight text-terminal-text">
            Multi-Agent Execution & State Graph
          </h1>
          <p className="text-xs sm:text-sm font-mono text-terminal-secondary max-w-4xl">
            Real-time execution sequence, sub-graph dispatching, state updates, and latency metrics across the 7 autonomous Sentry intelligence agents. Click any agent node to inspect audit summaries.
          </p>
        </div>

        {/* Pipeline Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-terminal-border border border-terminal-border">
          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">REGISTERED AGENT NODES</div>
            <div className="text-3xl font-black font-mono text-terminal-accent">
              7 NODES
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              LangGraph State Graph Topology
            </div>
          </div>

          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">TOTAL PIPELINE LATENCY</div>
            <div className="text-3xl font-black font-mono text-terminal-text">
              2.68 SECONDS
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              Parallel Subgraph Execution
            </div>
          </div>

          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">PARALLEL SUBGRAPHS</div>
            <div className="text-3xl font-black font-mono text-terminal-accent">
              3 WORKERS
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              Weather, News, Market Subgraphs
            </div>
          </div>

          <div className="bg-[#1D1D1D] p-5 space-y-2">
            <div className="terminal-label text-[10px]">ORCHESTRATION STATUS</div>
            <div className="text-3xl font-black font-mono text-terminal-accent">
              NOMINAL
            </div>
            <div className="text-xs font-mono text-terminal-secondary">
              Zero Execution Errors / Clean Synthesis
            </div>
          </div>
        </div>

        {/* Reusable AgentTrace Component */}
        <AgentTrace trace={data.agent_trace} />

        {/* Detailed Agent Node Architecture Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <h2 className="text-lg font-bold font-mono text-terminal-text uppercase">
              Autonomous Agent Node Audit Specifications
            </h2>
            <span className="text-xs font-mono text-terminal-muted">CLICK NODE TO INSPECT AUDIT DETAIL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.agent_trace.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-5 bg-[#171717] border border-terminal-border space-y-4 hover:border-terminal-accent cursor-pointer transition-all ${
                  selectedAgent?.id === agent.id ? "border-terminal-accent bg-surface" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-terminal-muted">{agent.id}</span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-semibold uppercase bg-terminal-accentDim text-terminal-accent border border-terminal-accent/30">
                    {agent.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-bold font-mono text-terminal-text uppercase">{agent.agent_name}</div>
                  <div className="text-xs font-mono text-terminal-secondary">{agent.role}</div>
                </div>

                <div className="space-y-2 pt-3 border-t border-terminal-border/60">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-terminal-muted">{agent.metric_label}:</span>
                    <span className="text-terminal-accent font-bold">{agent.metric_value}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-terminal-muted">
                    <span>Latency: {agent.latency_ms}ms</span>
                    <span>Timestamp: {agent.timestamp}</span>
                  </div>
                  <p className="text-xs font-mono text-terminal-secondary leading-relaxed pt-2 border-t border-terminal-border/40">
                    {agent.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Agent Detail Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fadeIn">
            <div className="bg-[#171717] border border-terminal-accent p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-terminal-border">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-terminal-accent font-bold uppercase">
                    {selectedAgent.agent_name}
                  </span>
                  <span className="text-xs font-mono text-terminal-muted">
                    ID: {selectedAgent.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-xs font-mono text-terminal-secondary hover:text-terminal-accent px-2 py-1 bg-surface border border-terminal-border cursor-pointer"
                >
                  [ CLOSE X ]
                </button>
              </div>

              <div className="space-y-3">
                <div className="terminal-label text-[10px]">AGENT ROLE & RESPONSIBILITY</div>
                <div className="text-base font-bold font-mono text-terminal-text">{selectedAgent.role}</div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-terminal-border border border-terminal-border">
                <div className="bg-[#1D1D1D] p-4 space-y-1">
                  <div className="terminal-label text-[9px]">{selectedAgent.metric_label}</div>
                  <div className="text-base font-bold font-mono text-terminal-accent">{selectedAgent.metric_value}</div>
                </div>
                <div className="bg-[#1D1D1D] p-4 space-y-1">
                  <div className="terminal-label text-[9px]">EXECUTION LATENCY</div>
                  <div className="text-base font-bold font-mono text-terminal-text">{selectedAgent.latency_ms}ms</div>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-[#1D1D1D] border border-terminal-border">
                <div className="terminal-label text-[10px] text-terminal-secondary">NODE AUDIT SUMMARY</div>
                <p className="text-xs font-mono text-terminal-text leading-relaxed">{selectedAgent.summary}</p>
              </div>

              <div className="pt-4 border-t border-terminal-border flex justify-end">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 bg-terminal-accent text-[#171717] font-mono font-bold text-xs uppercase cursor-pointer"
                >
                  [ DONE ]
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Terminal Footer */}
      <TerminalFooter />
    </div>
  );
}
