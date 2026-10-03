import { AnalysisResponse } from "@/types/analysis";

export const MOCK_ANALYSIS: AnalysisResponse = {
  query: "Analyze the impact of a Category 4 hurricane in the Gulf of Mexico on my energy portfolio",
  portfolio_id: "demo-energy",
  timestamp: new Date().toISOString(),

  event: {
    type: "hurricane",
    name: "Hurricane Delta-7",
    severity: 4,
    location: "Gulf of Mexico",
    description:
      "A Category 4 hurricane forming in the central Gulf of Mexico, threatening major offshore energy infrastructure along the Texas and Louisiana coasts.",
  },

  weather: {
    event_type: "hurricane",
    severity: 4,
    severity_score: 0.91,
    wind_speed: 145,
    affected_regions: ["Texas", "Louisiana", "Mississippi", "Alabama"],
    affected_sectors: ["Energy", "Insurance", "Transportation"],
    forecast_duration_days: 5,
    coordinates: { lat: 25.5, lon: -90.2 },
    timestamp: new Date().toISOString(),
  },

  news: {
    overall_sentiment: -0.72,
    article_count: 18,
    sentiment_label: "negative",
    articles: [
      {
        id: "news_001",
        title: "Gulf refinery shutdowns imminent as Hurricane Delta-7 strengthens to Cat 4",
        source: "Reuters Energy",
        published_at: new Date(Date.now() - 3600000).toISOString(),
        sentiment: -0.88,
        sentiment_label: "negative",
        tickers: ["XOM", "CVX", "OXY"],
        sector: "Energy",
        text: "Major refineries along the Gulf Coast are beginning precautionary shutdowns as the storm intensifies...",
      },
      {
        id: "news_002",
        title: "Offshore oil platforms evacuated ahead of Gulf storm",
        source: "Bloomberg Markets",
        published_at: new Date(Date.now() - 7200000).toISOString(),
        sentiment: -0.81,
        sentiment_label: "negative",
        tickers: ["XOM", "CVX", "COP"],
        sector: "Energy",
        text: "Offshore production facilities have begun evacuation procedures as a precautionary measure...",
      },
      {
        id: "news_003",
        title: "Energy futures rise on supply disruption fears",
        source: "WSJ Markets",
        published_at: new Date(Date.now() - 5400000).toISOString(),
        sentiment: 0.34,
        sentiment_label: "positive",
        tickers: ["USO", "XOM"],
        sector: "Energy",
        text: "Crude oil futures surged 3.2% as traders priced in potential supply disruptions from the Gulf...",
      },
      {
        id: "news_004",
        title: "ExxonMobil halts Gulf of Mexico operations",
        source: "FT Energy",
        published_at: new Date(Date.now() - 9000000).toISOString(),
        sentiment: -0.74,
        sentiment_label: "negative",
        tickers: ["XOM"],
        sector: "Energy",
        text: "ExxonMobil confirmed it has initiated shutdown procedures for its offshore Gulf operations...",
      },
      {
        id: "news_005",
        title: "Hurricane forecast update: Delta-7 maintains Category 4 intensity",
        source: "National Hurricane Center",
        published_at: new Date(Date.now() - 1800000).toISOString(),
        sentiment: -0.03,
        sentiment_label: "neutral",
        sector: "Weather",
        text: "The National Hurricane Center confirms Delta-7 remains a Category 4 hurricane with 145 mph winds...",
      },
    ],
  },

  market: {
    timestamp: new Date().toISOString(),
    sector_performance: {
      Energy: -0.038,
      Technology: 0.012,
      Finance: -0.008,
      Healthcare: 0.003,
    },
    assets: [
      { ticker: "XOM", name: "ExxonMobil", price: 116.82, change_1d: -0.041, change_7d: -0.051, volume: 18234567, sector: "Energy" },
      { ticker: "CVX", name: "Chevron", price: 154.30, change_1d: -0.032, change_7d: -0.044, volume: 12456789, sector: "Energy" },
      { ticker: "OXY", name: "Occidental Petroleum", price: 61.45, change_1d: -0.058, change_7d: -0.072, volume: 9876543, sector: "Energy" },
      { ticker: "COP", name: "ConocoPhillips", price: 108.20, change_1d: -0.029, change_7d: -0.038, volume: 7654321, sector: "Energy" },
      { ticker: "USO", name: "US Oil Fund", price: 78.90, change_1d: 0.031, change_7d: 0.018, volume: 5432109, sector: "Commodities" },
      { ticker: "SPY", name: "S&P 500 ETF", price: 512.40, change_1d: -0.011, change_7d: 0.004, volume: 98765432, sector: "Index" },
    ],
  },

  historical: {
    count: 7,
    aggregate_impact: { mean: -0.061, median: -0.058, worst: -0.104, best: -0.021 },
    matches: [
      { event_id: "hurricane_2021_ida", event_name: "Hurricane Ida", similarity: 0.91, date: "2021-08-29", location: "Gulf of Mexico", severity: 4, sector_impact: -0.064, description: "Category 4 hurricane causing major offshore production disruption" },
      { event_id: "hurricane_2020_laura", event_name: "Hurricane Laura", similarity: 0.84, date: "2020-08-27", location: "Gulf of Mexico", severity: 4, sector_impact: -0.052, description: "Category 4 landfall near Lake Charles, Louisiana" },
      { event_id: "hurricane_2017_harvey", event_name: "Hurricane Harvey", similarity: 0.78, date: "2017-08-25", location: "Gulf Coast, Texas", severity: 4, sector_impact: -0.071, description: "Catastrophic Category 4 hurricane causing widespread refinery shutdowns" },
      { event_id: "hurricane_2008_ike", event_name: "Hurricane Ike", similarity: 0.71, date: "2008-09-13", location: "Gulf of Mexico", severity: 2, sector_impact: -0.089, description: "Caused massive power outages and refinery disruptions across the Gulf Coast" },
      { event_id: "hurricane_2005_katrina", event_name: "Hurricane Katrina", similarity: 0.68, date: "2005-08-29", location: "Gulf of Mexico", severity: 5, sector_impact: -0.104, description: "Most destructive hurricane in Gulf history, energy sector severely impacted" },
      { event_id: "hurricane_2018_michael", event_name: "Hurricane Michael", similarity: 0.62, date: "2018-10-10", location: "Gulf Coast, Florida", severity: 5, sector_impact: -0.038, description: "Category 5 hurricane with regional energy impact" },
      { event_id: "hurricane_2004_ivan", event_name: "Hurricane Ivan", similarity: 0.57, date: "2004-09-16", location: "Gulf of Mexico", severity: 3, sector_impact: -0.021, description: "Disrupted offshore production for several weeks" },
    ],
  },

  macro: {
    indicators: [
      { indicator: "US Inflation (CPI)", value: 3.1, previous: 3.0, change: 0.1, unit: "%" },
      { indicator: "Fed Funds Rate", value: 5.25, previous: 5.25, change: 0.0, unit: "%" },
      { indicator: "WTI Crude Oil", value: 83.40, previous: 80.20, change: 3.2, unit: "USD/bbl" },
      { indicator: "USD Index (DXY)", value: 104.2, previous: 103.8, change: 0.4, unit: "pts" },
      { indicator: "10Y Treasury Yield", value: 4.62, previous: 4.58, change: 0.04, unit: "%" },
    ],
  },

  risk: {
    risk_score: 82,
    risk_level: "HIGH",
    confidence: 0.87,
    portfolio_impact: -0.0284,
    sector_exposure: { Energy: 0.49, Technology: 0.51 },
    key_risk_drivers: [
      "49% portfolio concentration in Energy sector",
      "Weather severity score of 91% (Category 4)",
      "Historical median energy impact of -5.8% from comparable events",
      "News sentiment strongly negative at -0.72",
      "Offshore production shutdowns already initiated",
      "Gulf region accounts for 18% of US crude oil production",
    ],
    asset_risk: [
      { ticker: "XOM", name: "ExxonMobil", weight: 0.245, scenario_impact: -0.061, portfolio_contribution: -0.015, sector: "Energy" },
      { ticker: "CVX", name: "Chevron", weight: 0.198, scenario_impact: -0.052, portfolio_contribution: -0.013, sector: "Energy" },
      { ticker: "OXY", name: "Occidental", weight: 0.047, scenario_impact: -0.071, portfolio_contribution: -0.005, sector: "Energy" },
    ],
    scenarios: { mild: -0.0098, base: -0.0284, severe: -0.0466, extreme: -0.0810 },
  },

  scenarios: { mild: -0.0098, base: -0.0284, severe: -0.0466, extreme: -0.0810 },

  strategy: {
    type: "HEDGE",
    urgency: "HIGH",
    reason:
      "Given 49% energy sector exposure, Category 4 severity, and strong historical precedent showing -5.8% median energy sector impact from comparable Gulf hurricanes, immediate hedging action is recommended to protect portfolio value.",
    actions: [
      "Consider energy sector put options or inverse ETF positions (DRIP) as near-term hedge",
      "Increase USO exposure as oil supply disruption may elevate crude prices",
      "Review XOM/CVX position sizes — combined 44.3% portfolio weight creates concentration risk",
      "Monitor production restoration timeline post-storm for rebalancing trigger",
      "Set stop-loss alerts on OXY (-15%) due to higher Gulf exposure",
    ],
    evidence_summary: [
      "7 comparable historical hurricane events analyzed",
      "18 relevant news signals processed (sentiment: -0.72)",
      "Weather severity score: 91% (Category 4, 145 mph winds)",
      "Affected regions: TX, LA, MS, AL — core offshore production corridor",
      "Historical median energy sector impact: -5.8%",
    ],
  },

  agent_trace: {
    total_duration_ms: 4280,
    steps: [
      { agent: "Supervisor Agent", status: "completed", latency_ms: 120, sources: ["User Query Parser"], timestamp: new Date(Date.now() - 4200).toISOString(), input: { query: "Gulf hurricane energy portfolio analysis" }, output: { plan: ["WeatherAgent", "NewsAgent", "HistoricalAgent", "MarketAgent", "RiskEngine", "StrategyAgent"] } },
      { agent: "Weather Agent", status: "completed", latency_ms: 420, sources: ["NOAA Weather API", "Redis Cache"], timestamp: new Date(Date.now() - 3800).toISOString(), output: { event_type: "hurricane", severity: 4, severity_score: 0.91 } },
      { agent: "News Agent", status: "completed", latency_ms: 680, sources: ["Reuters", "Bloomberg", "WSJ", "FT"], timestamp: new Date(Date.now() - 3200).toISOString(), output: { article_count: 18, overall_sentiment: -0.72 } },
      { agent: "Historical Agent", status: "completed", latency_ms: 890, sources: ["Qdrant Vector DB", "PostgreSQL"], timestamp: new Date(Date.now() - 2500).toISOString(), output: { matches: 7, median_impact: -0.058 } },
      { agent: "Market Agent", status: "completed", latency_ms: 350, sources: ["AlphaVantage API", "Redis Cache"], timestamp: new Date(Date.now() - 2200).toISOString(), output: { assets_fetched: 6, sector_impact: -0.038 } },
      { agent: "Risk Engine", status: "completed", latency_ms: 760, sources: ["Portfolio DB", "Risk Models"], timestamp: new Date(Date.now() - 1200).toISOString(), output: { risk_score: 82, confidence: 0.87, portfolio_impact: -0.0284 } },
      { agent: "Strategy Agent", status: "completed", latency_ms: 540, sources: ["LLM Reasoning", "Evidence Package"], timestamp: new Date(Date.now() - 500).toISOString(), output: { type: "HEDGE", urgency: "HIGH" } },
    ],
  },
};
