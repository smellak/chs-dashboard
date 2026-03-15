"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Tags,
  ShoppingCart,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/tiendas", label: "Tiendas", icon: MapPin },
  { href: "/dashboard/categorias", label: "Categorías", icon: Tags },
  { href: "/dashboard/ecommerce", label: "E-Commerce", icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[232px] flex-col border-r border-[var(--chs-border)] bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #1E3A5F, #2563EB)" }}
        >
          CHS
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--chs-text-primary)]">
            Centro Hogar
          </div>
          <div className="text-[11px] text-[var(--chs-text-muted)]">
            Cuadro de Dirección
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 px-3">
        <div className="label-upper mb-2 px-2">Navegación</div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--chs-accent-light)] text-[var(--chs-accent)]"
                  : "text-[var(--chs-text-secondary)] hover:bg-[var(--chs-border-light)] hover:text-[var(--chs-text-primary)]"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--chs-border-light)] p-4">
        <div className="text-[10px] text-[var(--chs-text-muted)]">
          CHS Platform v2
        </div>
      </div>
    </aside>
  );
}
