import React from "react";
import { EvidenceSource } from "@/types/analysis";

interface EvidencePreviewProps {
  evidence: EvidenceSource[];
}

export const EvidencePreview: React.FC<EvidencePreviewProps> = ({ evidence }) => {
  return (
    <section id="evidence" className="border-b border-terminal-border bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-terminal-border gap-2">
          <div>
            <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-muted">
              GROUNDED EVIDENCE ATTESTATION
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-terminal-text uppercase font-mono mt-0.5">
              Verified Evidence Feeds
            </h2>
          </div>
          <div className="text-xs font-mono text-terminal-secondary">
            TOTAL ACTIVE ARTIFACTS: <span className="text-terminal-text font-bold">4 STREAMS</span>
          </div>
        </div>

        {/* Source-style Rows */}
        <div className="pt-6">
          <div className="border border-terminal-border divide-y divide-terminal-border bg-surface">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-hover transition-colors gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#171717] border border-terminal-border text-terminal-accent uppercase">
                      {item.type}
                    </span>
                    <span className="text-sm font-bold font-mono text-terminal-text">
                      {item.title}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-terminal-secondary">
                    Source: <span className="text-terminal-text">{item.source}</span>
                  </div>

                  <p className="text-xs text-terminal-muted leading-relaxed">
                    {item.signal}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-terminal-border/60 min-w-[140px] text-right">
                  <div className="text-[11px] font-mono text-terminal-secondary">
                    RELEVANCE: {(item.relevance_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] font-mono text-terminal-muted">
                    {item.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#171717] border border-terminal-border flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-terminal-muted gap-2">
            <span>DATA PLATFORM INTEGRITY: ALL CHUNKS EMBEDDED WITH HIGH-DENSITY SPATIAL EMBEDDINGS</span>
            <span className="text-terminal-accent">AUDIT VERIFIED</span>
          </div>
        </div>
      </div>
    </section>
  );
};
