"use client";

import React, { useState, useEffect } from "react";
import { ScenarioPoint } from "@/types/analysis";
import { formatNumber } from "@/lib/mock-analysis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface ScenarioChartProps {
  scenarios: {
    mild: number;
    base: number;
    severe: number;
    breakdown: ScenarioPoint[];
  };
}

export const ScenarioChart: React.FC<ScenarioChartProps> = ({ scenarios }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<"mild" | "base" | "severe">("base");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const breakdownMap = (scenarios.breakdown || []).reduce<Record<string, ScenarioPoint>>((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  const mildData = breakdownMap["mild"] || {
    id: "mild",
    name: "MILD",
    impact_pct: scenarios.mild,
    dollar_loss: scenarios.mild * 980000,
    projected_value: 980000 * (1 + scenarios.mild),
    description: "Deflects east of primary infrastructure; short disruption window.",
    probability: 0.2,
  };

  const baseData = breakdownMap["base"] || {
    id: "base",
    name: "BASE",
    impact_pct: scenarios.base,
    dollar_loss: scenarios.base * 980000,
    projected_value: 980000 * (1 + scenarios.base),
    description: "Direct impact on central production corridor with 10-14 day restart window.",
    probability: 0.55,
  };

  const severeData = breakdownMap["severe"] || {
    id: "severe",
    name: "SEVERE",
    impact_pct: scenarios.severe,
    dollar_loss: scenarios.severe * 980000,
    projected_value: 980000 * (1 + scenarios.severe),
    description: "Escalated destruction with prolonged structural outages.",
    probability: 0.25,
  };

  const activeScenarioPoint =
    selectedScenario === "mild"
      ? mildData
      : selectedScenario === "severe"
      ? severeData
      : baseData;

  const chartData = [
    {
      scenario: "MILD",
      drawdown: Number((scenarios.mild * 100).toFixed(2)),
      loss: `$${Math.abs(Math.round(mildData.dollar_loss / 1000 * 10) / 10)}K`,
      probability: `${Math.round(mildData.probability * 100)}%`,
      fill: selectedScenario === "mild" ? "#00E5A0" : "#5F5F5A",
    },
    {
      scenario: "BASE",
      drawdown: Number((scenarios.base * 100).toFixed(2)),
      loss: `$${Math.abs(Math.round(baseData.dollar_loss / 1000 * 10) / 10)}K`,
      probability: `${Math.round(baseData.probability * 100)}%`,
      fill: selectedScenario === "base" ? "#00E5A0" : "#9A9A94",
    },
    {
      scenario: "SEVERE",
      drawdown: Number((scenarios.severe * 100).toFixed(2)),
      loss: `$${Math.abs(Math.round(severeData.dollar_loss / 1000 * 10) / 10)}K`,
      probability: `${Math.round(severeData.probability * 100)}%`,
      fill: selectedScenario === "severe" ? "#FF4D4D" : "#8A3A3A",
    },
  ];

  return (
    <section className="border-b border-terminal-border bg-surface/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-terminal-border gap-2">
          <div>
            <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-muted">
              PROBABILITY-WEIGHTED SIMULATION // INTERACTIVE SCENARIOS
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-terminal-text uppercase font-mono mt-0.5">
              Scenario Analysis
            </h2>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono text-terminal-secondary">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-terminal-muted inline-block" />
              <span>Mild ({(scenarios.mild * 100).toFixed(2)}%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-terminal-accent inline-block" />
              <span className="text-terminal-accent font-semibold">Base ({(scenarios.base * 100).toFixed(2)}%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-terminal-negative inline-block" />
              <span>Severe ({(scenarios.severe * 100).toFixed(2)}%)</span>
            </span>
          </div>
        </div>

        {/* 3-Column Interactive Scenario Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-terminal-border border-x border-b border-terminal-border">
          {/* Mild */}
          <button
            type="button"
            onClick={() => setSelectedScenario("mild")}
            className={`p-5 sm:p-6 space-y-3 text-left cursor-pointer transition-all ${
              selectedScenario === "mild"
                ? "bg-[#171717] border-t-2 border-terminal-accent"
                : "bg-[#1D1D1D] hover:bg-[#232323]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`terminal-label text-[10px] ${selectedScenario === "mild" ? "text-terminal-accent font-semibold" : ""}`}>
                SCENARIO 01 {selectedScenario === "mild" && "// ACTIVE"}
              </span>
              <span className="text-[11px] font-mono text-terminal-secondary">
                P = {Math.round(mildData.probability * 100)}%
              </span>
            </div>
            <div className={`text-lg font-bold font-mono ${selectedScenario === "mild" ? "text-terminal-accent" : "text-terminal-secondary"}`}>
              MILD PATH
            </div>
            <div className={`text-3xl sm:text-4xl font-black font-mono ${selectedScenario === "mild" ? "text-terminal-accent" : "text-terminal-secondary"}`}>
              {(scenarios.mild * 100).toFixed(2)}%
            </div>
            <div className="text-xs font-mono text-terminal-muted pt-2 border-t border-terminal-border/60">
              {mildData.description}
            </div>
          </button>

          {/* Base */}
          <button
            type="button"
            onClick={() => setSelectedScenario("base")}
            className={`p-5 sm:p-6 space-y-3 text-left cursor-pointer transition-all ${
              selectedScenario === "base"
                ? "bg-[#171717] border-t-2 border-terminal-accent"
                : "bg-[#1D1D1D] hover:bg-[#232323]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`terminal-label text-[10px] ${selectedScenario === "base" ? "text-terminal-accent font-semibold" : ""}`}>
                SCENARIO 02 // BASELINE {selectedScenario === "base" && "[ACTIVE]"}
              </span>
              <span className="text-[11px] font-mono text-terminal-accent font-semibold">
                P = {Math.round(baseData.probability * 100)}% [HIGHEST]
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-terminal-accent">
              BASE EXPECTATION
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-terminal-accent">
              {(scenarios.base * 100).toFixed(2)}%
            </div>
            <div className="text-xs font-mono text-terminal-secondary pt-2 border-t border-terminal-accent/30">
              {baseData.description}
            </div>
          </button>

          {/* Severe */}
          <button
            type="button"
            onClick={() => setSelectedScenario("severe")}
            className={`p-5 sm:p-6 space-y-3 text-left cursor-pointer transition-all ${
              selectedScenario === "severe"
                ? "bg-[#171717] border-t-2 border-terminal-negative"
                : "bg-[#1D1D1D] hover:bg-[#232323]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`terminal-label text-[10px] ${selectedScenario === "severe" ? "text-terminal-negative font-semibold" : ""}`}>
                SCENARIO 03 {selectedScenario === "severe" && "// ACTIVE"}
              </span>
              <span className="text-[11px] font-mono text-terminal-secondary">
                P = {Math.round(severeData.probability * 100)}%
              </span>
            </div>
            <div className={`text-lg font-bold font-mono ${selectedScenario === "severe" ? "text-terminal-negative" : "text-terminal-secondary"}`}>
              SEVERE SHOCK
            </div>
            <div className={`text-3xl sm:text-4xl font-black font-mono ${selectedScenario === "severe" ? "text-terminal-negative" : "text-terminal-secondary"}`}>
              {(scenarios.severe * 100).toFixed(2)}%
            </div>
            <div className="text-xs font-mono text-terminal-muted pt-2 border-t border-terminal-border/60">
              {severeData.description}
            </div>
          </button>
        </div>

        {/* Selected Scenario Details Strip */}
        <div className="p-4 bg-[#171717] border border-terminal-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="terminal-label text-[10px]">SELECTED SCENARIO:</span>
            <span className="text-terminal-accent font-bold uppercase">{activeScenarioPoint.name} PATH</span>
            <span className="text-terminal-muted">|</span>
            <span className="text-terminal-text">IMPACT: {(activeScenarioPoint.impact_pct * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center space-x-4 text-terminal-secondary">
            <span>EST. DOLLAR IMPACT: <strong className="text-terminal-text">${formatNumber(activeScenarioPoint.dollar_loss)} USD</strong></span>
            <span>PROJECTED VALUE: <strong className="text-terminal-text">${formatNumber(activeScenarioPoint.projected_value)} USD</strong></span>
          </div>
        </div>

        {/* Professional Visual Chart Area */}
        <div className="mt-6 p-4 sm:p-6 bg-[#171717] border border-terminal-border">
          <div className="flex items-center justify-between mb-4">
            <span className="terminal-label text-[10px]">
              ESTIMATED PORTFOLIO DRAWDOWN SENSITIVITY (%)
            </span>
            <span className="text-[10px] font-mono text-terminal-muted">
              BENCHMARK BASELINE: 0.00%
            </span>
          </div>

          <div className="h-44 sm:h-52 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[-6, 0]}
                    tick={{ fill: "#9A9A94", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    stroke="#30302D"
                    tickFormatter={(val) => `${val}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="scenario"
                    tick={{ fill: "#F2F1EB", fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 600 }}
                    stroke="#30302D"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#1D1D1D] border border-terminal-border p-3 text-xs font-mono shadow-xl space-y-1">
                            <div className="text-terminal-accent font-bold">
                              {item.scenario} SCENARIO
                            </div>
                            <div className="text-terminal-text">Drawdown: {item.drawdown}%</div>
                            <div className="text-terminal-secondary">Est. Dollar Drag: {item.loss}</div>
                            <div className="text-terminal-muted">Confidence Probability: {item.probability}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={0} stroke="#5F5F5A" strokeWidth={1} />
                  <Bar dataKey="drawdown" barSize={22}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke={entry.scenario === "BASE" ? "#00E5A0" : "#30302D"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-mono text-terminal-muted">
                INITIALIZING QUANT SIMULATION VISUALIZER...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
