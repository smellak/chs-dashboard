"use client";

import { useEffect, useState } from "react";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ segments, size = 160, strokeWidth = 28 }: DonutChartProps) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  let cumulativeOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const segLength = pct * circumference;
          const gap = 4;
          const offset = cumulativeOffset;
          cumulativeOffset += segLength + gap;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${animated ? segLength - gap : 0} ${circumference}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700 ease-out"
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-[var(--chs-text-muted)]">Total</span>
        <span className="kpi-value text-lg tabular-nums">
          {total > 1000
            ? (total / 1000).toFixed(0) + "K"
            : total.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
