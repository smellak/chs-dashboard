# Test: LINFAC TIPOLINEA=A vs VIEW_OBI todas las lineas

**Fecha:** 15 marzo 2026
**VM:** DBBI (10.10.10.102), usuario `chs-etl2`

---

## Hipotesis

Se probo filtrar LINFAC por `TIPOLINEA='A'` (solo articulos reales) para eliminar la inflacion x2.4 en los datos de ventas, bajo la teoria de que las composiciones o lineas duplicadas causaban el problema.

## Metodologia

1. Se cargo CABFAC (178.877 cabeceras de factura) para obtener fechas
2. Se cruzo con LINFAC (366.874 lineas) filtrando julio 2025, empresa=1
3. Se comparo TIPOLINEA=A sola vs todas las lineas vs referencia comite
4. Se anadio LTPV (tickets TPV) cruzando con CTPV (5.686 tickets jul25)

## Desglose LINFAC julio 2025 por SERIE + TIPOLINEA

| Serie | Tipo | Lineas | Importe EUR | Descripcion |
|-------|------|--------|-------------|-------------|
| 0 | A | 19.186 | +3.127.052 | Articulos en facturas normales |
| 0 | L | 4.618 | -1.832.769 | **Anticipos (deducciones negativas)** |
| 4 | N | 4.446 | +1.485.354 | Notas en facturas de anticipo |
| 17 | A | 166 | +299.261 | Articulos Contract |
| 3 | B | 960 | -150.292 | Abonos/devoluciones |
| 4 | L | 46 | -38.421 | Anticipos en S4 |
| 3 | A | 162 | -38.254 | Articulos en abonos |
| 18 | B | 6 | -27.692 | Abonos Contract |
| 13 | A | 758 | +26.223 | Articulos TPV factura |
| 17 | C | 4 | +23.606 | Composiciones Contract |
| 17 | P | 29 | +16.308 | Packs Contract |
| 14 | A | 9 | -1.618 | Articulos TPV abono |
| Resto | | ~137 | ~varios | Lineas menores |

**Composiciones (tipo C): solo 10 lineas en total.** No son la causa de la inflacion.

## Resultados: Comparativa por tienda (julio 2025)

### Opcion D: LINFAC solo TIPOLINEA=A (series 0+3+13+14)

| Tienda | LINFAC A | Comite ref | Ratio | Resultado |
|--------|---------|------------|-------|-----------|
| ALBAN | 959.099 | 352.093 | 2.724x | INFLADO |
| MOTRIL | 564.955 | 198.907 | 2.840x | INFLADO |
| JUNCARIL | 441.312 | 133.750 | 3.300x | INFLADO |
| ALMERIA | 250.991 | 94.699 | 2.650x | INFLADO |
| ANTEQUERA | 250.948 | 94.917 | 2.644x | INFLADO |
| **EMPRESA** | **3.113.403** | **1.189.833** | **2.617x** | **INFLADO** |

### Opcion D + LTPV: LINFAC A + tickets TPV

| Tienda | LINFAC A | LTPV | Suma | Comite ref | Ratio |
|--------|---------|------|------|------------|-------|
| ALBAN | 959.099 | 83.805 | 1.042.904 | 352.093 | 2.962x |
| MOTRIL | 564.955 | 22.354 | 587.309 | 198.907 | 2.953x |
| JUNCARIL | 441.312 | 6.213 | 447.525 | 133.750 | 3.346x |
| ALMERIA | 250.991 | 9.490 | 260.481 | 94.699 | 2.751x |
| ANTEQUERA | 250.948 | 32.077 | 283.025 | 94.917 | 2.982x |
| **EMPRESA** | **3.113.403** | **143.457** | **3.256.860** | **1.189.833** | **2.737x** |

### ETL actual: VIEW_OBI todas las lineas (S0+S3+S13+S14)

| Tienda | VIEW_OBI | Comite ref | Ratio | Resultado |
|--------|---------|------------|-------|-----------|
| ALBAN | 201.418 | 352.093 | 0.572x | Bajo (anticipos) |
| MOTRIL | 164.165 | 198.907 | 0.825x | Cercano |
| JUNCARIL | 124.441 | 133.750 | 0.930x | OK |
| ALMERIA | 37.323 | 94.699 | 0.394x | Bajo (anticipos) |
| ANTEQUERA | 62.029 | 94.917 | 0.654x | Bajo |
| **EMPRESA** | **1.125.094** | **1.189.833** | **0.946x** | **MEJOR** |

## Tabla resumen de opciones

| Enfoque | EMPRESA Jul25 | vs Comite | Veredicto |
|---------|--------------|-----------|-----------|
| **VIEW_OBI todas las lineas (actual)** | **1.125.094** | **0.946x** | **El mejor disponible** |
| LINFAC solo TIPOLINEA=A | 3.113.403 | 2.617x | Peor que actual |
| LINFAC A + LTPV | 3.256.860 | 2.737x | Aun peor |
| Solo LTPV (TPV puro) | 143.457 | 0.121x | Insuficiente |

## Conclusion

**Filtrar por TIPOLINEA=A EMPEORA los resultados** en vez de mejorarlos.

La inflacion NO viene de composiciones (solo 10 lineas tipo C) ni de lineas duplicadas. Las lineas tipo A contienen el importe bruto del articulo. Las lineas tipo L (anticipos) son **deducciones reales y necesarias** que representan los pagos a cuenta del cliente:

```
S0 Articulos (tipo A):    +3.127.052 EUR
S0 Anticipos (tipo L):    -1.832.769 EUR
                          ────────────────
S0 Neto (A + L):          +1.294.283 EUR  (1.088x comite)
```

El ETL actual usando VIEW_OBI con todas las lineas (que equivale a A+L+B+todo) produce el total EMPRESA mas cercano al comite (0.946x). La diferencia del 5.4% probablemente viene de logica interna de OAS Analytics no disponible en los CSVs.

**La desviacion por tienda** (Alban 0.57x, Almeria 0.39x) se debe a que los anticipos no se distribuyen uniformemente entre tiendas. Un cliente puede hacer el anticipo en una tienda y recoger/facturar en otra.

---

*Generado por Claude Code, 15 marzo 2026*
