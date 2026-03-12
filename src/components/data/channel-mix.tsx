interface ChannelData {
  nombre: string;
  ventasReal: number;
  color: string;
}

interface ChannelMixProps {
  channels: ChannelData[];
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toFixed(0);
}

export function ChannelMix({ channels }: ChannelMixProps) {
  const total = channels.reduce((sum, c) => sum + c.ventasReal, 0);

  return (
    <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
      <div className="label-upper mb-3">Mix de Canales</div>
      {/* Segmented bar */}
      <div className="flex h-6 overflow-hidden rounded-full bg-[var(--chs-border-light)]">
        {channels.map((ch, i) => {
          const pct = total > 0 ? (ch.ventasReal / total) * 100 : 0;
          if (pct <= 0) return null;
          return (
            <div
              key={i}
              className="h-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: ch.color,
                borderRight: i < channels.length - 1 ? "2px solid white" : "none",
              }}
              title={`${ch.nombre}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {channels.map((ch, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: ch.color }}
            />
            <span className="text-[var(--chs-text-secondary)]">{ch.nombre}</span>
            <span className="ml-auto tabular-nums font-medium">{fmtK(ch.ventasReal)} €</span>
          </div>
        ))}
      </div>
    </div>
  );
}
