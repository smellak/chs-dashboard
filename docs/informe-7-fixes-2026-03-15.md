# Informe: 7 Correcciones Críticas del Dashboard

**Fecha:** 15 de Marzo de 2026  
**Commit:** `fedd82e`  
**Deploy:** Coolify → dashboard.centrohogarsanchez.es  
**Archivos modificados:** 18  

---

## Estado anterior

El dashboard mostraba datos problemáticos:
- Márgenes brutos con costes negativos (datos de coste no fiables por composiciones del ERP)
- La categoría "anticipos" (familia 00000) aparecía como categoría de venta real
- El periodo por defecto mostraba el mes en curso (incompleto)
- Se mostraban columnas de % Objetivo con "0,0%" porque `erp.objetivos_direccion` está vacía
- Se mostraban columnas de % YoY con "0 €" para periodos sin datos del año anterior
- Las cards del header mostraban "Margen Bruto" y "MB%" (datos no fiables)
- Los mini-gauges de categorías mostraban "0,0%" por falta de objetivos

---

## Correcciones implementadas

### 1. Márgenes ocultos

**Problema:** Los costes del ERP no son fiables (costes negativos por composiciones), lo que genera márgenes brutos incorrectos.

**Solución:**
- Eliminada la entrada "Márgenes" del sidebar de navegación (`sidebar.tsx`, `constants.ts`)
- La ruta `/dashboard/margenes` redirige automáticamente a `/dashboard`
- Eliminada la columna "MB%" de la tabla de tiendas (`store-table.tsx`)
- Eliminada la referencia a MB% en las cards de categorías (`category-card.tsx`)

**Archivos:** `sidebar.tsx`, `constants.ts`, `store-table.tsx`, `category-card.tsx`, `margenes/page.tsx`

**Reversibilidad:** Cuando los costes sean fiables, restaurar la entrada en `NAV_ITEMS` y reactivar las columnas.

---

### 2. Anticipos excluidos

**Problema:** La categoría "anticipos" (familia 00000) son ajustes contables que distorsionan las cifras de venta.

**Solución:**
- `getDatosCategorias()`: filtro `WHERE c.codigo != 'anticipos'`
- `getHeatmapData()`: filtro `AND v.categoria NOT IN ('total', 'anticipos')`
- `getTiendaPorCategoria()`: filtro `WHERE c.codigo != 'anticipos'`
- `getResumenEmpresa()`: **recalcula el total** como `SUM(...) WHERE categoria NOT IN ('total', 'anticipos')` en vez de leer la fila `categoria='total'`

**Resultado:** Las ventas totales son ahora la suma de: muebles + electro + cocinas + reformas + servicios + otros. Solo 6 categorías visibles.

**Archivo:** `ventas.ts`

---

### 3. Periodo por defecto = último mes completo

**Problema:** El dashboard mostraba el mes en curso (marzo 2026), que tiene datos incompletos.

**Solución:**
- Nueva función `getDefaultPeriod()`: detecta el periodo más reciente en la BD y, si coincide con el mes actual, retrocede un mes
- Nueva función `getAvailablePeriods()`: devuelve todos los periodos disponibles (DISTINCT anio, mes)
- **Selector de periodo** en el header: dropdown con todos los meses disponibles
- Todas las páginas leen `searchParams` (`?anio=X&mes=Y`) para permitir cambio de periodo
- El header es ahora un componente cliente que usa `useSearchParams()` y `router.push()`

**Resultado:** El dashboard muestra **Febrero 2026** por defecto. El usuario puede cambiar al mes que quiera desde el selector.

**Archivos:** `ventas.ts`, `header.tsx`, `layout.tsx`, `page.tsx`, `tiendas/page.tsx`, `categorias/page.tsx`, `ecommerce/page.tsx`, todas las API routes

---

### 4. % Objetivo oculto cuando vacío

**Problema:** Se mostraban columnas de "% Obj" y textos como "de 0€ obj." porque `erp.objetivos_direccion` está vacía.

**Solución:**
- `ResumenEmpresa` incluye nuevo campo `hasObjetivos` (consulta `COUNT(*)` de `erp.objetivos_direccion`)
- `StoreTable`: las columnas "Objetivo" y "% Obj" solo se renderizan si `totalObj > 0`
- `MainKPI`: la línea de objetivo solo aparece si `hasTarget`
- `CategoryCard`: ya no muestra "de X€ obj." — muestra ventas y barra de proporción

**Resultado:** No aparece ninguna referencia a objetivos. Cuando se carguen datos en `erp.objetivos_direccion`, aparecerán automáticamente.

**Archivos:** `ventas.ts`, `store-table.tsx`, `main-kpi.tsx`, `category-card.tsx`, `page.tsx`

---

### 5. Comparativa interanual condicional

**Problema:** Se mostraban columnas "Año Ant." y "% YoY" con "0 €" para periodos sin datos del año anterior.

**Solución:**
- `ResumenEmpresa` incluye nuevo campo `hasAnterior` (true si ventasAnterior != 0)
- `StoreTable`: las columnas "Año Ant." y "% YoY" solo se renderizan si `totalAnt > 0`
- `MainKPI`: la línea "Año ant." solo aparece si `hasPrevious`
- E-Commerce: la card "vs Año Anterior" solo aparece si `hasAnterior`

**Resultado:** Para meses de 2025 (sin datos de 2024), no se muestra comparativa interanual. Para 2026 (con datos de 2025), sí aparece.

**Archivos:** `ventas.ts`, `store-table.tsx`, `main-kpi.tsx`, `page.tsx`, `tiendas/page.tsx`, `ecommerce/page.tsx`

---

### 6. Header: Mix Categorías + Físicas vs Digital

**Problema:** Las cards "Margen Bruto" y "MB%" del header mostraban datos no fiables.

**Solución:**
- Eliminadas las cards "Margen Bruto" y "MB%"
- Nueva card **"Mix Categorías"**: muestra el número de categorías activas y el top 3 con su peso porcentual (ej: "Muebles 49% · Electro 28% · Cocinas 15%")
- Nueva card **"Físicas vs Digital"**: muestra el porcentaje del total que representan las tiendas físicas vs los canales digitales, con sus importes

**Grid:** Cambiado de 5 columnas a 4 columnas (MainKPI 2cols + Mix Categorías + Físicas vs Digital)

**Archivo:** `page.tsx`

---

### 7. Barras de proporción en categorías

**Problema:** Los mini-gauges (RadialGauge) de las CategoryCards mostraban "0,0%" porque no hay objetivos cargados.

**Solución:**
- `CategoryCard` ya no usa `RadialGauge` ni recibe `pctObjetivo`/`ventasObjetivo`/`mbPct`
- Nuevo prop `totalVentas` para calcular el peso de cada categoría
- Muestra una **barra de proporción** horizontal con "X,X% del total"
- La barra se rellena proporcionalmente al peso de la categoría sobre el total

**Resultado:** Cada card muestra claramente el peso relativo de la categoría (ej: Muebles = 49,2% del total).

**Archivos:** `category-card.tsx`, `page.tsx`, `categorias/page.tsx`

---

## Verificación post-deploy

```
Period: 2026/2 (Febrero — último mes completo)
Ventas: 1.902.396,11 EUR (sin anticipos)
hasObjetivos: false (columnas de objetivo ocultas)
hasAnterior: true (comparativa YoY visible para 2026)
Categorías: 6 (muebles, electro, cocinas, reformas, servicios, otros)
anticipos excluido: ✓
```

---

## Archivos modificados (18)

| Archivo | Cambio |
|---------|--------|
| `src/lib/queries/ventas.ts` | getDefaultPeriod, getAvailablePeriods, excluir anticipos, SUM totales, hasAnterior, hasObjetivos |
| `src/lib/constants.ts` | Eliminar Márgenes de NAV_ITEMS |
| `src/components/layout/sidebar.tsx` | Eliminar Márgenes del menú |
| `src/components/layout/header.tsx` | Selector de periodo (client component) |
| `src/components/data/store-table.tsx` | Eliminar MB%, columnas condicionales |
| `src/components/data/category-card.tsx` | Barra de proporción en vez de gauge |
| `src/components/kpi/main-kpi.tsx` | Líneas condicionales objetivo/anterior |
| `src/app/dashboard/layout.tsx` | Pasar availablePeriods al header |
| `src/app/dashboard/page.tsx` | Mix Categorías, Físicas vs Digital, searchParams |
| `src/app/dashboard/tiendas/page.tsx` | Sin MB%, searchParams |
| `src/app/dashboard/categorias/page.tsx` | Sin márgenes, searchParams, % del total |
| `src/app/dashboard/ecommerce/page.tsx` | Condicional YoY, searchParams |
| `src/app/dashboard/margenes/page.tsx` | Redirect a /dashboard |
| `src/app/api/data/resumen/route.ts` | getDefaultPeriod |
| `src/app/api/data/tiendas/route.ts` | getDefaultPeriod |
| `src/app/api/data/categorias/route.ts` | getDefaultPeriod |
| `src/app/api/data/canales/route.ts` | getDefaultPeriod |
| `src/app/api/agent/route.ts` | Sin márgenes, getDefaultPeriod |

---

## Próximos pasos (cuando estén disponibles)

1. **Cargar objetivos** en `erp.objetivos_direccion` → aparecerán automáticamente columnas de % Obj y gauges
2. **Cargar datos 2024** en `erp.ventas_real` → aparecerá automáticamente comparativa YoY para periodos de 2025
3. **Corregir costes** en el ERP → reactivar sección Márgenes restaurando la entrada en NAV_ITEMS
