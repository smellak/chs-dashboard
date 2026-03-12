# CHS Dashboard — Cuadro de Dirección

## Proyecto
Dashboard ejecutivo para Centro Hogar Sánchez (CHS Platform v2). Muestra KPIs de ventas acumuladas, márgenes, rendimiento por tienda/categoría y e-commerce.

## Stack
- **Framework**: Next.js 16.1.6 (App Router, standalone output)
- **UI**: Tailwind CSS v4, Lucide React, Outfit font
- **DB**: Drizzle ORM + `postgres` driver → PostgreSQL (contenedor `chs-db`)
- **Deploy**: Coolify v4 → Docker (node:20-alpine) → Traefik con ForwardAuth SSO

## Estructura
```
src/
├── app/
│   ├── api/
│   │   ├── agent/route.ts        # IA Agent (4 capabilities)
│   │   ├── data/resumen/         # KPIs empresa
│   │   ├── data/tiendas/         # Datos por tienda
│   │   ├── data/categorias/      # Datos por categoría
│   │   ├── data/canales/         # E-commerce
│   │   ├── data/objetivos/       # CRUD objetivos
│   │   └── health/               # Health check
│   └── dashboard/
│       ├── page.tsx              # Vista Resumen
│       ├── tiendas/              # Vista Tiendas + mapa
│       ├── categorias/           # Vista Categorías
│       ├── ecommerce/            # Vista E-Commerce
│       ├── margenes/             # Vista Márgenes
│       └── layout.tsx            # Layout con sidebar+header
├── components/
│   ├── charts/                   # radial-gauge, donut, heatmap, progress-bar, store-map
│   ├── data/                     # dev-pill, store-table, category-card, channel-mix
│   ├── kpi/                      # kpi-card, main-kpi
│   └── layout/                   # sidebar, header, user-badge
└── lib/
    ├── db/index.ts               # Conexión Drizzle
    ├── db/schema-direccion.ts    # Schema direccion (read-write)
    ├── db/schema-erp.ts          # Schema erp (read-only)
    ├── auth.ts                   # SSO headers (X-CHS-*)
    ├── format.ts                 # Formateo español (€, %, K)
    ├── constants.ts              # Colores, nav, tiendas
    └── queries/ventas.ts         # 6 funciones SQL principales
```

## Base de datos
- **Host**: `chs-db` en red `docker_chs-internal`
- **Database**: `chs`, **User**: `chs`
- **Schema `direccion`** (propio): `objetivos`, `historico_anual`, `tiendas`, `categorias`, `subfamilias`
- **Schema `erp`** (solo lectura): `pedidos_raw` (24 filas de test)
- **Env var**: `DATABASE_URL=postgres://dashboard_user:Dshb0ard_CHS_2026kP@chs-db:5432/chs`

## Despliegue
- **Coolify UUID**: `css4cosk08k0c40gkgww84go`
- **FQDN**: `https://dashboard.centrohogarsanchez.es`
- **Traefik**: config en `/data/coolify/proxy/dynamic/chs-v2-dashboard-auth.yaml`
  - Usa `@docker` service reference (NO hostname de contenedor, que cambia con cada deploy)
  - ForwardAuth: `chs-v2-forward-auth` → `http://chs-platform:3000/api/auth/verify-access`
  - Ruta pública: `/api/health`
  - Todo lo demás: protegido con SSO
- **Redes Docker**: `coolify` (Traefik) + `docker_chs-internal` (DB)
  - Al redeployar, reconectar a `docker_chs-internal`: `docker network connect docker_chs-internal <container>`

## Registro en CHS Platform
- **App ID**: `f3e5894b-6265-477c-a1c0-c209b2eff307`
- **Org ID**: `deffdef5-5887-4d0a-96a4-0b389c4bcbc9`
- Tablas: `apps`, `app_instances`, `app_agents`, `app_access_policies`
- Access policies: 1 por departamento con `role_id = NULL` (NO cross join dept × role)

## Comandos
```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
docker build -t chs-dashboard .
```

## Notas importantes
- El Dockerfile usa `npm ci` (ALL deps) en builder stage — TypeScript es devDep necesario para build
- Los datos actuales son seed/simulados (~10-15% sobre 2024). No hay datos ERP reales suficientes.
- Formateo numérico siempre en español: `1.187.600 €`, `25,4%`
- Credenciales plataforma: admin / admin123
