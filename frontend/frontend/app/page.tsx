"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { streamAnalysis, Mode } from "@/lib/api";

const EXAMPLES = [
  "Hurricane impact on energy portfolio",
  "Fed rate hike effect on tech stocks",
  "Oil supply shock analysis",
  "Rising inflation on mixed portfolio",
];

const STEPS = [
  "Parsing query and identifying event",
  "Fetching weather intelligence",
  "Analyzing news signals",
  "Retrieving historical events from Vector DB",
  "Fetching real-time market data",
  "Calculating portfolio risk exposure",
  "Generating strategy recommendation",
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
    <div className="landing-wrap page-enter">
      <div className="landing-glow" />

      {!running ? (
        <div style={{ width: "100%", maxWidth: 660, animation: "fadeInUp 0.5s ease" }}>
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 68, height: 68, borderRadius: 18,
              background: "linear-gradient(135deg, #00f5ff, #b026ff)",
              boxShadow: "0 0 35px rgba(0, 245, 255, 0.6), 0 0 60px rgba(176, 38, 255, 0.4)",
              marginBottom: 20,
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <h1 style={{
                fontSize: 38, fontWeight: 900,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #ffffff, #00f5ff 60%, #b026ff 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 25px rgba(0, 245, 255, 0.4))",
              }}>Sentry AI</h1>
            </div>
            <p style={{ fontSize: 14, color: "var(--cyan)", letterSpacing: "0.04em", fontWeight: 500, textShadow: "0 0 10px rgba(0,245,255,0.4)" }}>
              FINANCIAL INTELLIGENCE &amp; RISK TERMINAL
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 }}>
              <div className="pulse-green" />
              <span style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700, textShadow: "0 0 10px rgba(0,255,136,0.4)" }}>5 Autonomous Agents Active</span>
            </div>
          </div>

          {/* Card */}
          <div className="landing-card">
            {/* Mode toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Analysis Mode</span>
              <div className="mode-toggle">
                <button className={`mode-btn ${mode === "demo" ? "active-demo" : ""}`} onClick={() => setMode("demo")}>Demo</button>
                <button className={`mode-btn ${mode === "live" ? "active-live" : ""}`} onClick={() => setMode("live")}>● Live</button>
              </div>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>
                Query
              </div>
              <textarea
                ref={textRef}
                className="query-input"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={EXAMPLES[0]}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun(); }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>⌘ + Enter to run</span>
              <button id="run-analysis-btn" className="run-btn" onClick={handleRun}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run Analysis
              </button>
            </div>

            {/* Divider */}
            <div className="sep" />

            {/* Quick examples */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 10 }}>
              Quick Examples
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} className="example-chip" onClick={() => { setQuery(ex); textRef.current?.focus(); }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Powered by agents */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Powered by Multi-Agent AI
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {["Weather Agent", "News Agent", "Historical Agent", "Risk Engine", "Strategy Agent"].map((a) => (
                <span key={a} style={{
                  padding: "4px 10px", borderRadius: 100,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  fontSize: 11, color: "var(--text-3)",
                }}>{a}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Running state */
        <div style={{ width: "100%", maxWidth: 520, animation: "fadeInUp 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: "pulse 1s infinite" }}>🧠</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Analyzing Event...
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 380, margin: "0 auto" }}>
              {query || EXAMPLES[0]}
            </p>
          </div>
          <div className="landing-card">
            {STEPS.map((step, idx) => {
              const done = doneSteps.includes(idx);
              const active = currentStep === idx;
              const pending = idx > currentStep;
              return (
                <div key={idx} className="step-item">
                  <div className={`step-circle ${done ? "done" : active ? "active" : ""}`}>
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : active ? (
                      <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--blue)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }}/>
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bg-elevated)" }}/>
                    )}
                  </div>
                  <span className={`step-label ${done ? "done" : active ? "active" : ""}`} style={{ opacity: pending ? 0.4 : 1 }}>
                    {step}
                  </span>
                  {done && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--emerald)", fontWeight: 600 }}>✓</span>}
                  {active && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--amber)" }}>running</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
