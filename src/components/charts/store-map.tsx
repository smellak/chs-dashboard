"use client";

import { useState } from "react";

interface StorePoint {
  codigo: string;
  nombre: string;
  lat: number;
  lng: number;
  ventasReal: number;
  pctObjetivo: number;
}

interface StoreMapProps {
  stores: StorePoint[];
  onSelect?: (codigo: string) => void;
  selected?: string;
}

// Andalucía bounding box (simplified)
const BOUNDS = {
  minLat: 36.0,
  maxLat: 38.0,
  minLng: -7.5,
  maxLng: -1.6,
};

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * width;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * height;
  return { x, y };
}

export function StoreMap({ stores, onSelect, selected }: StoreMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const width = 500;
  const height = 250;

  return (
    <div className="rounded-xl border border-[var(--chs-border)] bg-white p-4 shadow-sm">
      <div className="label-upper mb-3">Mapa de Tiendas</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: 300 }}
      >
        {/* Simplified Andalucía outline */}
        <path
          d="M 20,200 Q 80,180 120,190 T 200,170 Q 260,150 300,160 T 380,140 Q 420,130 460,150 T 480,180 Q 470,210 440,220 T 360,230 Q 300,240 240,235 T 120,220 Q 60,215 20,200 Z"
          fill="var(--chs-accent-light)"
          stroke="var(--chs-border)"
          strokeWidth="1"
        />
        {/* Store dots */}
        {stores.map((store) => {
          const { x, y } = latLngToXY(store.lat, store.lng, width, height);
          const isActive = selected === store.codigo || hovered === store.codigo;
          const dotSize = isActive ? 10 : 7;
          const color =
            store.pctObjetivo >= 100
              ? "var(--chs-success)"
              : store.pctObjetivo >= 90
              ? "var(--chs-warning)"
              : "var(--chs-error)";

          return (
            <g
              key={store.codigo}
              onClick={() => onSelect?.(store.codigo)}
              onMouseEnter={() => setHovered(store.codigo)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={dotSize + 4}
                  fill={color}
                  opacity={0.2}
                  className="animate-pulse"
                />
              )}
              <circle cx={x} cy={y} r={dotSize} fill={color} />
              <text
                x={x}
                y={y - dotSize - 6}
                textAnchor="middle"
                className="text-[11px] font-medium"
                fill="var(--chs-text-primary)"
              >
                {store.nombre}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
