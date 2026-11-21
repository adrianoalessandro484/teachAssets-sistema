import { useCallback, useState } from 'react'
import { Edit, Plus, Power, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { QuickTooltip } from '@/components/ui/tooltip'
import { ConfirmPopover } from '@/components/shared/ConfirmPopover'
import { EmptyState } from '@/components/shared/EmptyState'
import { RolBadge, UsuarioEstadoBadge } from '@/components/shared/StatusBadge'
import { UsuarioFormModal } from '@/components/usuarios/UsuarioFormModal'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { usuarioService } from '@/services/usuarioService'
import { ROL_LABELS, type RolUsuario, type Usuario } from '@/types'

const ROLES: RolUsuario[] = ['Administrador', 'ResponsableTecnologia', 'Colaborador']

export function UsuariosPage() {
  const { user: currentUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState<RolUsuario | ''>('')
  const [estadoFilter, setEstadoFilter] = useState<'' | 'true' | 'false'>('')

  const [formOpen, setFormOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)

  const fetcher = useCallback(
    () =>
      usuarioService.getAll({
        search,
        rol: rolFilter,
        estado: estadoFilter === '' ? '' : estadoFilter === 'true',
      }),
    [search, rolFilter, estadoFilter],
  )

  const { data: usuarios, isLoading, reload } = useAsyncData(fetcher, [] as Usuario[])

  const handleToggleEstado = async (usuario: Usuario) => {
    const nextEstado = !usuario.estado

    try {
      await usuarioService.setEstado(usuario.id, nextEstado)
      showSuccess(
        nextEstado ? 'Usuario habilitado' : 'Usuario deshabilitado',
        `La cuenta de ${usuario.nombreCompleto} fue actualizada.`,
      )
      await reload()
    } catch (err) {
      showError('No se pudo cambiar el estado', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Administra colaboradores, responsables de tecnología y permisos de acceso.
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedUsuario(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Registrar usuario
        </Button>
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
                placeholder="Buscar por nombre, correo o área..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={rolFilter} onChange={(e) => setRolFilter(e.target.value as RolUsuario | '')}>
              <option value="">Todos los roles</option>
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {ROL_LABELS[rol]}
                </option>
              ))}
            </Select>

            <Select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as '' | 'true' | 'false')}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Deshabilitados</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No se encontraron usuarios"
                description="Ajusta los filtros de búsqueda o registra un nuevo usuario."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombreCompleto}</TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>{u.area}</TableCell>
                    <TableCell>
                      <RolBadge rol={u.rol} />
                    </TableCell>
                    <TableCell>
                      <UsuarioEstadoBadge activo={u.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <QuickTooltip label="Editar usuario">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUsuario(u)
                              setFormOpen(true)
                            }}
                            aria-label="Editar usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </QuickTooltip>
                        <ConfirmPopover
                          title={u.estado ? '¿Deshabilitar usuario?' : '¿Habilitar usuario?'}
                          description={
                            u.estado
                              ? `${u.nombreCompleto} no podrá iniciar sesión ni solicitar préstamos mientras esté deshabilitado.`
                              : `${u.nombreCompleto} volverá a tener acceso al sistema.`
                          }
                          confirmLabel={u.estado ? 'Deshabilitar' : 'Habilitar'}
                          confirmVariant={u.estado ? 'destructive' : 'default'}
                          tooltip={u.estado ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                          onConfirm={() => handleToggleEstado(u)}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={currentUser?.id === u.id && u.estado}
                          >
                            <Power className="h-3.5 w-3.5" />
                            {u.estado ? 'Deshabilitar' : 'Habilitar'}
                          </Button>
                        </ConfirmPopover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UsuarioFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        usuario={selectedUsuario}
        onSaved={reload}
      />
    </div>
  )
}
