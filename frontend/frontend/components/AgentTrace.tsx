"use client";
import { useState } from "react";
import { AgentTrace, AgentStep } from "@/types/analysis";

const AGENT_ICONS: Record<string, string> = {
  "Supervisor Agent": "🧠",
  "Weather Agent": "🌀",
  "News Agent": "📰",
  "Historical Agent": "🗂️",
  "Market Agent": "📊",
  "Risk Engine": "⚡",
  "Strategy Agent": "🎯",
};

const AGENT_COLORS: Record<string, string> = {
  "Supervisor Agent": "var(--accent-violet)",
  "Weather Agent": "var(--accent-cyan)",
  "News Agent": "var(--accent-amber)",
  "Historical Agent": "var(--accent-primary)",
  "Market Agent": "var(--accent-emerald)",
  "Risk Engine": "var(--accent-rose)",
  "Strategy Agent": "var(--accent-primary)",
};

interface AgentTraceProps {
  trace: AgentTrace;
}

export default function AgentTracePanel({ trace }: AgentTraceProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const allDone = trace.steps.every((s) => s.status === "completed");

  return (
    <div className="card" style={{ animation: "fadeInUp 0.5s 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>AGENT INTELLIGENCE</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Execution Trace</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {trace.total_duration_ms && (
            <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {trace.total_duration_ms}ms total
            </span>
          )}
          {allDone && <span className="badge badge-green">✓ COMPLETE</span>}
        </div>
      </div>

      {/* Vertical timeline */}
      <div style={{ position: "relative" }}>
        {/* Connecting line */}
        <div style={{
          position: "absolute",
          left: 19,
          top: 20,
          bottom: 20,
          width: 2,
          background: "var(--border-subtle)",
          zIndex: 0,
        }}/>

        {trace.steps.map((step, idx) => {
          const color = AGENT_COLORS[step.agent] ?? "var(--accent-primary)";
          const icon = AGENT_ICONS[step.agent] ?? "🤖";
          const isExpanded = expanded === step.agent;
          const isLast = idx === trace.steps.length - 1;

          return (
            <div key={step.agent} style={{ position: "relative", zIndex: 1, marginBottom: isLast ? 0 : 12 }}>
              <div
                onClick={() => setExpanded(isExpanded ? null : step.agent)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  background: isExpanded ? "var(--bg-elevated)" : "transparent",
                  border: `1px solid ${isExpanded ? color + "30" : "transparent"}`,
                  transition: "all 0.2s",
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: 40, height: 40,
                  borderRadius: "50%",
                  background: step.status === "completed" ? `${color}20` : "var(--bg-elevated)",
                  border: `2px solid ${step.status === "completed" ? color : "var(--border-default)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                  position: "relative",
                  transition: "all 0.3s",
                  boxShadow: step.status === "completed" ? `0 0 12px ${color}40` : "none",
                }}>
                  {step.status === "running" ? (
                    <div style={{
                      width: 16, height: 16,
                      borderRadius: "50%",
                      border: `2px solid ${color}`,
                      borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite",
                    }}/>
                  ) : step.status === "completed" ? icon : (
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>○</span>
                  )}
                </div>

                {/* Agent name & status */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: step.status === "completed" ? "var(--text-primary)" : "var(--text-muted)",
                  }}>
                    {step.agent}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                    {step.sources?.join(" · ") ?? ""}
                  </div>
                </div>

                {/* Latency & status */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {step.latency_ms && (
                    <div className="mono" style={{ fontSize: 12, color, marginBottom: 2 }}>
                      {step.latency_ms}ms
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    {step.status === "completed" && (
                      <span style={{ fontSize: 12, color: "var(--accent-emerald)", fontWeight: 600 }}>✓ done</span>
                    )}
                    {step.status === "running" && (
                      <span style={{ fontSize: 12, color: "var(--accent-amber)", fontWeight: 600 }}>⏳ running</span>
                    )}
                    {step.status === "pending" && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>○ pending</span>
                    )}
                    {step.status === "error" && (
                      <span style={{ fontSize: 12, color: "var(--accent-rose)", fontWeight: 600 }}>✗ error</span>
                    )}
                  </div>
                </div>

                {/* Expand arrow */}
                <svg
                  width="14" height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="2"
                  style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  marginLeft: 54,
                  marginTop: 8,
                  background: "var(--bg-elevated)",
                  border: `1px solid ${color}20`,
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  animation: "fadeInUp 0.2s ease",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <DetailBlock label="STATUS" value={step.status.toUpperCase()} color={color} />
                    {step.latency_ms && <DetailBlock label="LATENCY" value={`${step.latency_ms}ms`} />}
                  </div>

                  {step.input && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="section-label" style={{ marginBottom: 6 }}>INPUT</div>
                      <pre className="mono" style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        background: "var(--bg-card)",
                        borderRadius: 6,
                        padding: 10,
                        overflow: "auto",
                        maxHeight: 100,
                      }}>
                        {JSON.stringify(step.input, null, 2)}
                      </pre>
                    </div>
                  )}

                  {step.output && (
                    <div>
                      <div className="section-label" style={{ marginBottom: 6 }}>OUTPUT</div>
                      <pre className="mono" style={{
                        fontSize: 12,
                        color: "var(--accent-emerald)",
                        background: "var(--bg-card)",
                        borderRadius: 6,
                        padding: 10,
                        overflow: "auto",
                        maxHeight: 100,
                      }}>
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="divider" style={{ marginTop: 16 }}/>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {trace.steps.filter((s) => s.status === "completed").length} / {trace.steps.length} agents completed
        </span>
        {trace.total_duration_ms && (
          <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Total: {(trace.total_duration_ms / 1000).toFixed(2)}s
          </span>
        )}
      </div>
    </div>
  );
}

function DetailBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 8, padding: "8px 12px" }}>
      <div className="section-label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color ?? "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
