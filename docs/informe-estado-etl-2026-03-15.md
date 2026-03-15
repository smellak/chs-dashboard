# Estado actual de los scripts ETL

**Fecha:** 15 marzo 2026
**VM:** DBBI (10.10.10.102), usuario `chs-etl2`

---

## Scripts ETL

| Script | Tamaño | Última modif. |
|--------|--------|---------------|
| `/home/chs-etl2/etl_cuadro_mando.py` | 10.9 KB | 15 mar 2026 16:21 |
| `/home/chs-etl2/etl_ventas_real.py` | 10.8 KB | 15 mar 2026 16:08 |

### Filtro común (validado contra OAS Analytics)

- `ID_TIPO_DOCUMENTO IN ('FACTURA', 'TPV')`
- `EMPRESA = 1` (Sánchez Giner I S.A.)
- Excluye `familia 00000` (anticipos/deducciones de cliente)
- Sin filtro de serie (todas incluidas)
- Regla de outliers: si `|coste| > |venta| × 10` Y `|coste| > 1.000€`, neutralizar coste
- **Validación junio 2025:** ratio 1.0003x ventas, 0.9998x costes vs Excel OAS Analytics

### Fuente de datos

- CSV: `/sftp/sftp_daemon4/uploads/0_VIEW_OBI_893.csv`
- Tamaño: ~820 MB, 1M+ filas
- Encoding: latin1, separador `;`

---

## Tablas destino (chs_platform @ 10.10.10.200:5433)

### `direccion.cuadro_mando`

| Propiedad | Valor |
|-----------|-------|
| **Filas** | 10.796 |
| **Rango** | 2025-01-02 → 2026-03-14 (394 días) |
| **Granularidad** | Diaria (una fila por fecha + tienda + categoría) |
| **Rollups** | Ninguno — la app calcula totales con `SUM(...) WHERE fecha BETWEEN ...` |
| **Clave única** | `(fecha, tienda, categoria)` |
| **Estrategia** | TRUNCATE + INSERT (recarga completa) |

```sql
CREATE TABLE direccion.cuadro_mando (
    id           SERIAL PRIMARY KEY,
    fecha        DATE NOT NULL,
    tienda       VARCHAR(50) NOT NULL,
    categoria    VARCHAR(50) NOT NULL,
    venta        NUMERIC(14,2) NOT NULL DEFAULT 0,
    coste        NUMERIC(14,2) NOT NULL DEFAULT 0,
    margen       NUMERIC(14,2) NOT NULL DEFAULT 0,
    margen_pct   NUMERIC(6,2),
    num_lineas   INTEGER NOT NULL DEFAULT 0,
    num_tickets  INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fecha, tienda, categoria)
);
-- Índices: idx_cm_fecha, idx_cm_tienda, idx_cm_categoria, idx_cm_fecha_tienda
```

**Script:** `etl_cuadro_mando.py`
- Outlier fix: `total_coste = Decimal("0")` (margen = venta para esas líneas)
- Tiendas en minúsculas sin espacios (ej. `motril`, `chs_web`, `shiito_es`)
- Categorías: muebles, electro, cocinas, reformas, servicios, otros

### `erp.ventas_real`

| Propiedad | Valor |
|-----------|-------|
| **Filas** | 1.187 |
| **Rango** | Ene 2025 → Mar 2026 (campos `anio` + `mes`, sin columna `fecha`) |
| **Granularidad** | Mensual |
| **Rollups** | SÍ — filas `total` por tienda + filas `EMPRESA` (código `0`) por categoría y total |
| **Clave única** | `(anio, mes, tienda_codigo, categoria)` |
| **Estrategia** | TRUNCATE + INSERT (recarga completa) |

```sql
-- Columnas principales:
id, anio, mes, tienda_codigo, tienda, categoria, canal,
venta_bruta, venta_neta, coste, margen, margen_pct,
num_lineas, num_unidades
```

**Script:** `etl_ventas_real.py`
- Outlier fix: `total_coste = total_bi` (margen = 0 para esas líneas)
- Tiendas en MAYÚSCULAS con espacios (ej. `MOTRIL`, `CHS WEB`, `KIBUC GRANADA`)
- Campo `canal` en minúsculas para el dashboard
- 16 tiendas + `EMPRESA` como rollup

---

## Diferencias entre los dos ETLs

| Aspecto | cuadro_mando | ventas_real |
|---------|-------------|-------------|
| Granularidad | Diaria | Mensual |
| Rollups | No | Sí (total tienda + EMPRESA) |
| Nombres tienda | minúsculas (`motril`) | MAYÚSCULAS (`MOTRIL`) |
| Outlier coste | → 0 (margen = venta) | → venta (margen = 0) |
| Campo canal | No | Sí |
| Campo fecha | `fecha DATE` | `anio INT` + `mes INT` |
| Tickets | Sí (`num_tickets`) | No |

---

## Validación de datos (junio 2025 vs OAS Analytics)

### Comparativa global

| Métrica | ETL (VIEW_OBI) | Excel OAS | Ratio |
|---------|---------------|-----------|-------|
| Ventas BI | 2.659.341 | 2.658.528 | 1.0003x |
| Coste Ventas | 1.773.311 | 1.773.749 | 0.9998x |
| Margen Bruto | 886.030 | 884.778 | 1.0014x |
| MB% | 33,3% | 33,3% | ✓ |

### Outliers corregidos

- 17 líneas en todo el dataset (2025-2026)
- Todas del mismo tipo: costes absurdos del ERP (ej. -387K€ en una venta de 95€)
- Regla: `|coste| > |venta| × 10` Y `|coste| > 1.000€`

---

*Generado por Claude Code, 15 marzo 2026*
