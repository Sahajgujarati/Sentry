"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  mode?: "live" | "demo";
  onModeChange?: (mode: "live" | "demo") => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Navbar({
  mode = "demo",
  onModeChange,
  activeTab = "OVERVIEW",
  onTabChange,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalMode, setInternalMode] = useState<"live" | "demo">(mode);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  const tabs = [
    { id: "OVERVIEW", label: "OVERVIEW", href: "/dashboard" },
    { id: "RUN ANALYSIS", label: "RUN ANALYSIS", href: "/analysis" },
    { id: "EVIDENCE", label: "EVIDENCE", href: "/dashboard#evidence" },
    { id: "PORTFOLIO", label: "PORTFOLIO", href: "/dashboard#portfolio" },
    { id: "AGENTS", label: "AGENTS", href: "/dashboard#agents" },
  ];

  const handleToggleMode = () => {
    const nextMode = internalMode === "demo" ? "live" : "demo";
    setInternalMode(nextMode);
    if (onModeChange) onModeChange(nextMode);
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === "RUN ANALYSIS") {
      router.push("/analysis");
      if (onTabChange) onTabChange(tabId);
      return;
    }

    if (onTabChange) {
      onTabChange(tabId);
    }

    const targetUrl = tabId === "OVERVIEW" ? "/dashboard" : `/dashboard?tab=${tabId.toLowerCase()}`;
    if (pathname !== "/dashboard") {
      router.push(targetUrl);
    } else {
      window.history.replaceState(null, "", targetUrl);
    }
  };

  return (
    <header className="terminal-nav">
      {/* Brand */}
      <div className="terminal-brand-group">
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="terminal-brand-title">SENTRY</span>
          <span className="terminal-brand-slash">/</span>
          <span className="terminal-brand-sub">INTELLIGENCE TERMINAL</span>
        </Link>
      </div>

      {/* Tabs */}
      <nav className="terminal-nav-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`terminal-nav-tab ${isActive ? "active" : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right meta and controls */}
      <div className="terminal-nav-right">
        <div className="terminal-engine-tag">
          ENGINE: <span>QUANT-V2.4</span>
        </div>

        <div className="terminal-status-online">
          <span className="status-dot-green pulse-green" />
          <span>SYSTEM ONLINE</span>
        </div>

        <button
          onClick={handleToggleMode}
          className={`terminal-badge-btn ${internalMode === "live" ? "live-active" : ""}`}
          title="Toggle Analysis Mode"
        >
          {internalMode === "live" ? "● LIVE MODE" : "DEMO MODE"}
        </button>
      </div>
    </header>
  );
}
