import { AnalysisResponse, ExecutionStep, TerminalAnalysisData } from "@/types/analysis";
import { MOCK_ANALYSIS_DATA } from "@/lib/mock-analysis";

/**
 * Standard execution pipeline steps matching Sentry multi-agent architecture
 */
export const DEFAULT_EXECUTION_STEPS: ExecutionStep[] = [
  {
    id: "step-1",
    label: "Query interpreted",
    agent: "ORCHESTRATOR",
    status: "pending",
    duration_ms: 180,
  },
  {
    id: "step-2",
    label: "Event identified",
    agent: "SUPERVISOR",
    status: "pending",
    duration_ms: 220,
  },
  {
    id: "step-3",
    label: "Weather intelligence collected",
    agent: "WEATHER AGENT",
    status: "pending",
    duration_ms: 420,
  },
  {
    id: "step-4",
    label: "News intelligence analyzed",
    agent: "NEWS AGENT",
    status: "pending",
    duration_ms: 380,
  },
  {
    id: "step-5",
    label: "Historical events retrieved",
    agent: "HISTORICAL AGENT",
    status: "pending",
    duration_ms: 310,
  },
  {
    id: "step-6",
    label: "Market signals collected",
    agent: "MARKET AGENT",
    status: "pending",
    duration_ms: 260,
  },
  {
    id: "step-7",
    label: "Portfolio exposure calculated",
    agent: "EXPOSURE ENGINE",
    status: "pending",
    duration_ms: 190,
  },
  {
    id: "step-8",
    label: "Risk scenarios simulated",
    agent: "RISK ENGINE",
    status: "pending",
    duration_ms: 340,
  },
  {
    id: "step-9",
    label: "Strategy synthesized",
    agent: "STRATEGY AGENT",
    status: "pending",
    duration_ms: 450,
  },
];

/**
 * Maps query keywords to specific deterministic scenario datasets
 */
export function resolveScenarioForQuery(query: string): TerminalAnalysisData | null {
  const normalized = query.toLowerCase().trim();

  // 1. Hurricane / Energy / Gulf Shock
  if (
    normalized.includes("hurricane") ||
    normalized.includes("gulf") ||
    normalized.includes("katrina") ||
    normalized.includes("energy portfolio") ||
    normalized.includes("stress test") ||
    normalized.includes("energy holdings") ||
    normalized.includes("energy sector")
  ) {
    return MOCK_ANALYSIS_DATA;
  }

  // 2. Interest Rate / Technology / Fed Shock
  if (
    normalized.includes("interest") ||
    normalized.includes("rate") ||
    normalized.includes("fed") ||
    normalized.includes("technology") ||
    normalized.includes("tech")
  ) {
    return {
      ...MOCK_ANALYSIS_DATA,
      event: {
        id: "EVT-2026-1082",
        type: "MONETARY_SHOCK",
        name: "Emergency Rate Shock",
        category: "MONETARY POLICY RATE SHOCK",
        severity: 0.78,
        location: "Federal Reserve Board / US Domestic",
        headline: "EMERGENCY 50BPS RATE HIKE — TECH VALUATION COMPRESSION",
        summary:
          "Federal Reserve announces surprise inter-meeting 50bps benchmark adjustment following unexpected inflation surge. Duration-sensitive assets experience rapid multiple compression.",
        timestamp: "2026-10-03T11:45:00Z",
        affected_sector: "TECHNOLOGY",
        status: "ACTIVE_TRACKING",
      },
      risk: {
        ...MOCK_ANALYSIS_DATA.risk,
        risk_score: 54.8,
        risk_level: "HIGH",
        confidence: 0.95,
        portfolio_impact: -0.0342,
        estimated_dollar_loss: -33516,
        technology_exposure_pct: 0.51,
        energy_exposure_pct: 0.49,
        audit_factors: [
          {
            factor: "Technology Sector Exposure",
            weight: "51.0%",
            value: "51.0% portfolio weight",
            direction: "NEGATIVE",
            detail: "High-duration growth technology assets suffer steep multiple discount rates under front-loaded tightening.",
          },
          {
            factor: "Yield Curve Contagion",
            weight: "78.0%",
            value: "2Y Treasury +42bps intraday",
            direction: "NEGATIVE",
            detail: "Short-term sovereign yields spike, triggering institutional rotation from high P/E tech to cash equivalents.",
          },
          {
            factor: "Historical Fed Shocks",
            weight: "-4.6%",
            value: "-4.60% median 5-day tech drag",
            direction: "NEGATIVE",
            detail: "5 prior emergency rate actions produced an average 5-day Nasdaq drawdown of -4.6%.",
          },
          {
            factor: "Earnings Multiples Compression",
            weight: "-0.65",
            value: "-0.65 multiple degradation",
            direction: "NEGATIVE",
            detail: "Discounted cash flow model projections contract forward enterprise valuations.",
          },
          {
            factor: "Intraday Market Divergence",
            weight: "-2.9%",
            value: "-2.90% tech sector tick drag",
            direction: "NEGATIVE",
            detail: "Broad semiconductor and software equities decline against defensive sectors.",
          },
        ],
      },
      scenarios: {
        mild: -0.0125,
        base: -0.0342,
        severe: -0.058,
        breakdown: [
          {
            id: "mild",
            name: "MILD",
            impact_pct: -0.0125,
            dollar_loss: -12250,
            projected_value: 967750,
            description: "Yield curve steepening stabilizes quickly; mega-cap tech cash reserves cushion multiple contraction.",
            probability: 0.25,
          },
          {
            id: "base",
            name: "BASE",
            impact_pct: -0.0342,
            dollar_loss: -33516,
            projected_value: 946484,
            description: "High-multiple software multiples compress 1.8x; tech weighting yields -3.42% portfolio drag.",
            probability: 0.55,
          },
          {
            id: "severe",
            name: "SEVERE",
            impact_pct: -0.058,
            dollar_loss: -56840,
            projected_value: 923160,
            description: "Sustained credit spread widening and second-round venture tech debt liquidation.",
            probability: 0.2,
          },
        ],
      },
      strategy: {
        type: "REBALANCE",
        title: "DURATION DE-RISKING & TACTICAL ROTATION",
        urgency: "HIGH",
        reason: "51% tech allocation exposes portfolio to acute discount-rate vulnerability during abrupt rate tightening.",
        hedging_vehicles: [
          "Enter QQQ inverse hedge or bear put spreads (30-day expiry)",
          "Rebalance 12% tech capital into ultra-short 3-month Treasury bills",
          "Harvest capital gains on high-beta semiconductor holdings",
        ],
        recommended_allocation_pct: 12.0,
      },
    };
  }

  // 3. Oil / Supply Shock / Hormuz / Crude
  if (
    normalized.includes("oil") ||
    normalized.includes("supply") ||
    normalized.includes("hormuz") ||
    normalized.includes("crude")
  ) {
    return {
      ...MOCK_ANALYSIS_DATA,
      event: {
        id: "EVT-2026-0814",
        type: "GEOPOLITICAL_SUPPLY",
        name: "Strait of Hormuz Supply Chokepoint Disruption",
        category: "GEOPOLITICAL SUPPLY SHOCK",
        severity: 0.88,
        location: "Strait of Hormuz / Persian Gulf",
        headline: "CRUDE SUPPLY DISRUPTION — CRITICAL MARITIME CHOKEPOINT",
        summary:
          "Escalating maritime interdictions stall approximately 18.5M bpd crude transit. Spot Brent futures spike +9.2% in pre-market trading with refinery run cuts impending.",
        timestamp: "2026-10-03T11:45:00Z",
        affected_sector: "ENERGY & LOGISTICS",
        status: "ACTIVE_TRACKING",
      },
      risk: {
        ...MOCK_ANALYSIS_DATA.risk,
        risk_score: 68.4,
        risk_level: "HIGH",
        confidence: 0.98,
        portfolio_impact: -0.0195,
        estimated_dollar_loss: -19110,
        energy_exposure_pct: 0.49,
        technology_exposure_pct: 0.51,
        audit_factors: [
          {
            factor: "Energy Sector Upstream Exposure",
            weight: "49.0%",
            value: "49.0% total allocation",
            direction: "POSITIVE",
            detail: "Upstream producers benefit from crude price surge (+9.2%), offsetting refinery margin headwinds.",
          },
          {
            factor: "Global Supply Deficit Severity",
            weight: "88.0%",
            value: "18.5M bpd capacity impaired",
            direction: "NEGATIVE",
            detail: "Chokepoint transit delays trigger global shipping insurance rate spikes and broader supply chain friction.",
          },
          {
            factor: "Historical Oil Shock Analog",
            weight: "+3.8% / -5.2%",
            value: "Mixed energy vs broad market",
            direction: "NEGATIVE",
            detail: "Historical supply disruptions produce acute sector dispersion: upstream oil surges while broader equity multiples compress.",
          },
          {
            factor: "Commodity Volatility Index (OVX)",
            weight: "+44.1%",
            value: "OVX spiked to 38.6",
            direction: "NEGATIVE",
            detail: "Extreme option implied volatility increases portfolio tail risk and hedging costs.",
          },
          {
            factor: "Cross-Sector Contagion",
            weight: "-2.4%",
            value: "Non-energy holdings drag",
            direction: "NEGATIVE",
            detail: "Consumer and tech holdings experience margin compression due to surging corporate energy inputs.",
          },
        ],
      },
      scenarios: {
        mild: 0.0084,
        base: -0.0195,
        severe: -0.0482,
        breakdown: [
          {
            id: "mild",
            name: "MILD",
            impact_pct: 0.0084,
            dollar_loss: 8232,
            projected_value: 988232,
            description: "Chokepoint security restored within 72h; upstream energy gains exceed minor broader market drag.",
            probability: 0.3,
          },
          {
            id: "base",
            name: "BASE",
            impact_pct: -0.0195,
            dollar_loss: -19110,
            projected_value: 960890,
            description: "Sustained 2-week standoff; oil rally (+9%) offset by broader index multiple compression (-4%).",
            probability: 0.5,
          },
          {
            id: "severe",
            name: "SEVERE",
            impact_pct: -0.0482,
            dollar_loss: -47236,
            projected_value: 932764,
            description: "Protracted regional conflict, crude reaches $125/bbl triggering global stagflationary shock.",
            probability: 0.2,
          },
        ],
      },
      strategy: {
        type: "HEDGE",
        title: "BARBELL COMMODITY SPREAD & BROADER INDEX HEDGE",
        urgency: "HIGH",
        reason: "Surging crude prices provide partial revenue cushion to energy holdings but expose remaining 51% portfolio to acute margin contraction.",
        hedging_vehicles: [
          "Maintain overweight upstream energy (XOM, CVX) to capture spot crack spreads",
          "Initiate SPY/QQQ macro put options to hedge systemic equity drawdown",
          "Establish Brent crude call spread overlays to cap input inflation risk",
        ],
        recommended_allocation_pct: 7.5,
      },
    };
  }

  // 4. Return null for completely unmapped queries (Requirement 9)
  return null;
}

/**
 * Main Analysis API interface.
 * Supports both deterministic simulated demo mode and live POST /api/analyze backend integration with graceful fallback.
 */
export async function analyzeQuery(
  query: string,
  onProgress?: (stepIndex: number, step: ExecutionStep) => void,
  forceLiveMode: boolean = false
): Promise<AnalysisResponse> {
  const isLiveConfigured =
    forceLiveMode ||
    process.env.NEXT_PUBLIC_ENABLE_LIVE_API === "true" ||
    process.env.NEXT_PUBLIC_BACKEND_URL !== undefined;

  const steps = [...DEFAULT_EXECUTION_STEPS];

  // Progressive loop through execution steps
  for (let i = 0; i < steps.length; i++) {
    const current = steps[i];
    current.status = "running";
    if (onProgress) onProgress(i, { ...current });

    const delay = current.duration_ms || 220;
    await new Promise((res) => setTimeout(res, delay));

    current.status = "completed";
    current.timestamp = new Date().toISOString();
    if (onProgress) onProgress(i, { ...current });
  }

  // Attempt live backend fetch if configured
  if (isLiveConfigured) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const liveData: AnalysisResponse = await res.json();
        return {
          ...liveData,
          execution_steps: steps,
        };
      }
    } catch {
      // Graceful fallback to deterministic demo mode if backend is offline
    }
  }

  // Deterministic Demo Mode Resolution
  const analysisData = resolveScenarioForQuery(query);

  if (!analysisData) {
    return {
      success: false,
      query,
      error: "DEMO DATASET NOT AVAILABLE: No pre-configured demo dataset exists for this query. Available demo scenarios: Hurricane Energy Shock, Oil Supply Shock, Interest Rate Shock.",
      execution_steps: steps,
    };
  }

  return {
    success: true,
    query,
    data: analysisData,
    execution_steps: steps,
  };
}

