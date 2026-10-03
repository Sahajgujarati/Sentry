import { AnalysisResponse } from "@/types/analysis";
import { MOCK_ANALYSIS } from "@/lib/mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Mode = "live" | "demo";

/**
 * Run an analysis query against Person 1's orchestrator.
 * Falls back to mock data in demo mode or on API failure.
 */
export async function runAnalysis(
  query: string,
  portfolioId: string = "demo-energy",
  mode: Mode = "demo"
): Promise<AnalysisResponse> {
  if (mode === "demo") {
    // Simulate realistic processing delay in demo mode
    await new Promise((r) => setTimeout(r, 3500));
    return { ...MOCK_ANALYSIS, query, timestamp: new Date().toISOString() };
  }

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, portfolio_id: portfolioId }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[api] Live mode failed, falling back to demo:", err);
    await new Promise((r) => setTimeout(r, 2000));
    return { ...MOCK_ANALYSIS, query, timestamp: new Date().toISOString() };
  }
}

/**
 * Stream analysis with step-by-step agent updates (SSE endpoint).
 * Falls back to polling-simulation in demo mode.
 */
export async function* streamAnalysis(
  query: string,
  portfolioId: string = "demo-energy",
  mode: Mode = "demo"
): AsyncGenerator<{ step: string; status: "running" | "done"; data?: AnalysisResponse }> {
  const steps = [
    "Parsing query and identifying event",
    "Fetching weather intelligence",
    "Analyzing news signals",
    "Retrieving historical events",
    "Fetching market data",
    "Calculating portfolio risk",
    "Generating strategy recommendation",
  ];

  for (const step of steps) {
    yield { step, status: "running" };
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
  }

  const result = await runAnalysis(query, portfolioId, mode);
  yield { step: "Analysis complete", status: "done", data: result };
}

/** Fetch portfolio summary (stub — connect to Person 2's endpoint) */
export async function getPortfolio(portfolioId: string) {
  if (process.env.NODE_ENV === "development") {
    return { id: portfolioId, name: "Energy Demo Portfolio", total_value: 1000000 };
  }
  const res = await fetch(`${API_BASE}/api/portfolio/${portfolioId}`);
  return res.json();
}
