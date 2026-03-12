interface DevPillProps {
  value: number;
  size?: "sm" | "md";
}

export function DevPill({ value, size = "sm" }: DevPillProps) {
  const isPositive = value >= 0;
  const sizeClasses =
    size === "sm"
      ? "px-1.5 py-0.5 text-xs"
      : "px-2 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md font-semibold tabular-nums ${sizeClasses} ${
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
