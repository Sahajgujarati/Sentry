"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusIndicator } from "./StatusIndicator";

export const TerminalNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/" },
    { label: "Run Analysis", href: "/analysis" },
    { label: "Evidence", href: "/evidence" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Agents", href: "/agents" },
  ];

  return (
    <header className="w-full bg-[#171717] border-b border-terminal-border sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand & Terminal Label */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="font-mono text-base font-bold tracking-widest text-terminal-text group-hover:text-terminal-accent transition-colors">
                SENTRY
              </span>
              <span className="text-terminal-border">/</span>
              <span className="text-[11px] tracking-wideTerminal uppercase text-terminal-secondary font-mono">
                INTELLIGENCE TERMINAL
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-terminal-border h-6">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/" && pathname === "/dashboard");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-1 text-xs font-mono tracking-wider uppercase transition-colors ${
                      isActive
                        ? "text-terminal-accent border-b-2 border-terminal-accent font-semibold"
                        : "text-terminal-secondary hover:text-terminal-text hover:bg-surface"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Technical Telemetry & Demo Pill */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-3 text-xs font-mono text-terminal-secondary pr-3 border-r border-terminal-border">
              <span className="text-[11px] text-terminal-muted uppercase">ENGINE:</span>
              <span className="text-terminal-text">QUANT-V2.4</span>
            </div>

            <div className="flex items-center space-x-2">
              <StatusIndicator label="SYSTEM ONLINE" status="nominal" pulsing={true} />
              <div className="px-2 py-1 bg-surface border border-terminal-border text-[10px] font-mono tracking-wider uppercase text-terminal-accent">
                DEMO MODE
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
