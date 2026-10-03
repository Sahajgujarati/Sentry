"use client";
import { useState } from "react";
import { NewsData } from "@/types/analysis";

interface NewsPanelProps {
  news: NewsData;
}

export default function NewsPanel({ news }: NewsPanelProps) {
  const [filter, setFilter] = useState<"all" | "negative" | "neutral" | "positive">("all");

  const filtered = filter === "all"
    ? news.articles
    : news.articles.filter((a) => a.sentiment_label === filter);

  return (
    <div className="terminal-panel-box">
      <div className="panel-title-bar">
        <span className="panel-title-text">NEWS &amp; SENTIMENT INTELLIGENCE</span>
        <span className="matrix-cell-val-mono">{news.article_count} BULLETINS</span>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["all", "negative", "neutral", "positive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="chip-terminal"
            style={{
              borderColor: filter === f ? "var(--term-teal)" : "var(--border-subtle)",
              color: filter === f ? "var(--term-teal)" : "var(--text-sub)",
              fontSize: 10,
              padding: "3px 8px",
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
        {filtered.map((article) => {
          const isNeg = article.sentiment < 0;
          return (
            <div
              key={article.id}
              style={{
                padding: "10px 12px",
                background: "#0c0f16",
                border: "1px solid var(--border-subtle)",
                borderRadius: 2,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
                  {article.title}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: isNeg ? "var(--term-red)" : "var(--term-teal)",
                  flexShrink: 0,
                }}>
                  {article.sentiment > 0 ? "+" : ""}{article.sentiment.toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                <span>{article.source}</span>
                <span>·</span>
                <span>{new Date(article.published_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                {article.tickers?.map((t) => (
                  <span key={t} style={{ color: "var(--term-teal)", background: "var(--term-teal-dim)", padding: "1px 4px", borderRadius: 2 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
