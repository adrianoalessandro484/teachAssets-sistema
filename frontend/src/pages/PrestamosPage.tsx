import { useCallback, useState } from 'react'
import { Check, CornerDownLeft, MessageSquareText, Plus, Search, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { QuickTooltip } from '@/components/ui/tooltip'
import { ConfirmPopover } from '@/components/shared/ConfirmPopover'
import { EmptyState } from '@/components/shared/EmptyState'
import { PrestamoStatusBadge } from '@/components/shared/StatusBadge'
import { DevolucionModal } from '@/components/prestamos/DevolucionModal'
import { RechazarPrestamoModal } from '@/components/prestamos/RechazarPrestamoModal'
import { SolicitarPrestamoModal } from '@/components/prestamos/SolicitarPrestamoModal'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { equipoService } from '@/services/equipoService'
import { prestamoService } from '@/services/prestamoService'
import type { Equipo, EstadoPrestamo, Prestamo } from '@/types'

const ESTADOS_PRESTAMO: EstadoPrestamo[] = ['Pendiente', 'Activo', 'Devuelto', 'Rechazado']

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function PrestamosPage() {
  const { hasRole } = useAuth()
  const { showSuccess, showError } = useToast()
  const canApprove = hasRole('Administrador', 'ResponsableTecnologia')

  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoPrestamo | ''>('')
  const [areaFilter, setAreaFilter] = useState('')

  const [solicitarOpen, setSolicitarOpen] = useState(false)
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null)
  const [devolucionOpen, setDevolucionOpen] = useState(false)
  const [rechazarOpen, setRechazarOpen] = useState(false)

  const fetcher = useCallback(
    () =>
      prestamoService.getAll({
        search,
        estado: estadoFilter,
        area: areaFilter,
      }),
    [search, estadoFilter, areaFilter],
  )

  const { data: prestamos, isLoading, reload } = useAsyncData(fetcher, [] as Prestamo[])

  const openSolicitarModal = async () => {
    try {
      const disponibles = await equipoService.getAll({ estado: 'Disponible' })
      setEquiposDisponibles(disponibles)
      setSolicitarOpen(true)
    } catch (err) {
      showError('Error al cargar equipos disponibles', err instanceof Error ? err.message : undefined)
    }
  }

  const handleAprobar = async (prestamo: Prestamo) => {
    try {
      await prestamoService.aprobar(prestamo.id)
      showSuccess(
        'Préstamo aprobado',
        `Se asignó ${prestamo.equipoCodigoPatrimonial} a ${prestamo.usuarioNombre}.`,
      )
      await reload()
    } catch (err) {
      showError('No se pudo aprobar el préstamo', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Préstamos</h2>
          <p className="text-sm text-muted-foreground">
            Flujo de solicitudes (Pendiente), aprobación de responsable (Activo) y devoluciones (Devuelto).
          </p>
        </div>

        <Button onClick={openSolicitarModal}>
          <Plus className="h-4 w-4" />
          Solicitar préstamo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipo, código o colaborador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoPrestamo | '')}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_PRESTAMO.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </Select>

            <Input
              placeholder="Filtrar por área (ej. Desarrollo)..."
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando préstamos...</div>
          ) : prestamos.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No se encontraron préstamos"
                description="No hay registros que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Colaborador / Área</TableHead>
                  <TableHead>Fecha Préstamo</TableHead>
                  <TableHead>Devolución Est. / Real</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                  {canApprove && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestamos.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell>
                      <p className="font-mono text-xs font-semibold">{pr.equipoCodigoPatrimonial}</p>
                      <p className="text-sm font-medium">{pr.equipoNombre}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{pr.usuarioNombre}</p>
                      <p className="text-xs text-muted-foreground">{pr.usuarioArea}</p>
                    </TableCell>
                    <TableCell className="text-xs">{formatDateTime(pr.fechaPrestamo)}</TableCell>
                    <TableCell className="text-xs">
                      <p>Est: {formatDateTime(pr.fechaDevolucionEstimada)}</p>
                      {pr.fechaDevolucion && (
                        <p className="font-medium text-emerald-700">
                          Real: {formatDateTime(pr.fechaDevolucion)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{pr.responsableNombre ?? 'Pendiente'}</TableCell>
                    <TableCell>
                      <PrestamoStatusBadge estado={pr.estado} />
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground">
                      {pr.observacion || pr.observacionDevolucion ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                              <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                              Ver notas
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-80 space-y-2.5">
                            <p className="border-b border-border pb-2 text-xs font-bold text-foreground">
                              Observaciones — {pr.equipoCodigoPatrimonial}
                            </p>
                            {pr.observacion && (
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                                  Solicitud
                                </p>
                                <p className="text-xs text-foreground">{pr.observacion}</p>
                              </div>
                            )}
                            {pr.observacionDevolucion && (
                              <div className="space-y-0.5 rounded-xl bg-muted/60 p-2.5">
                                <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                                  Recepción / Resolución
                                </p>
                                <p className="text-xs text-foreground">{pr.observacionDevolucion}</p>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    {canApprove && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {pr.estado === 'Pendiente' && (
                            <>
                              <ConfirmPopover
                                title="¿Aprobar préstamo?"
                                description={`Se asignará ${pr.equipoCodigoPatrimonial} (${pr.equipoNombre}) a ${pr.usuarioNombre}.`}
                                confirmLabel="Aprobar"
                                tooltip="Aprobar solicitud de préstamo"
                                onConfirm={() => handleAprobar(pr)}
                              >
                                <Button size="sm" variant="default">
                                  <Check className="h-3.5 w-3.5" />
                                  Aprobar
                                </Button>
                              </ConfirmPopover>
                              <QuickTooltip label="Rechazar solicitud">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedPrestamo(pr)
                                    setRechazarOpen(true)
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Rechazar
                                </Button>
                              </QuickTooltip>
                            </>
                          )}
                          {pr.estado === 'Activo' && (
                            <QuickTooltip label="Registrar devolución del equipo">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPrestamo(pr)
                                  setDevolucionOpen(true)
                                }}
                              >
                                <CornerDownLeft className="h-3.5 w-3.5" />
                                Devolver
                              </Button>
                            </QuickTooltip>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SolicitarPrestamoModal
        open={solicitarOpen}
        onOpenChange={setSolicitarOpen}
        equiposDisponibles={equiposDisponibles}
        onSaved={reload}
      />

      <DevolucionModal
        open={devolucionOpen}
        onOpenChange={setDevolucionOpen}
        prestamo={selectedPrestamo}
        onSaved={reload}
      />

      <RechazarPrestamoModal
        open={rechazarOpen}
        onOpenChange={setRechazarOpen}
        prestamo={selectedPrestamo}
        onSaved={reload}
      />
    </div>
  )
}
