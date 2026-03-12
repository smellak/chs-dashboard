import { MESES } from "@/lib/constants";

interface HeaderProps {
  anio: number;
  mes: number;
  userName?: string;
}

export function Header({ anio, mes, userName }: HeaderProps) {
  return (
    <header
      className="flex h-16 items-center justify-between px-6"
      style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)" }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">
          Cuadro de Dirección
        </h1>
        <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90">
          {MESES[mes - 1]} {anio}
        </span>
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
