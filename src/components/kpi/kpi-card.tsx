interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: number; // percentage change
}

export function KPICard({ label, value, sub, icon, trend }: KPICardProps) {
  return (
    <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="label-upper">{label}</div>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--chs-accent-light)] text-[var(--chs-accent)]">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 kpi-value text-2xl text-[var(--chs-text-primary)] tabular-nums">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
              trend >= 0
                ? "bg-[var(--chs-success-light)] text-[var(--chs-success)]"
                : "bg-[var(--chs-error-light)] text-[var(--chs-error)]"
            }`}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              {trend >= 0 ? (
                <path d="M4 1L7 5H1L4 1Z" />
              ) : (
                <path d="M4 7L1 3H7L4 7Z" />
              )}
            </svg>
            {Math.abs(trend).toFixed(1).replace(".", ",")}%
          </span>
        )}
        {sub && (
          <span className="text-xs text-[var(--chs-text-muted)]">{sub}</span>
        )}
      </div>
    </div>
  );
}
