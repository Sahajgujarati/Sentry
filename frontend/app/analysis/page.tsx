"use client";

import React, { useState } from "react";
import { TerminalNav } from "@/components/TerminalNav";
import { EventHeader } from "@/components/EventHeader";
import { IntelligenceStrip } from "@/components/IntelligenceStrip";
import { RiskOverview } from "@/components/RiskOverview";
import { ScenarioChart } from "@/components/ScenarioChart";
import { PortfolioExposure } from "@/components/PortfolioExposure";
import { AgentTrace } from "@/components/AgentTrace";
import { EvidencePreview } from "@/components/EvidencePreview";
import { TerminalFooter } from "@/components/TerminalFooter";
import { AnalysisConsole } from "@/components/AnalysisConsole";
import { ExecutionProgress } from "@/components/ExecutionProgress";
import { QueryStatusBar } from "@/components/QueryStatusBar";
import {
  AnalysisState,
  ExecutionStep,
  TerminalAnalysisData,
} from "@/types/analysis";
import { analyzeQuery, DEFAULT_EXECUTION_STEPS } from "@/lib/api";
import { MOCK_ANALYSIS_DATA } from "@/lib/mock-analysis";

export default function LiveAnalysisPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [activeQuery, setActiveQuery] = useState(
    "How will a Category 4 hurricane in the Gulf of Mexico affect my energy holdings?"
  );
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(
    DEFAULT_EXECUTION_STEPS.map((s) => ({ ...s }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] =
    useState<TerminalAnalysisData>(MOCK_ANALYSIS_DATA);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunAnalysis = async (queryText: string) => {
    setActiveQuery(queryText);
    setAnalysisState("analyzing");
    setErrorMessage(null);
    setCurrentStepIndex(0);

    // Reset steps to pending
    const initialSteps = DEFAULT_EXECUTION_STEPS.map((s) => ({
      ...s,
      status: "pending" as const,
    }));
    setExecutionSteps(initialSteps);

    try {
      const response = await analyzeQuery(queryText, (stepIdx, updatedStep) => {
        setCurrentStepIndex(stepIdx);
        setExecutionSteps((prev) => {
          const next = [...prev];
          next[stepIdx] = updatedStep;
          return next;
        });
      });

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        // Brief pause on "ANALYSIS COMPLETE" before showing dashboard
        await new Promise((res) => setTimeout(res, 600));
        setAnalysisState("complete");
      } else {
        setErrorMessage(response.error || "Analysis pipeline execution failed.");
        setAnalysisState("error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pipeline execution exception";
      setErrorMessage(msg);
      setAnalysisState("error");
    }
  };

  const handleReset = () => {
    setAnalysisState("idle");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background text-terminal-text flex flex-col font-sans selection:bg-terminal-accent/20 selection:text-terminal-accent">
      {/* 1. Terminal Top Navigation */}
      <TerminalNav />

      {/* 2. Interactive Analysis State View */}
      <main className="flex-1">
        {analysisState === "idle" && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
            {/* Live Query Console */}
            <AnalysisConsole
              initialQuery={activeQuery}
              onRunAnalysis={handleRunAnalysis}
              isLoading={false}
            />

            {/* Context Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-terminal-border border border-terminal-border">
              <div className="bg-[#1D1D1D] p-5 space-y-2">
                <div className="terminal-label text-[10px]">CURRENT PORTFOLIO VALUE</div>
                <div className="text-2xl font-bold font-mono text-terminal-text">
                  $980,000 USD
                </div>
                <div className="text-xs font-mono text-terminal-secondary">
                  Energy 49.0% ($480.2K) · Tech 51.0% ($499.8K)
                </div>
              </div>

              <div className="bg-[#1D1D1D] p-5 space-y-2">
                <div className="terminal-label text-[10px]">PIPELINE ARCHITECTURE</div>
                <div className="text-2xl font-bold font-mono text-terminal-accent">
                  LANGGRAPH
                </div>
                <div className="text-xs font-mono text-terminal-secondary">
                  7 Autonomous Agents + Quant Risk Simulator
                </div>
              </div>

              <div className="bg-[#1D1D1D] p-5 space-y-2">
                <div className="terminal-label text-[10px]">EXECUTION MODE</div>
                <div className="text-2xl font-bold font-mono text-terminal-text">
                  DETERMINISTIC
                </div>
                <div className="text-xs font-mono text-terminal-secondary">
                  Simulated multi-source grounded feeds (Demo Mode)
                </div>
              </div>
            </div>
          </section>
        )}

        {analysisState === "analyzing" && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <ExecutionProgress
              query={activeQuery}
              steps={executionSteps}
              currentStepIndex={currentStepIndex}
              isComplete={currentStepIndex >= executionSteps.length - 1 && executionSteps[executionSteps.length - 1]?.status === "completed"}
            />
          </section>
        )}

        {analysisState === "error" && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="bg-[#1D1D1D] border border-terminal-negative p-8 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-terminal-negative text-[#171717] uppercase">
                  PIPELINE ERROR
                </span>
                <span className="text-sm font-mono text-terminal-negative font-semibold">
                  Execution Terminated Unexpectedly
                </span>
              </div>

              <p className="text-sm font-mono text-terminal-secondary">
                {errorMessage || "An unexpected error occurred during multi-agent signal aggregation."}
              </p>

              <div className="pt-4 border-t border-terminal-border flex items-center space-x-4">
                <button
                  onClick={() => handleRunAnalysis(activeQuery)}
                  className="px-4 py-2 bg-terminal-accent text-[#171717] font-mono font-bold text-xs uppercase cursor-pointer"
                >
                  [ RETRY ANALYSIS ]
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-surface border border-terminal-border text-terminal-secondary hover:text-terminal-text font-mono text-xs uppercase cursor-pointer"
                >
                  [ RETURN TO CONSOLE ]
                </button>
              </div>
            </div>
          </section>
        )}

        {analysisState === "complete" && (
          <>
            {/* Active Query Banner */}
            <QueryStatusBar
              query={activeQuery}
              onNewQuery={handleReset}
              scenarioName={analysisResult.event.category}
            />

            {/* Render Full Populated Overview Terminal */}
            <EventHeader
              event={analysisResult.event}
              weather={analysisResult.weather}
            />

            <IntelligenceStrip
              weather={analysisResult.weather}
              news={analysisResult.news}
              historical={analysisResult.historical}
              market={analysisResult.market}
            />

            <RiskOverview
              risk={analysisResult.risk}
              strategy={analysisResult.strategy}
            />

            <ScenarioChart scenarios={analysisResult.scenarios} />

            <PortfolioExposure
              sectors={analysisResult.portfolio.sectors}
              topContributors={analysisResult.portfolio.top_risk_contributors}
              totalValue={analysisResult.portfolio.total_value}
            />

            <AgentTrace trace={analysisResult.agent_trace} />

            <EvidencePreview evidence={analysisResult.evidence} />
          </>
        )}
      </main>

      {/* 3. Technical Terminal Footer */}
      <TerminalFooter />
    </div>
  );
}
