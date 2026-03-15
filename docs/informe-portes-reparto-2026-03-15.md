# Investigación: Sistema de Portes y campo Reparto

**Fecha:** 15 marzo 2026
**VM:** DBBI (10.10.10.102), usuario `chs-etl2`

---

## Objetivo

Investigar si el nuevo sistema de cobro de portes permite calcular el Reparto (componente del Margen Neto) desde las líneas de factura del ERP, comparando VIEW_OBI con el Excel OAS Analytics (junio 2025).

## Resultado: NO se puede calcular el Reparto completo desde el ERP

VIEW_OBI solo captura el **10% del Reparto real**. El 90% restante es un cálculo interno de OAS Analytics no disponible en los datos del ERP.

---

## 1. Columnas del Excel OAS relacionadas con portes

| Campo | Valores | Líneas | Significado |
|-------|---------|--------|-------------|
| **Portes** | `S` / vacío | 9.596 / 14.630 | S = la factura lleva portes asociados |
| **TP** | `S` / `SC` / `SD` / vacío | 5.658 / 2.027 / 1.911 / 14.630 | Tipo porte: Simple / Simple+Clima / Simple+Descarga |
| **Desc** | `D` / vacío | 1.911 / 22.315 | D = incluye descarga (coincide con TP=SD) |
| **Clima** | `C` / vacío | 2.027 / 22.199 | C = incluye climatización (coincide con TP=SC) |

### Reparto por tipo de porte

| TP | Líneas | Ventas | Reparto | Rep/Venta% |
|----|--------|--------|---------|------------|
| (vacío) | 14.630 | 3.842.051 | 1.773.749 | 46,2% |
| S | 5.658 | 847.618 | 57.423 | 6,8% |
| SC | 2.027 | 376.642 | 108.260 | 28,7% |
| SD | 1.911 | 250.742 | 16.592 | 6,6% |

**Nota:** Las líneas sin TP (vacío) tienen el mayor Reparto absoluto (1,77M€). El Reparto de OAS es un **prorrateo de costes logísticos**, no solo los portes facturados.

## 2. Líneas de porte como artículos en factura

### Familias de porte encontradas

| DFamil_N2 | DFamil_N3 | Líneas | Ventas | Reparto |
|-----------|-----------|--------|--------|---------|
| 00096 - Servicios Portes Muebles | 00001 - Transporte/Montaje Muebles | 2.647 | 50.118€ | 42.718€ |
| 00097 - Servicios Portes Electros. | 00001 - Transporte/Montaje Electros | 2.235 | 51.860€ | 133.718€ |
| **Total** | | **4.882** | **101.979€** | **176.436€** |

Estas líneas **sí existen** tanto en el Excel OAS como en VIEW_OBI (4.887 líneas, 102.339€ ventas en VIEW_OBI — match del 99,6%).

### Pero solo son el 9% del Reparto

| Origen | Reparto | % del total |
|--------|---------|-------------|
| Líneas familia porte (00096/00097) | 176.436€ | **9,0%** |
| Líneas producto normal | 1.779.590€ | **91,0%** |
| **Total Reparto Excel** | **1.956.026€** | 100% |

## 3. Cruce VIEW_OBI PORTES vs Excel Reparto

### Totales junio 2025

| Fuente | Importe |
|--------|---------|
| VIEW_OBI SUM(PORTES) | **198.404€** |
| Excel SUM(Reparto) | **1.956.026€** |
| **Ratio** | **0,10x (solo el 10%)** |

### Cruce línea a línea (30 líneas producto con mayor Reparto)

| Doc | Lín | Venta Excel | Reparto Excel | PORTES OBI | Match |
|-----|-----|-------------|---------------|------------|-------|
| 51 | 5 | 214,05 | 1.138,18 | 1.138,18 | ✓ |
| 57 | 1 | 1.075,00 | 895,00 | 895,00 | ✓ |
| 25035894 | 2 | 4.140,50 | 454,11 | 454,11 | ✓ |
| 25041097 | 2 | 379,34 | 179,80 | 0,00 | ✗ |
| 25042552 | 2 | 2.533,83 | 108,92 | 0,00 | ✗ |
| 25042221 | 1 | 412,40 | 85,00 | 0,00 | ✗ |
| 25035915 | 2 | 334,17 | 83,69 | 83,69 | ✓ |
| 25041113 | 2 | 1.010,74 | 65,68 | 0,00 | ✗ |
| 25041494 | 2 | 185,95 | 65,22 | 47,00 | ✗ |
| 25038759 | 2 | 1.261,16 | 61,04 | 59,82 | ✓ |
| 25037337 | 1 | 616,53 | 59,68 | 0,00 | ✗ |
| 25042423 | 2 | 883,47 | 57,41 | 57,41 | ✓ |
| 25039092 | 3 | 2.066,66 | 55,10 | 55,10 | ✓ |
| 25035974 | 2 | 232,87 | 53,00 | 0,00 | ✗ |
| 66 | 15 | 885,47 | 48,91 | 47,19 | ✓ |
| 25037886 | 4 | 677,60 | 44,03 | 17,03 | ✗ |
| 25038660 | 1 | 966,12 | 43,04 | 0,00 | ✗ |
| 25039823 | 2 | 885,12 | 42,84 | 42,84 | ✓ |
| 25040432 | 2 | 874,38 | 42,32 | 42,32 | ✓ |
| 25038766 | 2 | 753,07 | 36,45 | 36,45 | ✓ |
| 25036394 | 4 | 556,29 | 36,14 | 36,14 | ✓ |
| 25036394 | 5 | 487,59 | 31,68 | 31,68 | ✓ |
| 25036394 | 3 | 461,16 | 29,96 | 29,96 | ✓ |
| 25038616 | 3 | 288,42 | 29,20 | 29,20 | ✓ |
| 66 | 1 | 500,11 | 27,62 | 26,66 | ✓ |
| 25042132 | 5 | 966,94 | 26,68 | 23,34 | ✓ |
| 25038153 | 1 | 458,21 | 26,00 | 0,00 | ✗ |

**Resultado: 18/30 coinciden, 12/30 no coinciden** (VIEW_OBI PORTES=0 pero Excel tiene Reparto > 0).

Las líneas que coinciden son portes **explícitos** en la factura. Las que no coinciden tienen Reparto **imputado/prorrateado** por OAS internamente.

## 4. Portes flag vs familia porte (cross-tab)

|  | Producto | Fam. Porte | Total |
|--|----------|------------|-------|
| Portes = vacío | 13.861 | 769 | 14.630 |
| Portes = S | 5.483 | 4.113 | 9.596 |
| **Total** | **19.344** | **4.882** | **24.226** |

- La mayoría de líneas de familia porte (4.113/4.882 = 84%) tienen flag Portes=S
- Pero hay 5.483 líneas producto con Portes=S que **no** son familia porte (el porte va en otra línea de la misma factura)

## 5. Conclusión

### ¿Funciona el nuevo sistema de cobro de portes?

**Sí, parcialmente.** Las familias 00096/00097 generan líneas de factura reales con los portes cobrados al cliente (~102K€/mes en junio 2025). Estas líneas están disponibles en VIEW_OBI.

### ¿Se puede calcular el Reparto desde el ERP?

**No.** El Reparto del Excel OAS (1,96M€) es ~20x mayor que las ventas de portes facturados (102K€). El Reparto incluye:
- **Portes facturados al cliente** (~102K€, 5,2%) — disponible en VIEW_OBI
- **Costes logísticos imputados** (~1,85M€, 94,8%) — cálculo interno de OAS, no disponible en el ERP

### Opciones para el dashboard

1. **Usar solo Margen Bruto** (recomendado) — ya validado al 99,98% contra OAS. Es fiable y no depende de datos externos.
2. **Añadir facturación de portes al cliente** — dato adicional (familias 00096/00097), pero no es el Reparto real.
3. **Importar Reparto mensual desde OAS** — si se necesita Margen Neto, habría que obtener este dato de OAS Analytics, no del ERP.

---

*Generado por Claude Code, 15 marzo 2026*
