export const COLORS = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  accent: "#2563EB",
  accentDark: "#1E3A5F",
  accentLight: "#EFF6FF",
  success: "#16A34A",
  successLight: "#DCFCE7",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
} as const;

export const CATEGORY_COLORS: Record<string, { main: string; light: string }> = {
  muebles: { main: "#2563EB", light: "#EFF6FF" },
  electro: { main: "#0891B2", light: "#ECFEFF" },
  cocinas: { main: "#8B5CF6", light: "#F5F3FF" },
} as const;

export const CATEGORY_ICONS: Record<string, string> = {
  muebles: "🛋️",
  electro: "⚡",
  cocinas: "🍳",
} as const;

export const TIENDAS_FISICAS = ["motril", "juncaril", "almeria", "alban", "antequera"] as const;
export const CANALES_ONLINE = ["chs_web", "shiito_es", "shiito_pt", "marketplaces"] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumen", icon: "LayoutDashboard" },
  { href: "/dashboard/tiendas", label: "Tiendas", icon: "MapPin" },
  { href: "/dashboard/categorias", label: "Categorías", icon: "Tags" },
  { href: "/dashboard/ecommerce", label: "E-Commerce", icon: "ShoppingCart" },
  { href: "/dashboard/margenes", label: "Márgenes", icon: "TrendingUp" },
] as const;

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;
