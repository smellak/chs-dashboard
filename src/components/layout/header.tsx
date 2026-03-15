"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface RangeOption {
  key: string;
  label: string;
  desde: string;
  hasta: string;
}

interface HeaderProps {
  defaultDesde: string;
  defaultHasta: string;
  ranges: RangeOption[];
  userName?: string;
}

export function Header({ defaultDesde, defaultHasta, ranges, userName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const desde = searchParams.get("desde") || defaultDesde;
  const hasta = searchParams.get("hasta") || defaultHasta;
  const [showCustom, setShowCustom] = useState(false);
  const [customDesde, setCustomDesde] = useState(desde);
  const [customHasta, setCustomHasta] = useState(hasta);

  // Find current range label
  const currentRange = ranges.find(r => r.desde === desde && r.hasta === hasta);
  const currentLabel = currentRange?.label || formatRangeLabel(desde, hasta);

  function navigate(d: string, h: string) {
    const params = new URLSearchParams();
    params.set("desde", d);
    params.set("hasta", h);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleRangeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const key = e.target.value;
    if (key === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const range = ranges.find(r => r.key === key);
    if (range) navigate(range.desde, range.hasta);
  }

  function handleCustomApply() {
    navigate(customDesde, customHasta);
    setShowCustom(false);
  }

  const currentKey = currentRange?.key || "custom";

  return (
    <header
      className="flex h-16 items-center justify-between px-6"
      style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)" }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">Cuadro de Dirección</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur px-3 py-1.5">
            <Calendar size={14} className="text-white/80" />
            <select
              value={currentKey}
              onChange={handleRangeChange}
              className="bg-transparent text-sm font-medium text-white border-none outline-none cursor-pointer appearance-none pr-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0 center",
              }}
            >
              {ranges.map((r) => (
                <option key={r.key} value={r.key} className="text-gray-900 bg-white">
                  {r.label}
                </option>
              ))}
              <option value="custom" className="text-gray-900 bg-white">Personalizado...</option>
            </select>
          </div>
          {showCustom && (
            <div className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur px-3 py-1">
              <input
                type="date"
                value={customDesde}
                onChange={(e) => setCustomDesde(e.target.value)}
                className="bg-transparent text-xs text-white border-none outline-none"
              />
              <span className="text-white/60 text-xs">→</span>
              <input
                type="date"
                value={customHasta}
                onChange={(e) => setCustomHasta(e.target.value)}
                className="bg-transparent text-xs text-white border-none outline-none"
              />
              <button
                onClick={handleCustomApply}
                className="rounded bg-white/30 px-2 py-0.5 text-xs font-medium text-white hover:bg-white/40"
              >
                Aplicar
              </button>
            </div>
          )}
          {!showCustom && !currentRange && (
            <span className="text-xs text-white/60">{desde} → {hasta}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {userName && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm text-white/80">{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}

function formatRangeLabel(desde: string, hasta: string): string {
  const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const d = new Date(desde);
  const h = new Date(hasta);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()} - ${h.getDate()} ${MESES[h.getMonth()]} ${h.getFullYear()}`;
}
