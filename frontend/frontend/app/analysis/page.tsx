"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { streamAnalysis, Mode } from "@/lib/api";
import { AnalysisResponse } from "@/types/analysis";

/* ─── Types ─── */
type MessageRole = "user" | "assistant" | "system";
type MessageStatus = "idle" | "streaming" | "done" | "error";

interface AgentStepMsg {
  label: string;
  status: "pending" | "running" | "done";
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  status?: MessageStatus;
  agentSteps?: AgentStepMsg[];
  analysis?: AnalysisResponse;
  isTyping?: boolean;
}

const AGENT_STEPS_LABELS = [
  { label: "Parsing query & identifying event", icon: "🔍" },
  { label: "Fetching weather intelligence", icon: "🌀" },
  { label: "Analyzing news signals", icon: "📰" },
  { label: "Retrieving historical events (Vector DB)", icon: "🗂️" },
  { label: "Fetching real-time market data", icon: "📊" },
  { label: "Calculating portfolio risk exposure", icon: "⚡" },
  { label: "Generating strategy recommendation", icon: "🎯" },
];

const SUGGESTION_CHIPS = [
  "Hurricane impact on energy portfolio",
  "Fed rate hike effect on tech stocks",
  "Oil supply shock analysis",
  "Rising inflation risk assessment",
  "Category 4 storm Gulf of Mexico",
  "Energy sector hedging strategy",
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
      text: "welcome",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("demo");
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryOverride?: string) => {
    const q = (queryOverride ?? input).trim();
    if (!q || isRunning) return;

    setInput("");
    setIsRunning(true);

    // Add user message
    const userMsg: ChatMessage = { id: uid(), role: "user", text: q, timestamp: new Date() };
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      timestamp: new Date(),
      status: "streaming",
      agentSteps: AGENT_STEPS_LABELS.map((s) => ({ label: s.label, status: "pending" })),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      let stepIdx = 0;
      for await (const update of streamAnalysis(q, "demo-energy", mode)) {
        if (update.status === "done" && update.data) {
          // Store for dashboard
          sessionStorage.setItem("sentry_analysis", JSON.stringify(update.data));

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    status: "done",
                    analysis: update.data,
                    agentSteps: AGENT_STEPS_LABELS.map((s) => ({ label: s.label, status: "done" as const })),
                    text: buildSummaryText(update.data!),
                  }
                : m
            )
          );
          break;
        }

        // Update step states
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m;
            const steps = m.agentSteps!.map((s, i) => ({
              ...s,
              status:
                i < stepIdx ? "done" as const
                : i === stepIdx ? "running" as const
                : "pending" as const,
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
            ? { ...m, status: "error", text: "Analysis failed. Please try again." }
            : m
        )
      );
    }

    setIsRunning(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-enter" style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--bg-base)",
      position: "relative",
    }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 58,
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-2)", fontSize: 13, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Dashboard
          </button>

          <div style={{ width: 1, height: 20, background: "var(--border)" }}/>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #4f7ef8, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(79, 126, 248, 0.45)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--text-1)" }}>Live Analysis</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>Multi-agent intelligence terminal</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Mode toggle */}
          <div style={{
            display: "flex", background: "var(--bg-elevated)",
            border: "1px solid var(--border)", borderRadius: 8, padding: 3, gap: 2,
          }}>
            {(["demo", "live"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "5px 14px", borderRadius: 6,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                  textTransform: "uppercase", cursor: "pointer", border: "none",
                  transition: "all 0.15s",
                  background: mode === m
                    ? m === "live" ? "var(--danger)" : "var(--accent)"
                    : "transparent",
                  color: mode === m ? "white" : "var(--text-3)",
                  boxShadow: mode === m ? "0 0 10px rgba(79,126,248,0.35)" : "none",
                }}
              >
                {m === "live" && "● "}{m}
              </button>
            ))}
          </div>

          <div className="live-badge">
            <div className="pulse-green"/>
            <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>5 agents ready</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "24px",
        display: "flex", flexDirection: "column", gap: 20,
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border) transparent",
      }}>
        {messages.map((msg) => (
          <div key={msg.id} className="tab-fade-in">
            <MessageBubble
              msg={msg}
              onViewDashboard={() => router.push("/dashboard")}
            />
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* ── Suggestion chips (only when no user messages) ── */}
      {messages.length <= 1 && (
        <div style={{
          padding: "0 24px 16px",
          display: "flex", gap: 8, flexWrap: "wrap",
        }}>
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              style={{
                padding: "8px 16px", borderRadius: 100,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                fontSize: 12, color: "var(--text-2)", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { 
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)"; 
                (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
                (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => { 
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; 
                (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div style={{
        padding: "16px 24px 20px",
        background: "var(--bg-sidebar)",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 12,
          background: "var(--bg-input)",
          border: "1px solid var(--border-md)",
          borderRadius: 14,
          padding: "12px 14px",
          transition: "all 0.2s",
          boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.5)",
        }}
          onFocus={(e) => { 
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)"; 
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-dim)"; 
          }}
          onBlur={(e) => { 
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-md)"; 
            (e.currentTarget as HTMLElement).style.boxShadow = "none"; 
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any financial event, portfolio risk, or market scenario..."
            rows={1}
            disabled={isRunning}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--text-1)", fontSize: 14, resize: "none",
              fontFamily: "Inter, sans-serif", lineHeight: 1.5, maxHeight: 120,
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isRunning}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: (!input.trim() || isRunning) ? "var(--bg-elevated)" : "var(--accent)",
              border: "none", cursor: (!input.trim() || isRunning) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
              boxShadow: (!input.trim() || isRunning) ? "none" : "0 0 14px rgba(79, 126, 248, 0.5)",
            }}
          >
            {isRunning ? (
              <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--text-3)" }}>
          Enter to send · Shift+Enter for new line · Powered by multi-agent AI
        </div>
      </div>
    </div>
  );
}

/* ── Message Bubble ── */
function MessageBubble({ msg, onViewDashboard }: { msg: ChatMessage; onViewDashboard: () => void }) {
  if (msg.role === "system") {
    return (
      <div className="hero-fintech-stage">
        {/* Floating Card 1: Top-Left (Risk Engine) */}
        <div className="fintech-floating-card card-pos-tl">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>⚡</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>RISK ENGINE</span>
            </div>
            <div className="pulse-green" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-1)" }}>
            β: 1.14 <span style={{ fontSize: 10, color: "var(--success)", fontWeight: 600 }}>(-4.2% hedge)</span>
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            {/* Mini SVG Sparkline */}
            <svg width="100" height="18" viewBox="0 0 100 18" fill="none">
              <path d="M0 12 L15 14 L30 6 L45 10 L60 4 L75 12 L90 2 L100 6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0 12 L15 14 L30 6 L45 10 L60 4 L75 12 L90 2 L100 6 L100 18 L0 18 Z" fill="rgba(79, 126, 248, 0.1)" />
            </svg>
            <span style={{ fontSize: 9, color: "var(--text-3)", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>2ms ping</span>
          </div>
        </div>

        {/* Floating Card 2: Top-Right (Multi-Agent Swarm) */}
        <div className="fintech-floating-card card-pos-tr">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>🌐</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--violet)", letterSpacing: "0.04em" }}>AGENT SWARM</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--success)", background: "var(--success-dim)", padding: "1px 6px", borderRadius: 100, border: "1px solid var(--success-border)" }}>
              5/5 ACTIVE
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            {["🌀", "📰", "🗂️", "⚡", "🎯"].map((icon, i) => (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: 6,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(79, 126, 248, 0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11,
              }}>
                {icon}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
            <span>Consensus Ready</span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>100%</span>
          </div>
        </div>

        {/* Floating Card 3: Bottom-Left (Vector DB Memory) */}
        <div className="fintech-floating-card card-pos-bl">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 13 }}>🗂️</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", letterSpacing: "0.04em" }}>VECTOR MEMORY</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            12,480 Events
          </div>
          <div style={{ fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
            Similarity match: <span style={{ color: "var(--success)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>99.4%</span>
          </div>
        </div>

        {/* Floating Card 4: Bottom-Right (Alpha Hedge Optimizer) */}
        <div className="fintech-floating-card card-pos-br">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 13 }}>🛡️</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warning)", letterSpacing: "0.04em" }}>ALPHA HEDGING</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--danger)", fontFamily: "'JetBrains Mono', monospace" }}>
            +4.82% Downside
          </div>
          <div style={{ fontSize: 9, color: "var(--accent)", marginTop: 2, fontWeight: 600, textTransform: "uppercase" }}>
            ● Dynamic Rebalance
          </div>
        </div>

        {/* Center: Rotating Orbital Radar & Core Emblem */}
        <div className="hero-orbital-wrapper">
          <div className="orbit-ring-outer" />
          <div className="orbit-ring-inner" />
          <div className="hero-core-badge">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 6, maxWidth: 540 }}>
          <div style={{ 
            fontSize: 26, fontWeight: 900, 
            fontFamily: "'Plus Jakarta Sans',sans-serif", 
            letterSpacing: "-0.03em", marginBottom: 8,
            color: "var(--text-1)",
          }}>
            SENTRY AI — Live Analysis
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 18 }}>
            Ask about any financial event, portfolio risk scenario, or market shock. I'll deploy{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>5 specialized autonomous agents</span>{" "}
            to analyze weather, news, historical data, market signals, and generate a risk-adjusted strategy.
          </p>
        </div>

        {/* 5 Interactive Agent Pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 6 }}>
          {[
            { name: "🌀 Weather Analysis", color: "var(--accent)" },
            { name: "📰 News Intelligence", color: "var(--accent)" },
            { name: "🗂️ Historical DB", color: "var(--success)" },
            { name: "⚡ Risk Engine", color: "var(--danger)" },
            { name: "🎯 Strategy Agent", color: "var(--violet)" },
          ].map((a, i) => (
            <span key={i} style={{
              padding: "6px 14px", borderRadius: 100,
              background: "rgba(13, 17, 27, 0.85)", border: `1px solid rgba(79, 126, 248, 0.2)`,
              fontSize: 11, color: "var(--text-1)", fontWeight: 600,
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
              display: "inline-flex", alignItems: "center", gap: 6,
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(79, 126, 248, 0.2)";
              (e.currentTarget as HTMLElement).style.background = "rgba(13, 17, 27, 0.85)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
            }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              {a.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          maxWidth: "65%",
          background: "var(--accent)",
          borderRadius: "14px 14px 4px 14px",
          padding: "12px 16px",
          boxShadow: "0 4px 16px rgba(79, 126, 248, 0.3)",
          color: "#fff",
          fontWeight: 500,
        }}>
          <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5 }}>{msg.text}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6, textAlign: "right" }}>
            {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div style={{ display: "flex", gap: 12, maxWidth: "85%" }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, #4f7ef8, #818cf8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 12px rgba(79, 126, 248, 0.45)",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Agent steps progress */}
        {msg.agentSteps && msg.status === "streaming" && (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 16, marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12 }}>
              Multi-Agent Execution
            </div>
            {msg.agentSteps.map((step, i) => {
              const icon = AGENT_STEPS_LABELS[i]?.icon ?? "•";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 0",
                  borderBottom: i < msg.agentSteps!.length - 1 ? "1px solid var(--border)" : "none",
                  opacity: step.status === "pending" ? 0.4 : 1,
                  transition: "opacity 0.3s",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: step.status === "done" ? "var(--emerald-glow)" : step.status === "running" ? "var(--blue-glow)" : "var(--bg-elevated)",
                    border: `1.5px solid ${step.status === "done" ? "var(--emerald)" : step.status === "running" ? "var(--blue)" : "var(--border)"}`,
                    fontSize: step.status === "done" ? 10 : 14,
                    transition: "all 0.3s",
                  }}>
                    {step.status === "done" ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : step.status === "running" ? (
                      <div style={{ width: 10, height: 10, border: "2px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: step.status === "running" ? 600 : 400,
                    color: step.status === "done" ? "var(--emerald)" : step.status === "running" ? "var(--text-1)" : "var(--text-2)",
                    transition: "color 0.3s",
                  }}>
                    {step.label}
                  </span>
                  {step.status === "running" && (
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--amber)", fontWeight: 600, animation: "pulse 1.5s infinite" }}>⏳</span>
                  )}
                  {step.status === "done" && (
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--emerald)", fontWeight: 600 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {msg.status === "error" && (
          <div style={{
            background: "var(--rose-glow)", border: "1px solid rgba(244,63,94,0.25)",
            borderRadius: 12, padding: 14,
            fontSize: 13, color: "var(--rose)",
          }}>
            ✗ {msg.text}
          </div>
        )}

        {/* Done — analysis card */}
        {msg.status === "done" && msg.analysis && (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            {/* Summary header */}
            <div style={{
              padding: "16px 20px",
              background: "var(--bg-card2)",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>
                    Analysis Complete · {new Date(msg.analysis.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4 }}>
                    {msg.analysis.event.type.charAt(0).toUpperCase() + msg.analysis.event.type.slice(1)} — {msg.analysis.event.location}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>Category {msg.analysis.event.severity} · Severity {(msg.analysis.weather.severity_score * 100).toFixed(0)}%</div>
                </div>
                <RiskBadge level={msg.analysis.risk.risk_level} score={msg.analysis.risk.risk_score} />
              </div>
            </div>

            {/* Key metrics grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              borderBottom: "1px solid var(--border)",
            }}>
              {[
                { label: "Portfolio Impact", value: `${(msg.analysis.risk.portfolio_impact * 100).toFixed(2)}%`, color: "var(--danger)" },
                { label: "Confidence", value: `${(msg.analysis.risk.confidence * 100).toFixed(0)}%`, color: "var(--success)" },
                { label: "Historical Events", value: msg.analysis.historical.count.toString(), color: "var(--accent)" },
                { label: "News Articles", value: msg.analysis.news.article_count.toString(), color: "var(--warning)" },
              ].map(({ label, value, color }, i) => (
                <div key={label} style={{
                  padding: "14px 16px",
                  borderRight: i < 3 ? "1px solid var(--border)" : "none",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", color, letterSpacing: "-0.02em" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Strategy text */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                  🛡 Strategy: {msg.analysis.strategy.type}
                </span>
                <span style={{
                  padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 800,
                  background: "var(--amber-glow)", color: "var(--amber)", border: "1px solid rgba(255,183,3,0.4)",
                  boxShadow: "0 0 10px rgba(255,183,3,0.25)",
                }}>
                  {msg.analysis.strategy.urgency} URGENCY
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                {msg.analysis.strategy.reason.slice(0, 200)}...
              </p>
            </div>

            {/* Actions */}
            <div style={{ padding: "14px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--success)", letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✓</span> {msg.analysis.agent_trace.steps.length} agents completed in {msg.analysis.agent_trace.total_duration_ms}ms
                </div>
                <button
                  onClick={onViewDashboard}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 20px", borderRadius: 10,
                    background: "var(--accent)",
                    border: "none", color: "white", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", boxShadow: "0 0 14px rgba(79, 126, 248, 0.4)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 22px rgba(79, 126, 248, 0.6)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px rgba(79, 126, 248, 0.4)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  View Full Dashboard
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 6, paddingLeft: 2 }}>
          {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level, score }: { level: string; score: number }) {
  const colorMap: Record<string, string> = {
    LOW: "var(--emerald)", MEDIUM: "var(--amber)", HIGH: "var(--rose)", CRITICAL: "#dc2626",
  };
  const bgMap: Record<string, string> = {
    LOW: "var(--emerald-glow)", MEDIUM: "var(--amber-glow)", HIGH: "var(--rose-glow)", CRITICAL: "rgba(220,38,38,0.15)",
  };
  const c = colorMap[level] ?? "var(--rose)";
  const bg = bgMap[level] ?? "var(--rose-glow)";
  return (
    <div style={{
      padding: "8px 16px", borderRadius: 10,
      background: bg, border: `1px solid ${c}40`,
      textAlign: "center", flexShrink: 0,
    }}>
      <div style={{ fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.06em" }}>{level} RISK</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: 10, color: "var(--text-3)" }}>/ 100</div>
    </div>
  );
}

function buildSummaryText(data: AnalysisResponse): string {
  return `Analysis complete. ${data.event.type} event detected at ${data.event.location} (Category ${data.event.severity}). Portfolio risk: ${data.risk.risk_level} (${data.risk.risk_score}/100). Estimated impact: ${(data.risk.portfolio_impact * 100).toFixed(2)}%. Strategy recommendation: ${data.strategy.type}.`;
}
