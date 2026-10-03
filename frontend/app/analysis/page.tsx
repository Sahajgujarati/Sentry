"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { streamAnalysis, Mode } from "@/lib/api";
import { AnalysisResponse } from "@/types/analysis";
import Navbar from "@/components/Navbar";

type MessageRole = "user" | "assistant" | "system";

interface AgentStepMsg {
  label: string;
  status: "pending" | "running" | "done";
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  status?: "idle" | "streaming" | "done" | "error";
  agentSteps?: AgentStepMsg[];
  analysis?: AnalysisResponse;
}

const AGENT_STEPS_LABELS = [
  "EVENT PARSER // IDENTIFYING RISK TELEMETRY",
  "WEATHER & SATELLITE RECONNAISSANCE",
  "NEWS WIRE SENTIMENT SIGNAL DECOMPOSITION",
  "VECTOR DB // HISTORICAL ANALOG EXTRACTION",
  "LIVE MARKET FEED & TICK SYNCHRONIZATION",
  "PORTFOLIO EXPOSURE & MONTE CARLO VALUE-AT-RISK",
  "SYNTHESIZING ALPHA HEDGE & REBALANCE STRATEGY",
];

const SUGGESTIONS = [
  "Category 4 Hurricane in Gulf of Mexico (Energy Portfolio)",
  "Fed unexpected 50bps rate hike impact on tech holdings",
  "Middle East strait disruption oil supply shock",
  "Global semiconductor supply chain bottleneck analysis",
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      text: "SENTRY QUANTITATIVE INTELLIGENCE TERMINAL ONLINE. READY FOR EVENT TELEMETRY QUERY.",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("demo");
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryOverride?: string) => {
    const q = (queryOverride ?? input).trim();
    if (!q || isRunning) return;

    setInput("");
    setIsRunning(true);

    const userMsg: ChatMessage = { id: uid(), role: "user", text: q, timestamp: new Date() };
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      timestamp: new Date(),
      status: "streaming",
      agentSteps: AGENT_STEPS_LABELS.map((label) => ({ label, status: "pending" })),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      let stepIdx = 0;
      for await (const update of streamAnalysis(q, "demo-energy", mode)) {
        if (update.status === "done" && update.data) {
          sessionStorage.setItem("sentry_analysis", JSON.stringify(update.data));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    status: "done",
                    analysis: update.data,
                    agentSteps: AGENT_STEPS_LABELS.map((label) => ({ label, status: "done" })),
                    text: `Analysis complete for ${update.data?.event.type}. Severity: ${update.data?.event.severity}, Risk: ${update.data?.risk?.risk_level} (${update.data?.risk?.risk_score}/100), Portfolio Impact: ${((update.data?.risk?.portfolio_impact || 0) * 100).toFixed(2)}%.`,
                  }
                : m
            )
          );
          break;
        }

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m;
            const steps = m.agentSteps!.map((s, i) => ({
              ...s,
              status:
                i < stepIdx ? ("done" as const)
                : i === stepIdx ? ("running" as const)
                : ("pending" as const),
            }));
            return { ...m, agentSteps: steps };
          })
        );
        stepIdx++;
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, status: "error", text: "ERROR: Telemetry feed unreachable." }
            : m
        )
      );
    }

    setIsRunning(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      <Navbar
        mode={mode}
        onModeChange={(m) => setMode(m)}
        activeTab="RUN ANALYSIS"
        onTabChange={(tab) => {
          if (tab === "OVERVIEW") router.push("/dashboard");
        }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 980, width: "100%", margin: "0 auto", padding: "20px 24px" }}>
        {/* Messages feed */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "system" && (
                <div style={{ padding: "10px 14px", background: "#080b0f", border: "1px solid var(--border-subtle)", borderRadius: 2, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--term-teal)" }}>
                  &gt; {msg.text}
                </div>
              )}

              {msg.role === "user" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ padding: "10px 14px", background: "#121722", border: "1px solid var(--border-mid)", borderRadius: 2, fontFamily: "var(--font-mono)", fontSize: 12, color: "#fff", maxWidth: "80%" }}>
                    <span style={{ color: "var(--term-teal)", marginRight: 6 }}>QUERY:</span> {msg.text}
                  </div>
                </div>
              )}

              {msg.role === "assistant" && (
                <div style={{ background: "#0c0f16", border: "1px solid var(--border-mid)", borderRadius: 2, padding: "16px 20px" }}>
                  {msg.agentSteps && msg.status === "streaming" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                      <div className="matrix-cell-label" style={{ marginBottom: 6 }}>SWARM EXECUTION IN PROGRESS</div>
                      {msg.agentSteps.map((st, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                          <span style={{ color: st.status === "done" ? "var(--term-teal)" : st.status === "running" ? "#fff" : "var(--text-muted)" }}>
                            {st.label}
                          </span>
                          <span style={{ color: st.status === "done" ? "var(--term-teal)" : st.status === "running" ? "var(--term-amber)" : "var(--text-faint)", fontWeight: 700 }}>
                            {st.status === "done" ? "[✓ COMPLETE]" : st.status === "running" ? "[RUNNING...]" : "[PENDING]"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.status === "done" && msg.analysis && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                          SYNTHESIS RESULT: CATEGORY {msg.analysis.event.severity} {msg.analysis.event.type.toUpperCase()}
                        </div>
                        <button
                          onClick={() => router.push("/dashboard")}
                          className="btn-terminal-action"
                        >
                          [ OPEN IN DASHBOARD TERMINAL ] &gt;
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
                        <div style={{ background: "#080a0e", border: "1px solid var(--border-subtle)", padding: 10 }}>
                          <div className="matrix-cell-label">RISK LEVEL</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800, color: "var(--term-red)" }}>
                            {msg.analysis.risk.risk_level} ({msg.analysis.risk.risk_score}/100)
                          </div>
                        </div>
                        <div style={{ background: "#080a0e", border: "1px solid var(--border-subtle)", padding: 10 }}>
                          <div className="matrix-cell-label">PORTFOLIO IMPACT</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800, color: "var(--term-red)" }}>
                            {(msg.analysis.risk.portfolio_impact * 100).toFixed(2)}%
                          </div>
                        </div>
                        <div style={{ background: "#080a0e", border: "1px solid var(--border-subtle)", padding: 10 }}>
                          <div className="matrix-cell-label">CONFIDENCE</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800, color: "var(--term-teal)" }}>
                            {(msg.analysis.risk.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div style={{ background: "#080a0e", border: "1px solid var(--border-subtle)", padding: 10 }}>
                          <div className="matrix-cell-label">STRATEGY</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800, color: "var(--term-amber)" }}>
                            {msg.analysis.strategy.type}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6, background: "#080a0e", padding: 12, border: "1px solid var(--border-subtle)" }}>
                        {msg.analysis.strategy.reason}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="chip-terminal"
              >
                &gt; {s}
              </button>
            ))}
          </div>
        )}

        {/* Query Input */}
        <div style={{ background: "#0c0f16", border: "1px solid var(--border-mid)", borderRadius: 2, padding: "10px 14px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--term-teal)", fontWeight: 700 }}>&gt;</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Input financial shock or scenario query (e.g. Category 4 Hurricane in Gulf)..."
            rows={1}
            disabled={isRunning}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              resize: "none",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isRunning}
            className="btn-terminal-action"
          >
            [ EXECUTE ]
          </button>
        </div>
      </div>
    </div>
  );
}
