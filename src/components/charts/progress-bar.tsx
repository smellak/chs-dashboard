"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number; // current value
  max: number; // target value
  color?: string;
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({
  value,
  max,
  color = "var(--chs-accent)",
  showLabel = true,
  height = 8,
}: ProgressBarProps) {
  const [animated, setAnimated] = useState(false);
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      <div
        className="w-full overflow-hidden rounded-full bg-[var(--chs-border-light)]"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: animated ? `${pct}%` : "0%",
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-[11px] text-[var(--chs-text-muted)] tabular-nums">
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
