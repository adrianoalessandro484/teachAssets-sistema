import { useCallback, useState } from 'react'
import { Edit, HandHelping, Info, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { QuickTooltip, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfirmPopover } from '@/components/shared/ConfirmPopover'
import { EmptyState } from '@/components/shared/EmptyState'
import { EquipoStatusBadge } from '@/components/shared/StatusBadge'
import { EquipoFormModal } from '@/components/equipos/EquipoFormModal'
import { CambiarEstadoModal } from '@/components/equipos/CambiarEstadoModal'
import { SolicitarPrestamoModal } from '@/components/prestamos/SolicitarPrestamoModal'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { equipoService } from '@/services/equipoService'
import { CATEGORIA_LABELS, type CategoriaEquipo, type Equipo, type EstadoEquipo } from '@/types'

const CATEGORIAS = Object.keys(CATEGORIA_LABELS) as CategoriaEquipo[]
const ESTADOS: EstadoEquipo[] = ['Disponible', 'Prestado', 'Mantenimiento', 'Baja']

export function EquiposPage() {
  const { hasRole } = useAuth()
  const { showSuccess, showError } = useToast()
  const canManage = hasRole('Administrador', 'ResponsableTecnologia')
  const isAdmin = hasRole('Administrador')

  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaEquipo | ''>('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoEquipo | ''>('')

  const [formOpen, setFormOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)
  const [estadoModalOpen, setEstadoModalOpen] = useState(false)
  const [solicitarOpen, setSolicitarOpen] = useState(false)
  const [equipoParaPrestar, setEquipoParaPrestar] = useState<string | undefined>()

  const fetcher = useCallback(
    () =>
      equipoService.getAll({
        search,
        categoria: categoriaFilter,
        estado: estadoFilter,
      }),
    [search, categoriaFilter, estadoFilter],
  )

  const { data: equipos, isLoading, reload } = useAsyncData(fetcher, [] as Equipo[])

  const handleDelete = async (equipo: Equipo) => {
    try {
      await equipoService.delete(equipo.id)
      showSuccess('Equipo eliminado', `Se eliminó ${equipo.codigoPatrimonial} del inventario.`)
      await reload()
    } catch (err) {
      showError('No se pudo eliminar', err instanceof Error ? err.message : undefined)
    }
  }

  const equiposDisponibles = equipos.filter((e) => e.estado === 'Disponible')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventario de Equipos</h2>
          <p className="text-sm text-muted-foreground">
            Consulta disponibilidad, registra activos y controla su estado operativo.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEquipoParaPrestar(undefined)
              setSolicitarOpen(true)
            }}
          >
            <HandHelping className="h-4 w-4" />
            Solicitar préstamo
          </Button>
          {canManage && (
            <Button
              onClick={() => {
                setSelectedEquipo(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Registrar equipo
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, nombre, marca o ubicación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value as CategoriaEquipo | '')}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORIA_LABELS[cat]}
                </option>
              ))}
            </Select>

            <Select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoEquipo | '')}
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando inventario...</div>
          ) : equipos.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No se encontraron equipos"
                description="Ajusta los filtros de búsqueda o registra un nuevo equipo tecnológico."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipos.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {eq.codigoPatrimonial}
                    </TableCell>
                    <TableCell className="font-medium">{eq.nombre}</TableCell>
                    <TableCell>{CATEGORIA_LABELS[eq.categoria]}</TableCell>
                    <TableCell>{eq.marca}</TableCell>
                    <TableCell>{eq.ubicacion}</TableCell>
                    <TableCell>
                      <EquipoStatusBadge estado={eq.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Popover>
                          <Tooltip>
                            <PopoverTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Ver ficha del equipo"
                                >
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                            </PopoverTrigger>
                            <TooltipContent>Ver ficha técnica</TooltipContent>
                          </Tooltip>
                          <PopoverContent align="end" className="w-80 space-y-3 text-left">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                              <span className="font-mono text-xs font-bold text-primary">
                                {eq.codigoPatrimonial}
                              </span>
                              <EquipoStatusBadge estado={eq.estado} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-foreground">{eq.nombre}</p>
                              <p className="text-xs text-muted-foreground">
                                {CATEGORIA_LABELS[eq.categoria]} • {eq.marca}
                              </p>
                            </div>
                            <div className="space-y-1 rounded-xl bg-muted/60 p-2.5 text-xs text-muted-foreground">
                              <p>
                                <span className="font-semibold text-foreground">Ubicación:</span>{' '}
                                {eq.ubicacion}
                              </p>
                              <p>
                                <span className="font-semibold text-foreground">Registrado:</span>{' '}
                                {new Date(eq.fechaRegistro).toLocaleDateString('es-PE')}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {eq.estado === 'Disponible' && (
                          <QuickTooltip label="Solicitar préstamo de este equipo">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEquipoParaPrestar(eq.id)
                                setSolicitarOpen(true)
                              }}
                            >
                              <HandHelping className="h-3.5 w-3.5" />
                              Solicitar
                            </Button>
                          </QuickTooltip>
                        )}
                        {canManage && (
                          <>
                            <QuickTooltip label="Editar equipo">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedEquipo(eq)
                                  setFormOpen(true)
                                }}
                                aria-label="Editar equipo"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </QuickTooltip>
                            <QuickTooltip label="Cambiar estado operativo">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedEquipo(eq)
                                  setEstadoModalOpen(true)
                                }}
                                aria-label="Cambiar estado"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </QuickTooltip>
                          </>
                        )}
                        {isAdmin && (
                          <ConfirmPopover
                            title={`¿Eliminar ${eq.codigoPatrimonial}?`}
                            description={`Se eliminará "${eq.nombre}" de forma permanente si no cuenta con historial de préstamos.`}
                            confirmLabel="Sí, eliminar"
                            confirmVariant="destructive"
                            tooltip="Eliminar equipo"
                            onConfirm={() => handleDelete(eq)}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              aria-label="Eliminar equipo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ConfirmPopover>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EquipoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        equipo={selectedEquipo}
        onSaved={reload}
      />

      <CambiarEstadoModal
        open={estadoModalOpen}
        onOpenChange={setEstadoModalOpen}
        equipo={selectedEquipo}
        onSaved={reload}
      />

      <SolicitarPrestamoModal
        open={solicitarOpen}
        onOpenChange={setSolicitarOpen}
        equiposDisponibles={equiposDisponibles}
        preselectedEquipoId={equipoParaPrestar}
        onSaved={reload}
      />
    </div>
  )
}
