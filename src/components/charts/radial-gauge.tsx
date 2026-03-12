"use client";

import { useEffect, useState } from "react";

interface RadialGaugeProps {
  value: number; // 0-100+ (percentage of target)
  size?: number;
  strokeWidth?: number;
}

export function RadialGauge({ value, size = 120, strokeWidth = 10 }: RadialGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 1.5; // 270 degrees
  const center = size / 2;
  const startAngle = 135; // start from bottom-left

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const clampedValue = Math.min(animatedValue, 120); // cap visual at 120%
  const offset = circumference - (clampedValue / 100) * circumference;
  const isOver = value >= 100;
  const color = isOver ? "var(--chs-success)" : "var(--chs-accent)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--chs-border-light)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transform: "rotate(0deg)", transformOrigin: "center" }}
        />
        {/* Fill */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: isOver ? `drop-shadow(0 0 6px ${color})` : "none",
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="kpi-value text-xl tabular-nums" style={{ color }}>
          {value.toFixed(1).replace(".", ",")}%
        </span>
      </div>
    </div>
  );
}
