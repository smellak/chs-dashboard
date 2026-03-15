"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MESES } from "@/lib/constants";

interface HeaderProps {
  defaultAnio: number;
  defaultMes: number;
  availablePeriods: { anio: number; mes: number }[];
  userName?: string;
}

export function Header({ defaultAnio, defaultMes, availablePeriods, userName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const anio = Number(searchParams.get("anio") || defaultAnio);
  const mes = Number(searchParams.get("mes") || defaultMes);

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [y, m] = e.target.value.split("-").map(Number);
    const params = new URLSearchParams(searchParams.toString());
    params.set("anio", String(y));
    params.set("mes", String(m));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <header
      className="flex h-16 items-center justify-between px-6"
      style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)" }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">
          Cuadro de Dirección
        </h1>
        <select
          value={`${anio}-${mes}`}
          onChange={handlePeriodChange}
          className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 border-none outline-none cursor-pointer hover:bg-white/25 transition-colors appearance-none"
          style={{ backgroundImage: "none" }}
        >
          {availablePeriods.map((p) => (
            <option
              key={`${p.anio}-${p.mes}`}
              value={`${p.anio}-${p.mes}`}
              className="text-gray-900 bg-white"
            >
              {MESES[p.mes - 1]} {p.anio}
            </option>
          ))}
        </select>
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
