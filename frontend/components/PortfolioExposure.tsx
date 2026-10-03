import React from "react";
import { SectorExposure, AssetHolding } from "@/types/analysis";
import { formatNumber } from "@/lib/mock-analysis";

interface PortfolioExposureProps {
  sectors: SectorExposure[];
  topContributors: AssetHolding[];
  totalValue: number;
}

export const PortfolioExposure: React.FC<PortfolioExposureProps> = ({
  sectors,
  topContributors,
  totalValue,
}) => {
  return (
    <section id="portfolio" className="border-b border-terminal-border bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-terminal-border gap-2">
          <div>
            <div className="text-[11px] font-mono tracking-wideTerminal uppercase text-terminal-muted">
              CONCENTRATION & SENSITIVITY VECTORS
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-terminal-text uppercase font-mono mt-0.5">
              Portfolio Exposure & Attribution
            </h2>
          </div>
          <div className="text-xs font-mono text-terminal-secondary">
            TOTAL PORTFOLIO VALUATION:{" "}
            <span className="text-terminal-text font-bold">
              ${(totalValue / 1000).toFixed(0)},000 USD
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Column: Horizontal Exposure Bars (40% width on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1">
              <div className="terminal-label text-[10px]">SECTOR ALLOCATION WEIGHTS</div>
              <p className="text-xs text-terminal-muted">
                Concentration breakdown across invested asset classes.
              </p>
            </div>

            {/* Horizontal CSS visual bars */}
            <div className="space-y-4 bg-surface p-5 border border-terminal-border">
              {sectors.map((sector) => (
                <div key={sector.sector} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-terminal-text uppercase flex items-center space-x-2">
                      <span>{sector.sector}</span>
                      {sector.is_affected && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-terminal-negativeDim text-terminal-negative border border-terminal-negative/40">
                          SHOCKED SECTOR
                        </span>
                      )}
                    </span>
                    <span className="text-terminal-secondary">
                      {sector.allocation_pct}% (${(sector.value / 1000).toFixed(1)}K)
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-3.5 w-full bg-[#171717] border border-terminal-border overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        sector.is_affected ? "bg-terminal-negative" : "bg-terminal-secondary"
                      }`}
                      style={{ width: `${sector.allocation_pct}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-terminal-border/80 flex items-center justify-between text-[11px] font-mono text-terminal-muted">
                <span>CONCENTRATION STATUS:</span>
                <span className="text-terminal-warning font-semibold">
                  ELEVATED TAIL RISK (&gt;25% IN IMPACT ZONE)
                </span>
              </div>
            </div>

            {/* Allocation warning notice */}
            <div className="p-4 border border-terminal-border bg-surface/50 text-xs font-mono text-terminal-secondary leading-relaxed">
              <span className="text-terminal-text font-bold">EXPOSURE AUDIT:</span> 49.0% of active capital is directly positioned in the Gulf offshore production corridor, creating asymmetric vulnerability to tropical disruption cycles.
            </div>
          </div>

          {/* Right Column: Top Risk Contributors Table (60% width on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="terminal-label text-[10px]">HOLDING DECOMPOSITION</div>
                <h3 className="text-lg font-bold font-mono text-terminal-text uppercase mt-0.5">
                  Top Risk Contributors
                </h3>
              </div>
              <span className="text-[10px] font-mono text-terminal-muted uppercase">
                RANKED BY PORTFOLIO DRAG
              </span>
            </div>

            {/* Technical Table */}
            <div className="border border-terminal-border overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#171717] border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                  <tr>
                    <th className="py-2.5 px-3">TICKER</th>
                    <th className="py-2.5 px-3">NAME</th>
                    <th className="py-2.5 px-3 text-right">WEIGHT</th>
                    <th className="py-2.5 px-3 text-right">POSITION VALUE</th>
                    <th className="py-2.5 px-3 text-right">EST. DRAG</th>
                    <th className="py-2.5 px-3 text-right">EST. LOSS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border bg-surface">
                  {topContributors.map((holding) => (
                    <tr
                      key={holding.ticker}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-terminal-text">
                        {holding.ticker}
                      </td>
                      <td className="py-3 px-3 text-terminal-secondary">
                        {holding.name}
                      </td>
                      <td className="py-3 px-3 text-right text-terminal-secondary">
                        {holding.weight_pct.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-right text-terminal-text">
                        ${(holding.current_value / 1000).toFixed(1)}K
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-terminal-negative">
                        {(holding.estimated_impact_pct * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-terminal-negative">
                        -${formatNumber(Math.abs(holding.estimated_dollar_impact))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#171717] border border-terminal-border flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-terminal-secondary gap-2">
              <span>CONTRIBUTOR CONTRIBUTION: XOM & CVX account for 100% of affected sector impact</span>
              <span className="text-terminal-accent">HEDGE TARGET: XLE PUT OVERLAY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
