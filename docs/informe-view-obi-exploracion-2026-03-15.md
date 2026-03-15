# Informe de Exploracion: VIEW_OBI para Cuadro de Direccion

**Fecha:** 15 marzo 2026
**VM:** DBBI (10.10.10.102), usuario `chs-etl2`
**Autor:** Claude Code (sesion de exploracion)

---

## 1. Columnas del VIEW_OBI (92 columnas)

Fichero: `/sftp/sftp_daemon4/uploads/0_VIEW_OBI_893.csv`
Formato: separador `;`, encoding Latin-1, ~1.037.118 filas

| # | Columna | Relevancia |
|---|---------|-----------|
| 1 | ID_TIPO_DOCUMENTO | Filtro principal |
| 2 | EMPRESA | Filtro (=1 para CHS) |
| 5 | SERIE | Filtro (S0, S3, S13, S14...) |
| 6 | NUMERO | ID documento |
| 7 | EJERCICIO | Ano |
| 8 | LINEA | ID linea dentro del doc |
| 13 | FECHA | Fecha (DD/MM/YYYY HH:MM:SS) |
| 15 | TIENDA | Codigo tienda |
| 16 | NOMBRE_TIENDA | Nombre tienda |
| 20 | ARTICULO | Codigo articulo |
| 25 | CANTIDAD | Unidades (para UPT) |
| 28 | PRECIO | Precio unitario |
| 29 | DTOLIN | Descuento linea |
| 31 | TOTHAL | Total con IVA |
| 41 | TOTAL_BI | **Total base imponible (venta neta)** |
| 42 | TOTAL_COSTE | Coste |
| 50 | ESTADO_PEDIDO | Estado del pedido |
| 57 | FAMILIA | Familia producto (jerarquica, dotted) |
| 63 | OFERTA | Codigo de oferta |
| 73-75 | ANO_DOC, MES_DOC, DIA_DOC | Fecha desglosada |

Listado completo de las 92 columnas:

```
 1. ID_TIPO_DOCUMENTO    24. ALMACEN               47. SERIE_PROVEE          70. LINEA_PED
 2. EMPRESA              25. CANTIDAD               48. SERIE_VENDEDOR        71. COMISION
 3. NOMBRE_EMPRESA       26. CANTREC                49. VENDEDOR              72. COMIS_PREVISTA
 4. COD_Y_EMPRESA        27. CANTSERV               50. ESTADO_PEDIDO         73. ANO_DOC
 5. SERIE                28. PRECIO                 51. ESTADO_RECIBIDO       74. MES_DOC
 6. NUMERO               29. DTOLIN                 52. ESTADO_RECIBIDO2      75. DIA_DOC
 7. EJERCICIO            30. PNETO                  53. ESTADO_ENTREGADO      76. ENTIENDA
 8. LINEA                31. TOTHAL                 54. ESTADO_FACTURADO      77. ESTADO_PEDIDO_LIN
 9. SERIE_CLIENTE        32. TOTAL                  55. REFPROV               78. ESTADO_RECIBIDO_LIN
10. CLIENTE              33. PRECIOCOMPRA           56. DESCRIPCION_ARTICULO  79. ESTADO_RECIBIDO2_LIN
11. DIRENV               34. PVP_ESTAD              57. FAMILIA               80. ESTADO_ENTREGADO_LIN
12. REFPED               35. TIPOIVA                58. MARCA                 81. ESTADO_FACTURADO_LIN
13. FECHA                36. COSTERAEE              59. SERIE_ARTICULO        82. ACCION_DML
14. FECHASERV            37. PRECIO_BI              60. PROPIEDAD             83. IDENTIF_FILA
15. TIENDA               38. DTOLIN_BI              61. LPRODUCTO             84. ORDEN_INSERCION
16. NOMBRE_TIENDA        39. PNETO_BI               62. PROGRAMA              85. FECHA_ALTA
17. COD_Y_TIENDA         40. TOTHAL_BI              63. OFERTA                86. FIJO_VENDEDOR_DOC
18. CONFIRMADO           41. TOTAL_BI               64. GASTOS                87. COMISION_DOC
19. FPAGO                42. TOTAL_COSTE            65. PORTES                88. FECHA_ULTIMA_RECARGA
20. ARTICULO             43. PVP_ESTAD_BI           66. EMPRESA_PED           89. ESTADO_COBRADO
21. DESCRIPCION          44. CANTIDAD_UMEDIDA_VENTA 67. SERIE_PED             90. DESC_FPAGO
22. DESCRIPCION2         45. UMEDIDA_VENTA          68. NUMERO_PED            91. MOTIVO_DTO
23. OBSERVALM            46. SERIE_PROVEE           69. EJERCICIO_PED         92. RUTA
```

## 2. Campo TIENDA y valores

Campo: col 15 (`TIENDA`) + col 16 (`NOMBRE_TIENDA`)

### 15 tiendas con datos de FACTURA (empresa=1)

| Codigo | Nombre CSV | Tipo | Canal dashboard | Ref Excel Jul25 |
|--------|-----------|------|-----------------|-----------------|
| 2 | MOTRIL | Fisica | `motril` | 107.585 EUR |
| 5 | JUNCARIL | Fisica | `juncaril` | 94.432 EUR (="Granada") |
| 6 | ALMERIA | Fisica | `almeria` | 101.750 EUR |
| 7 | CONTRACT | B2B | `contract` | - |
| 8 | ALBAN | Fisica | `alban` | 118.735 EUR |
| 9 | ANTEQUERA | Fisica | `antequera` | ~43-86K EUR |
| 100 | SERVICIOS CENTRALES | Interno | `servicios_centrales` | - |
| 101 | KIBUC GRANADA | Marca | `kibuc` | - |
| 201 | SHIITO (ES) | E-commerce | `shiito_es` | - |
| 301 | CHS WEB | E-commerce | `chs_web` | - |
| 402 | AMAZON (ES) | Marketplace | `amazon` | - |
| 406 | CARREFOUR | Marketplace | `carrefour` | - |
| 411 | MEDIA MARKT | Marketplace | `media_markt` | - |
| 412 | WORTEN (ES) | Marketplace | `worten` | - |
| 413 | LEROY MERLIN | Marketplace | `leroy_merlin` | - |

> **Nota:** "Granada" del Excel corresponde a JUNCARIL (codigo 5). No hay tienda llamada "Granada" en el ERP.

## 3. Tipos de documento disponibles

| Tipo | Filas (emp=1) | Series | Descripcion |
|------|--------------|--------|-------------|
| **FACTURA** | 364.603 | S0(275K), S4(65K), S3(11K), S13(10K), S17(1.7K), S18, S14, S16, S1 | Facturas fiscales |
| **TPV** | 140.741 | S13(132K), S14(8.6K), S3(10) | **Tickets de caja (retail)** |
| TPV fact | 4.609 | S13(4.5K), S0(59) | TPV que generaron factura |
| PEDIDO | 243.872 | S0(239K), S3(2.4K), S17, S16, S1 | Pedidos (preceden factura) |
| ALBARAN | 232.827 | S0(222K), S3(9K), S17, S18, S16 | Albaranes de entrega |
| PRESUPUESTO | 47.762 | S11(46K), S0(1.2K) | Presupuestos comerciales |

### Hallazgo critico: FACTURA y TPV son tipos SEPARADOS

- **FACTURA S13** y **TPV S13** no comparten documentos (overlap = 0)
- FACTURA S13 = pocos tickets TPV que se convirtieron en factura fiscal (70 docs Alban Jul25)
- TPV = todos los tickets retail (2.543 tickets Alban Jul25)
- **Nuestro ETL anterior solo usaba FACTURA, ignorando TPV completamente**

## 4. Campos de importe

| Campo | Col | Descripcion | Uso |
|-------|-----|-------------|-----|
| **TOTAL_BI** | 41 | Base imponible por linea | **Principal para venta neta** |
| **TOTAL_COSTE** | 42 | Coste de la linea | Para margen (poco fiable) |
| TOTHAL | 31 | Total con IVA | Venta bruta |
| TOTHAL_BI | 40 | Total BI (equivalente) | Redundante con TOTAL_BI |
| PRECIO | 28 | Precio unitario bruto | |
| PNETO | 30 | Precio neto tras descuentos | |
| DTOLIN | 29 | Descuento en linea | |
| PRECIOCOMPRA | 33 | Precio de compra | |

## 5. Identificacion de ticket unico

`(EMPRESA, SERIE, NUMERO, EJERCICIO)` identifica un documento unico.
`(EMPRESA, SERIE, NUMERO, EJERCICIO, LINEA)` identifica una linea unica.

Verificado: **no hay duplicados** de (NUMERO, LINEA) dentro del mismo tipo+serie.

## 6. Campo de cantidad/unidades

**CANTIDAD** (col 25): unidades por linea.
- Para calcular UPT: `SUM(ABS(CANTIDAD)) / COUNT(DISTINCT tickets)`
- Valores tipicos: 1-5 para articulos, 1 para servicios

## 7. Rango de fechas disponible

| Ano | Filas | Estado |
|-----|-------|--------|
| 2024 | 0 | **NO DISPONIBLE** |
| 2025 | 865.987 | Completo (Ene-Dic) |
| 2026 | 171.131 | Parcial (Ene-Mar) |

- `chsanalytics` tampoco tiene 2024
- No hay backups ni ficheros historicos
- El Daemon vuelca solo ano actual + anterior
- **Imposible calcular % Growth MTD ni % Vs LY sin datos 2024**

## 8. Hallazgos sobre composiciones y la inflacion x2.4

### No son composiciones

- LINFAC tiene campo `TIPOLINEA` con estos valores:

| Tipo | Filas | Descripcion |
|------|-------|-------------|
| A | 234.434 | Articulo (lineas de producto) |
| N | 64.188 | Nota/comentario |
| L | 56.442 | **Anticipo (deduccion negativa)** |
| B | 9.674 | Abono/devolucion |
| P | 1.992 | Pack |
| **C** | **121** | **Composicion (solo 121 lineas!)** |
| J | 19 | Ajuste |
| S | 4 | Servicio |

- Solo **121 lineas tipo C** en todo el fichero. **Las composiciones NO son la causa de la inflacion.**
- VIEW_OBI **no tiene campo TIPOLINEA** — incluye TODAS las lineas sin distincion.

### Causa real: FACTURA S0 incluye lineas tipo L (anticipos)

Ejemplo LINFAC S0, Alban, 2025 completo:
- Lineas A (articulos): 47.842 lineas = **8.830.151 EUR**
- Lineas L (anticipos): 17.075 lineas = **-6.454.561 EUR**
- Neto: **2.389.088 EUR**

Los anticipos (familia 00000) son deducciones de pagos a cuenta del cliente. Reducen el importe neto de las facturas pero no son "composiciones" en el sentido de piezas de mueble.

### Causa real de que nada cuadre con el Excel: son fuentes de datos distintas

| Fuente | Alban Jul25 | Motril Jul25 | Almeria Jul25 | Juncaril Jul25 |
|--------|------------|-------------|--------------|----------------|
| FACTURA S0 | 251.117 | 218.270 | 47.838 | 143.184 |
| TPV | 73.371 | 18.466 | 12.831 | 14.476 |
| FACTURA+TPV | 324.488 | 236.737 | 60.669 | 157.661 |
| **Excel ref** | **118.735** | **107.585** | **101.750** | **94.432** |

- FACTURA S0 sola: **~2x** el Excel
- TPV solo: **~30-60%** del Excel
- FACTURA+TPV: **~3x** el Excel
- **Ninguna combinacion directa cuadra con el Excel**

## 9. Esquema destino `direccion` (ya existe)

### Tablas existentes

**`direccion.tiendas`** — 16 filas, ya poblada:

| codigo | nombre | tipo |
|--------|--------|------|
| alban | Alban | tienda_fisica |
| motril | Motril | tienda_fisica |
| almeria | Almeria | tienda_fisica |
| juncaril | Juncaril | tienda_fisica |
| antequera | Antequera | tienda_fisica |
| chs_web | CHS Web | ecommerce |
| shiito_es | Shiito | ecommerce |
| contract | Contract | contract |
| kibuc | Kibuc Granada | marketplace |
| amazon | Amazon | marketplace |
| carrefour | Carrefour | marketplace |
| media_markt | Media Markt | marketplace |
| worten | Worten | marketplace |
| leroy_merlin | Leroy Merlin | marketplace |
| servicios_centrales | Servicios Centrales | interno |
| empresa | Empresa (Total) | consolidado |

**`direccion.categorias`** — 7 filas, ya poblada:
- muebles, electro, cocinas, reformas, servicios, otros, anticipos

### Tablas pendientes de crear

- `direccion.historico_anual` — datos reales mensuales (ventas, margen)
- `direccion.objetivos` — presupuestos/objetivos (carga manual)
- `direccion.subfamilias` — opcional, mapping de subfamilias

## 10. Datos complementarios disponibles

### CTPV (cabeceras tickets TPV) — 88.876 filas
- Tiene TIENDA, FECHA, CLIENTE pero **TOTBASIMP = 0** (no precalculado)
- Series: S13 (77.760), S-1 (6.068), S14 (4.967)
- **S-1 NO aparece en VIEW_OBI** — 6.068 tickets perdidos

### LTPV (lineas tickets TPV) — 156.129 filas
- Tiene COMPOSICION (todo=0), ORDEN_COMPOSICION (todo=0), TIPO_LINEA (todo=N)
- Importes en TOTHAL_BI
- Total emp=1: 1.932.372 EUR (2025+2026)

### LINFAC (lineas factura) — 366.874 filas
- **Tiene TIPOLINEA** (A/L/B/C/P/N/J/S) — clave para filtrar
- Tiene TIENDA (col 34) y link a CABFAC via (SERIE, NUMERO, EJERCICIO)

### 0_FAMILIAS_893.csv — 1.244 filas
- Jerarquia de familias con ID dotted (ej: `00001.00057.00003`)
- Permite mapear subfamilias a categorias

## 11. Pregunta clave pendiente

**Que fuente de datos usar para el dashboard?**

| Opcion | EMPRESA total Jul25 | vs Excel (1.607K) | Problema |
|--------|--------------------|--------------------|----------|
| A) FACTURA S0+S3+S13+S14 | 1.125.094 | 0.70x | Inflada ~2x por tienda |
| B) Solo TPV | 146.058 | 0.09x | Muy incompleto |
| C) FACTURA + TPV | ~1.271.000 | 0.79x | Doble conteo probable |
| D) LINFAC filtrada (solo tipo A) | ? (por calcular) | ? | Excluye anticipos |

El Excel de referencia usa una fuente distinta (probablemente OAS Analytics) cuya logica de agregacion no esta disponible en los CSVs crudos.

---

*Generado por Claude Code en sesion de exploracion, 15 marzo 2026*
