import { useCallback, useState } from 'react'
import { Eye, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { reporteService } from '@/services/reporteService'
import {
  CATEGORIA_LABELS,
  type EquipoMasUtilizado,
  type MovimientoEquipo,
  type PrestamosPorArea,
  type TipoMovimiento,
} from '@/types'

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string }[] = [
  { value: 'Registro', label: 'Registro de equipo' },
  { value: 'PrestamoAprobado', label: 'Préstamo aprobado' },
  { value: 'Devolucion', label: 'Devolución' },
  { value: 'CambioEstado', label: 'Cambio de estado' },
  { value: 'Actualizacion', label: 'Actualización' },
]

export function ReportesPage() {
  const [movSearch, setMovSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<TipoMovimiento | ''>('')

  const fetchResumen = useCallback(async () => {
    const [masUtilizados, porArea] = await Promise.all([
      reporteService.getEquiposMasUtilizados(10),
      reporteService.getPrestamosPorArea(),
    ])
    return { masUtilizados, porArea }
  }, [])

  const fetchMovimientos = useCallback(
    () =>
      reporteService.getMovimientos({
        search: movSearch,
        tipoMovimiento: tipoFilter,
      }),
    [movSearch, tipoFilter],
  )

  const { data: resumen, isLoading: loadingResumen } = useAsyncData(fetchResumen, {
    masUtilizados: [] as EquipoMasUtilizado[],
    porArea: [] as PrestamosPorArea[],
  })

  const { data: movimientos, isLoading: loadingMovs } = useAsyncData(
    fetchMovimientos,
    [] as MovimientoEquipo[],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reportes e Historial de Movimientos</h2>
        <p className="text-sm text-muted-foreground">
          Indicadores de utilización de equipos, demanda por área y auditoría completa de movimientos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipos Más Utilizados</CardTitle>
            <CardDescription>Activos con mayor cantidad de préstamos aprobados/devueltos.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingResumen ? (
              <div className="p-6 text-sm text-muted-foreground">Cargando reporte...</div>
            ) : resumen.masUtilizados.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Sin préstamos registrados"
                  description="Cuando existan préstamos aprobados o devueltos aparecerán aquí."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Préstamos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumen.masUtilizados.map((item) => (
                    <TableRow key={item.equipoId}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {item.codigoPatrimonial}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">{item.marca}</p>
                      </TableCell>
                      <TableCell>{CATEGORIA_LABELS[item.categoria]}</TableCell>
                      <TableCell className="text-right font-bold">{item.totalPrestamos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Préstamos por Área</CardTitle>
            <CardDescription>Uso de equipos tecnológicos desagregado por área funcional.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingResumen ? (
              <div className="p-6 text-sm text-muted-foreground">Cargando reporte...</div>
            ) : resumen.porArea.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Sin datos por área"
                  description="Aún no se registran préstamos asociados a áreas funcionales."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Área funcional</TableHead>
                    <TableHead className="text-right">Activos</TableHead>
                    <TableHead className="text-right">Total histórico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumen.porArea.map((item) => (
                    <TableRow key={item.area}>
                      <TableCell className="font-medium">{item.area}</TableCell>
                      <TableCell className="text-right">{item.prestamosActivos}</TableCell>
                      <TableCell className="text-right font-bold">{item.totalPrestamos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>
                Trazabilidad de altas, préstamos, devoluciones y cambios de estado.
              </CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipo o detalle..."
                  value={movSearch}
                  onChange={(e) => setMovSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value as TipoMovimiento | '')}
              >
                <option value="">Todos los movimientos</option>
                {TIPOS_MOVIMIENTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingMovs ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando movimientos...</div>
          ) : movimientos.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Sin movimientos registrados"
                description="No existen movimientos para los filtros aplicados."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Transición de Estado</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(m.fechaMovimiento).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs font-semibold">{m.equipoCodigoPatrimonial}</p>
                      <p className="text-sm">{m.equipoNombre}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.tipoMovimiento}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {m.estadoAnterior ? `${m.estadoAnterior} → ${m.estadoNuevo}` : m.estadoNuevo}
                    </TableCell>
                    <TableCell className="text-sm">{m.usuarioResponsableNombre ?? 'Sistema'}</TableCell>
                    <TableCell className="max-w-md text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{m.detalle}</span>
                        <Popover>
                          <Tooltip>
                            <PopoverTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0"
                                  aria-label="Ver detalle completo"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                            </PopoverTrigger>
                            <TooltipContent>Ver detalle completo</TooltipContent>
                          </Tooltip>
                          <PopoverContent align="end" className="w-84 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                              <span className="font-mono text-xs font-bold text-primary">
                                {m.equipoCodigoPatrimonial}
                              </span>
                              <Badge variant="outline">{m.tipoMovimiento}</Badge>
                            </div>
                            <p className="text-xs font-semibold text-foreground">{m.equipoNombre}</p>
                            <p className="text-xs leading-relaxed text-muted-foreground">{m.detalle}</p>
                            <div className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                              Responsable: <span className="font-semibold text-foreground">{m.usuarioResponsableNombre ?? 'Sistema'}</span>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
