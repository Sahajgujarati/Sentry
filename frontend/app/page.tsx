"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { streamAnalysis, Mode } from "@/lib/api";
import Navbar from "@/components/Navbar";

const EXAMPLES = [
  "Category 4 Hurricane in Gulf of Mexico (Energy Portfolio)",
  "Fed unexpected 50bps rate hike impact on tech holdings",
  "Middle East strait disruption oil supply shock",
  "Global semiconductor supply chain bottleneck analysis",
];

const STEPS = [
  "EVENT PARSER // IDENTIFYING RISK TELEMETRY",
  "WEATHER & SATELLITE RECONNAISSANCE",
  "NEWS WIRE SENTIMENT SIGNAL DECOMPOSITION",
  "VECTOR DB // HISTORICAL ANALOG EXTRACTION",
  "LIVE MARKET FEED & TICK SYNCHRONIZATION",
  "PORTFOLIO EXPOSURE & MONTE CARLO VALUE-AT-RISK",
  "SYNTHESIZING ALPHA HEDGE & REBALANCE STRATEGY",
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("demo");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = async () => {
    const q = query.trim() || EXAMPLES[0];
    setRunning(true);
    setCurrentStep(0);
    setDoneSteps([]);
    try {
      let idx = 0;
      for await (const update of streamAnalysis(q, "demo-energy", mode)) {
        if (update.status === "done" && update.data) {
          sessionStorage.setItem("sentry_analysis", JSON.stringify(update.data));
          router.push("/dashboard");
          return;
        }
        setDoneSteps((p) => [...p, idx - 1].filter((s) => s >= 0));
        setCurrentStep(idx);
        idx++;
      }
    } catch {
      setRunning(false);
      setCurrentStep(-1);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <Navbar
        mode={mode}
        onModeChange={(m) => setMode(m)}
        activeTab="RUN ANALYSIS"
        onTabChange={(tab) => {
          if (tab === "OVERVIEW") router.push("/dashboard");
        }}
      />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        {!running ? (
          <div style={{ width: "100%", maxWidth: 680 }}>
            {/* Terminal Card */}
            <div style={{ background: "#0c0f16", border: "1px solid var(--border-mid)", borderRadius: 2, padding: "28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#fff" }}>
                    SENTRY // LIVE QUERY TERMINAL
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    EXECUTE MULTI-AGENT SHOCK &amp; RISK DECOMPOSITION
                  </div>
                </div>
                <span className="badge-active-terminal">SYSTEM READY</span>
              </div>

              {/* Text Input */}
              <div style={{ marginBottom: 16 }}>
                <div className="matrix-cell-label" style={{ marginBottom: 8 }}>
                  ENTER SCENARIO OR PORTFOLIO SHOCK QUERY:
                </div>
                <textarea
                  ref={textRef}
                  className="query-box-terminal"
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={EXAMPLES[0]}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun();
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                  [CTRL + ENTER TO EXECUTE]
                </span>
                <button
                  id="run-analysis-btn"
                  onClick={handleRun}
                  className="btn-terminal-action"
                  style={{ padding: "8px 20px" }}
                >
                  [ EXECUTE ANALYSIS QUERY ] &gt;
                </button>
              </div>

              {/* Presets */}
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                <div className="matrix-cell-label" style={{ marginBottom: 10 }}>PRE-CONFIGURED BENCHMARK SCENARIOS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(ex);
                        textRef.current?.focus();
                      }}
                      className="chip-terminal"
                      style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ color: "var(--term-teal)", fontWeight: 700 }}>0{i + 1}</span>
                      <span>{ex}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Execution Trace Progress */
          <div style={{ width: "100%", maxWidth: 620 }}>
            <div style={{ background: "#0c0f16", border: "1px solid var(--border-mid)", borderRadius: 2, padding: "28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 14 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--term-teal)" }}>
                  EXECUTING AGENT SWARM TELEMETRY...
                </div>
                <span className="badge-active-tracking">ONLINE</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STEPS.map((step, idx) => {
                  const done = doneSteps.includes(idx);
                  const active = currentStep === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: active ? "#121722" : "#090b10",
                        border: `1px solid ${active ? "var(--term-teal-border)" : "var(--border-subtle)"}`,
                        borderRadius: 2,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                      }}
                    >
                      <span style={{ color: done ? "var(--term-teal)" : active ? "#fff" : "var(--text-muted)" }}>
                        {step}
                      </span>
                      <span style={{ color: done ? "var(--term-teal)" : active ? "var(--term-amber)" : "var(--text-faint)", fontWeight: 700 }}>
                        {done ? "[✓ COMPLETE]" : active ? "[RUNNING...]" : "[PENDING]"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
