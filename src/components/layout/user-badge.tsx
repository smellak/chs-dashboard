interface UserBadgeProps {
  name: string;
  role: string;
  dept: string;
}

export function UserBadge({ name, role, dept }: UserBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--chs-border-light)] bg-[var(--chs-bg)] p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--chs-accent-light)] text-sm font-semibold text-[var(--chs-accent)]">
        {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium text-[var(--chs-text-primary)]">
          {name}
        </div>
        <div className="truncate text-[11px] text-[var(--chs-text-muted)]">
          {dept} · {role}
        </div>
      </div>
    </div>
  );
}
