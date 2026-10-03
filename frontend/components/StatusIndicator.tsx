import React from "react";

interface StatusIndicatorProps {
  label?: string;
  status?: "nominal" | "warning" | "critical" | "neutral";
  pulsing?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  label = "SYSTEM ONLINE",
  status = "nominal",
  pulsing = true,
}) => {
  const colorMap = {
    nominal: "bg-terminal-accent text-terminal-accent",
    warning: "bg-terminal-warning text-terminal-warning",
    critical: "bg-terminal-negative text-terminal-negative",
    neutral: "bg-terminal-secondary text-terminal-secondary",
  };

  const dotColor = {
    nominal: "bg-terminal-accent",
    warning: "bg-terminal-warning",
    critical: "bg-terminal-negative",
    neutral: "bg-terminal-secondary",
  }[status];

  return (
    <div className="inline-flex items-center space-x-2 py-1 px-2.5 bg-surface border border-terminal-border">
      <span className="relative flex h-2 w-2">
        {pulsing && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span className="terminal-label text-[11px] font-mono tracking-wider text-terminal-text">
        {label}
      </span>
    </div>
  );
};
