"use client";
import { useState } from "react";
import { NewsData, NewsArticle } from "@/types/analysis";

const SENTIMENT_CONFIG = {
  positive: { color: "var(--accent-emerald)", label: "POSITIVE", bg: "var(--accent-emerald-glow)" },
  negative: { color: "var(--accent-rose)", label: "NEGATIVE", bg: "var(--accent-rose-glow)" },
  neutral: { color: "var(--text-muted)", label: "NEUTRAL", bg: "var(--bg-elevated)" },
};

interface NewsPanelProps {
  news: NewsData;
}

export default function NewsPanel({ news }: NewsPanelProps) {
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all"
    ? news.articles
    : news.articles.filter((a) => a.sentiment_label === filter);

  const sentimentColor = news.overall_sentiment < -0.3
    ? "var(--accent-rose)"
    : news.overall_sentiment > 0.3
    ? "var(--accent-emerald)"
    : "var(--accent-amber)";

  const sentimentLabel = news.overall_sentiment < -0.3 ? "BEARISH" : news.overall_sentiment > 0.3 ? "BULLISH" : "MIXED";

  return (
    <div className="card" style={{ animation: "fadeInUp 0.5s 0.1s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>NEWS INTELLIGENCE</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Signal Analysis</div>
        </div>
        <span className="badge badge-amber">{news.article_count} articles</span>
      </div>

      {/* Sentiment summary */}
      <div style={{
        display: "flex",
        gap: 12,
        padding: 16,
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-md)",
        marginBottom: 20,
        border: "1px solid var(--border-subtle)",
      }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: 4 }}>OVERALL SENTIMENT</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: sentimentColor, fontFamily: "Outfit" }}>
            {news.overall_sentiment.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: sentimentColor, fontWeight: 600, letterSpacing: "0.06em", marginTop: 2 }}>
            {sentimentLabel}
          </div>
        </div>

        <div style={{ width: 1, background: "var(--border-subtle)" }}/>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
          {(["negative", "neutral", "positive"] as const).map((s) => {
            const count = news.articles.filter((a) => a.sentiment_label === s).length;
            const pct = Math.round((count / news.article_count) * 100);
            const cfg = SENTIMENT_CONFIG[s];
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, width: 56, color: cfg.color, fontWeight: 600 }}>{s.toUpperCase()}</span>
                <div style={{ flex: 1, height: 4, background: "var(--bg-card)", borderRadius: 2 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: cfg.color, borderRadius: 2 }}/>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", width: 24, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["all", "negative", "neutral", "positive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              cursor: "pointer",
              border: "1px solid",
              transition: "all 0.15s",
              ...(filter === f
                ? f === "all"
                  ? { background: "var(--accent-primary)", color: "white", borderColor: "var(--accent-primary)" }
                  : { background: SENTIMENT_CONFIG[f].bg, color: SENTIMENT_CONFIG[f].color, borderColor: SENTIMENT_CONFIG[f].color + "50" }
                : { background: "transparent", color: "var(--text-muted)", borderColor: "var(--border-subtle)" }
              ),
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Articles list */}
      <div style={{ maxHeight: 400, overflowY: "auto" }} className="scrollable">
        {filtered.map((article) => {
          const cfg = SENTIMENT_CONFIG[article.sentiment_label];
          const isExp = expanded === article.id;
          return (
            <div
              key={article.id}
              onClick={() => setExpanded(isExp ? null : article.id)}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                marginBottom: 8,
                cursor: "pointer",
                background: isExp ? "var(--bg-elevated)" : "var(--bg-surface)",
                border: `1px solid ${isExp ? cfg.color + "30" : "var(--border-subtle)"}`,
                borderLeft: `3px solid ${cfg.color}`,
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 4 }}>
                    {article.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{article.source}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {new Date(article.published_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {article.tickers && article.tickers.map((t) => (
                      <span key={t} style={{
                        fontSize: 10, fontWeight: 700, color: "var(--accent-primary)",
                        background: "var(--accent-primary-glow)", borderRadius: 4, padding: "1px 6px",
                        fontFamily: "JetBrains Mono",
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: cfg.color, fontFamily: "JetBrains Mono" }}>
                    {article.sentiment > 0 ? "+" : ""}{article.sentiment.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
                </div>
              </div>

              {isExp && article.text && (
                <div style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid var(--border-subtle)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  animation: "fadeIn 0.2s ease",
                }}>
                  {article.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
