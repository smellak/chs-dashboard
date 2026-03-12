import { RadialGauge } from "@/components/charts/radial-gauge";

interface MainKPIProps {
  label: string;
  value: string;
  pctTarget: number;
  target: string;
  previous: string;
  trendTarget: number;
  trendPrevious: number;
}

export function MainKPI({
  label,
  value,
  pctTarget,
  target,
  previous,
  trendTarget,
  trendPrevious,
}: MainKPIProps) {
  return (
    <div className="rounded-xl border border-[var(--chs-border)] bg-white p-6 shadow-sm">
      <div className="label-upper mb-4">{label}</div>
      <div className="flex items-center gap-6">
        <RadialGauge value={pctTarget} size={120} />
        <div className="flex-1">
          <div className="kpi-value text-3xl text-[var(--chs-text-primary)] tabular-nums">
            {value}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--chs-text-muted)]">Objetivo</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-[var(--chs-text-secondary)]">{target}</span>
                <DevPill value={trendTarget} />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--chs-text-muted)]">Año ant.</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-[var(--chs-text-secondary)]">{previous}</span>
                <DevPill value={trendPrevious} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevPill({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        isPositive
          ? "bg-[var(--chs-success-light)] text-[var(--chs-success)]"
          : "bg-[var(--chs-error-light)] text-[var(--chs-error)]"
      }`}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
        {isPositive ? (
          <path d="M4 1L7 5H1L4 1Z" />
        ) : (
          <path d="M4 7L1 3H7L4 7Z" />
        )}
      </svg>
      {Math.abs(value).toFixed(1).replace(".", ",")}%
    </span>
  );
}
