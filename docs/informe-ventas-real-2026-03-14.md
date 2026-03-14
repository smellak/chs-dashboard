# Informe: Análisis de erp.ventas_real — VM DBBI (10.10.10.102)

**Fecha:** 14 marzo 2026
**VM:** DBBI (10.10.10.102), usuario `chs-etl2`
**Autor:** Claude Code (sesión de auditoría)

---

## 1. Origen del dato

El script **`/home/chs-etl-dashboard/etl_ventas_real.py`** fue creado por una sesión anterior de Claude Code (usuario `chs-etl-dashboard`, 12 marzo 2026). Lógica:

1. Lee `0_VIEW_OBI_893.csv` (820 MB, sep `;`, latin1)
2. Filtra: `ID_TIPO_DOCUMENTO = 'PEDIDO'` y `EMPRESA = 1`
3. Agrega por: año + mes + tienda + categoría (familia top-level)
4. Usa: `TOTHAL` (bruta con IVA), `TOTAL_BI` (neta sin IVA), `TOTAL_COSTE`
5. Genera filas "total" por tienda y filas "EMPRESA" como rollup
6. `TRUNCATE` + `INSERT` en `erp.ventas_real`

## 2. Datos actuales

- **1,222 filas**, 15 meses (Ene 2025 → Mar 2026)
- **16 tiendas** (5 físicas + centrales + Kibuc + Shiito + CHS Web + Contract + 6 marketplaces)
- **7 categorías**: cocinas, electro, muebles, otros, reformas, servicios, total

### Tiendas presentes

| Código | Tienda | Tipo |
|--------|--------|------|
| 2 | MOTRIL | Física |
| 5 | JUNCARIL | Física |
| 6 | ALMERIA | Física |
| 8 | ALBAN | Física |
| 9 | ANTEQUERA | Física |
| 100 | SERVICIOS CENTRALES | Oficina |
| 101 | KIBUC GRANADA | Marca |
| 201 | SHIITO | Web/marca |
| 301 | CHS WEB | E-commerce |
| 7 | CONTRACT | B2B |
| 402 | AMAZON | Marketplace |
| 406 | CARREFOUR | Marketplace |
| 411 | MEDIA MARKT | Marketplace |
| 412 | WORTEN | Marketplace |
| 413 | LEROY MERLIN | Marketplace |
| 0 | EMPRESA | Rollup calculado |

### Periodos cargados

| Año | Meses |
|-----|-------|
| 2025 | 1-12 (completo) |
| 2026 | 1-3 |

## 3. Comparativa julio 2025 vs Comité de Dirección

| Concepto | ventas_real (neta) | Comité ref | **Ratio** |
|----------|-------------------|------------|-----------|
| **EMPRESA total** | 3,043,995 € | 1,189,833 € | **2.56x** |
| EMPRESA muebles | 1,404,656 € | 442,547 € | **3.17x** |
| EMPRESA electro | 1,544,738 € | 472,668 € | **3.27x** |
| EMPRESA cocinas | 66,142 € | 19,140 € | **3.46x** |
| Albán total | 690,554 € | 352,093 € | **1.96x** |
| Motril total | 395,751 € | 198,907 € | **1.99x** |
| Juncaril total | 309,362 € | 133,750 € | **2.31x** |
| Almería total | 200,633 € | 94,699 € | **2.12x** |
| Antequera total | 193,807 € | 94,917 € | **2.04x** |

## 4. Diagnóstico: Los datos están inflados

**Los datos NO cuadran con el comité.** Están inflados entre **2x y 3.5x**.

### Causas identificadas

1. **Composiciones / líneas padre**: En el ERP, los PEDIDOs de muebles incluyen "composiciones" (una línea padre que es la suma de sus hijos). Al sumar todas las líneas sin filtrar, se cuenta doble o triple. Esto explica por qué **muebles está más inflado (3.17x)** que las tiendas físicas en general (~2x).

2. **Costes negativos sospechosos**: Albán muebles tiene coste **-355,504 €**, Motril muebles **-284,304 €**, CHS WEB muebles **-356,741 €**. Esto es claramente un artefacto del doble conteo de composiciones donde las líneas padre tienen coste=0 pero las hijas sí tienen coste.

3. **No filtra estados**: El script no excluye pedidos anulados (`ESTADO_PEDIDO = 'PEDIDO ANULADO'`).

4. **Conflicto tienda=0**: El CSV usa TIENDA=0 para "TRANSITO" pero el script reutiliza código=0 para "EMPRESA" (el rollup), mezclando datos reales de tránsito con el total calculado.

## 5. Estado del schema `direccion`

**No existe.** Toda la estructura previa está en `erp`. Las tablas son:

| Schema | Tabla |
|--------|-------|
| erp | ventas_real |
| erp | pedidos |
| erp | lineas_pedido |
| erp | clientes |
| erp | productos |
| erp | situaciones |
| erp | observaciones |

## 6. Base de datos local `chsanalytics`

| Tabla | Filas | Descripción |
|-------|-------|-------------|
| view_obi_documentos | 1,022,503 | Datos de documentos del ERP |
| fact_ventas_lineas | 155,575 | Líneas de ventas TPV |
| fact_ventas_tickets | — | Cabeceras tickets TPV |
| dim_products | — | Maestro productos |
| dim_customers | — | Maestro clientes |
| dim_families | — | Familias de artículos |
| dim_brand | — | Marcas |
| dim_tiendas | — | Tiendas |
| dim_empresa_tienda | — | Empresa-tienda |
| dim_datetime | — | Dimensión fecha |
| dim_geography | — | Geografía |

## 7. Fuente CSV

- **879 archivos CSV** en `/sftp/sftp_daemon4/uploads/` (total ~12 GB)
- Última actualización: 13-14 marzo 2026
- Archivo principal: `0_VIEW_OBI_893.csv` (820 MB, ~1M filas)

## 8. Conclusión

**Los datos en `erp.ventas_real` necesitan recalcularse** corrigiendo:
- Filtrado de composiciones (líneas padre duplicadas)
- Exclusión de pedidos anulados
- Separación de TRANSITO vs EMPRESA en tienda código=0
- Revisión de la lógica de costes

---

*Generado por Claude Code en sesión de auditoría, 14 marzo 2026*
