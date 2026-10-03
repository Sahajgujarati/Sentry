// ============================================================
// SENTRY AI — Type Definitions (Person 4)
// All types mirror Person 1's final analysis JSON contract
// ============================================================

export interface EventData {
  type: string;
  name: string;
  severity: number;
  location: string;
  description?: string;
}

export interface WeatherData {
  event_type: string;
  severity: number;
  severity_score: number;
  wind_speed?: number;
  affected_regions: string[];
  affected_sectors: string[];
  forecast_duration_days?: number;
  coordinates?: { lat: number; lon: number };
  timestamp?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url?: string;
  published_at: string;
  sentiment: number;
  sentiment_label: "positive" | "negative" | "neutral";
  tickers?: string[];
  sector?: string;
  text?: string;
}

export interface NewsData {
  articles: NewsArticle[];
  overall_sentiment: number;
  article_count: number;
  sentiment_label: "positive" | "negative" | "neutral";
}

export interface AssetMarket {
  ticker: string;
  name: string;
  price: number;
  change_1d: number;
  change_7d?: number;
  volume?: number;
  sector: string;
}

export interface MarketData {
  assets: AssetMarket[];
  sector_performance: Record<string, number>;
  timestamp?: string;
}

export interface HistoricalMatch {
  event_id: string;
  event_name: string;
  similarity: number;
  date: string;
  location?: string;
  severity?: number;
  sector_impact: number;
  description?: string;
}

export interface HistoricalData {
  matches: HistoricalMatch[];
  count: number;
  aggregate_impact: {
    mean: number;
    median: number;
    worst: number;
    best: number;
  };
}

export interface MacroIndicator {
  indicator: string;
  value: number;
  previous: number;
  change: number;
  unit?: string;
  timestamp?: string;
}

export interface MacroData {
  indicators: MacroIndicator[];
}

export interface AssetRisk {
  ticker: string;
  name: string;
  weight: number;
  scenario_impact: number;
  portfolio_contribution: number;
  sector: string;
}

export interface ScenarioData {
  mild: number;
  base: number;
  severe: number;
  extreme?: number;
}

export interface RiskReport {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  portfolio_impact: number;
  scenarios: ScenarioData;
  asset_risk: AssetRisk[];
  key_risk_drivers: string[];
  sector_exposure: Record<string, number>;
}

export interface StrategyData {
  type: "HOLD" | "HEDGE" | "REBALANCE" | "REDUCE" | "EXIT";
  reason: string;
  actions: string[];
  evidence_summary: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
}

export interface AgentStep {
  agent: string;
  status: "pending" | "running" | "completed" | "error";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  latency_ms?: number;
  sources?: string[];
  timestamp?: string;
}

export interface AgentTrace {
  steps: AgentStep[];
  total_duration_ms?: number;
}

export interface AnalysisResponse {
  query: string;
  portfolio_id?: string;
  event: EventData;
  weather: WeatherData;
  news: NewsData;
  market: MarketData;
  historical: HistoricalData;
  macro?: MacroData;
  risk: RiskReport;
  scenarios: ScenarioData;
  strategy: StrategyData;
  agent_trace: AgentTrace;
  timestamp: string;
}
