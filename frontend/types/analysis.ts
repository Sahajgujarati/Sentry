export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface EventDetails {
  id: string;
  type: string;
  name: string;
  category: string;
  severity: number;
  location: string;
  headline: string;
  summary: string;
  timestamp: string;
  affected_sector: string;
  status: "ACTIVE_TRACKING" | "MONITORING" | "RESOLVED";
}

export interface WeatherIntelligence {
  severity_score: number;
  max_wind_speed_mph: number;
  central_pressure_mb: number;
  storm_surge_ft: number;
  projected_landfall: string;
  offshore_platforms_threatened: number;
  status: string;
  source: string;
}

export interface NewsIntelligence {
  sentiment: number;
  sentiment_label: "BEARISH" | "NEUTRAL" | "BULLISH";
  article_count: number;
  top_headlines: {
    title: string;
    source: string;
    time_ago: string;
    sentiment: number;
  }[];
  urgency: "HIGH" | "MEDIUM" | "LOW";
}

export interface HistoricalIntelligence {
  similar_events: number;
  median_impact: number;
  mean_impact: number;
  max_drawdown: number;
  recovery_days_median: number;
  key_analogs: {
    name: string;
    year: number;
    category: number;
    impact_pct: number;
    recovery_days: number;
  }[];
}

export interface MarketIntelligence {
  energy_sector_movement: number;
  crude_oil_movement: number;
  sp500_movement: number;
  sector_performance: Record<string, number>;
  vix_level: number;
  vix_change_pct: number;
}

export interface ScenarioPoint {
  id: "mild" | "base" | "severe";
  name: string;
  impact_pct: number;
  dollar_loss: number;
  projected_value: number;
  description: string;
  probability: number;
}

export interface AssetHolding {
  ticker: string;
  name: string;
  sector: string;
  weight_pct: number;
  current_value: number;
  current_price: number;
  estimated_impact_pct: number;
  estimated_dollar_impact: number;
  risk_contribution_pct: number;
  risk_tier: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

export interface SectorExposure {
  sector: string;
  allocation_pct: number;
  value: number;
  is_affected: boolean;
}

export interface AgentTraceStep {
  id: string;
  agent_name: string;
  role: string;
  status: "COMPLETED" | "RUNNING" | "WAITING" | "ERROR";
  metric_label: string;
  metric_value: string;
  latency_ms: number;
  timestamp: string;
  summary: string;
}

export interface EvidenceSource {
  id: string;
  type: "HISTORICAL" | "NEWS" | "WEATHER" | "MARKET";
  title: string;
  source: string;
  timestamp: string;
  signal: string;
  relevance_score: number;
}

export interface RiskAnalysis {
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  confidence: number; // 0.0 - 1.0
  portfolio_impact: number; // fractional return e.g. -0.0284
  estimated_dollar_loss: number;
  portfolio_total_value: number;
  energy_exposure_pct: number;
  technology_exposure_pct: number;
  audit_factors: {
    factor: string;
    weight: string;
    value: string;
    direction: "NEGATIVE" | "NEUTRAL" | "POSITIVE";
    detail: string;
  }[];
}

export interface RecommendedStrategy {
  type: "HEDGE" | "REDUCE_EXPOSURE" | "HOLD" | "REBALANCE";
  title: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  hedging_vehicles: string[];
  recommended_allocation_pct: number;
}

export interface TerminalAnalysisData {
  event: EventDetails;
  weather: WeatherIntelligence;
  news: NewsIntelligence;
  market: MarketIntelligence;
  historical: HistoricalIntelligence;
  risk: RiskAnalysis;
  scenarios: {
    mild: number;
    base: number;
    severe: number;
    breakdown: ScenarioPoint[];
  };
  portfolio: {
    total_value: number;
    sectors: SectorExposure[];
    top_risk_contributors: AssetHolding[];
  };
  strategy: RecommendedStrategy;
  agent_trace: AgentTraceStep[];
  evidence: EvidenceSource[];
  meta: {
    model_version: string;
    engine_latency_ms: number;
    is_demo: boolean;
    computed_at: string;
    pipeline_status: "NOMINAL" | "DEGRADED" | "OFFLINE";
  };
}

export type AnalysisState = "idle" | "analyzing" | "complete" | "error";

export interface ExecutionStep {
  id: string;
  label: string;
  agent: string;
  status: "pending" | "running" | "completed";
  duration_ms?: number;
  timestamp?: string;
}

export interface AnalysisResponse {
  success: boolean;
  query: string;
  data?: TerminalAnalysisData;
  error?: string;
  execution_steps?: ExecutionStep[];
}
