"use client";
import { useState } from "react";
import { AgentTrace } from "@/types/analysis";

interface AgentTraceProps {
  trace: AgentTrace;
}

export default function AgentTracePanel({ trace }: AgentTraceProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="terminal-panel-box" style={{ width: "100%" }}>
      <div className="panel-title-bar">
        <span className="panel-title-text">MULTI-AGENT EXECUTION TRACE</span>
        <span className="matrix-cell-val-mono">{trace.total_duration_ms ? `${trace.total_duration_ms}ms TOTAL` : "ACTIVE"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {trace.steps.map((step, idx) => {
          const isDone = step.status === "completed";
          const isExp = expanded === step.agent;
          return (
            <div
              key={step.agent}
              onClick={() => setExpanded(isExp ? null : step.agent)}
              style={{
                padding: "10px 14px",
                background: isExp ? "#121722" : "#0c0f16",
                border: "1px solid var(--border-subtle)",
                borderRadius: 2,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--term-teal)", fontWeight: 700, fontSize: 11 }}>
                    0{idx + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                    {step.agent.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {step.sources?.[0]}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {step.latency_ms && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {step.latency_ms}ms
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: isDone ? "var(--term-teal)" : "var(--term-amber)", fontWeight: 700 }}>
                    {isDone ? "[✓ COMPLETE]" : "[RUNNING]"}
                  </span>
                </div>
              </div>

              {isExp && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-sub)" }}>
                  <div>INPUT: {JSON.stringify(step.input)}</div>
                  <div style={{ marginTop: 4, color: "var(--term-teal)" }}>OUTPUT: {JSON.stringify(step.output)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
