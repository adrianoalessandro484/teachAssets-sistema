import { useCallback } from 'react'
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Laptop,
  Wrench,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/StatCard'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'
import { reporteService } from '@/services/reporteService'
import type { DashboardData, EquiposPorEstado } from '@/types'

const INITIAL_DASHBOARD: DashboardData = {
  totalEquipos: 0,
  equiposDisponibles: 0,
  equiposPrestados: 0,
  equiposMantenimiento: 0,
  equiposBaja: 0,
  totalPrestamos: 0,
  prestamosPendientes: 0,
  prestamosActivos: 0,
  areaMayorUso: 'Sin registros',
  areaMayorUsoCantidad: 0,
}

export function DashboardPage() {
  const { user } = useAuth()

  const fetchDashboard = useCallback(async () => {
    const [dashboard, porEstado] = await Promise.all([
      reporteService.getDashboard(),
      reporteService.getEquiposPorEstado(),
    ])
    return { dashboard, porEstado }
  }, [])

  const { data, isLoading, error } = useAsyncData(fetchDashboard, {
    dashboard: INITIAL_DASHBOARD,
    porEstado: [] as EquiposPorEstado[],
  })

  const { dashboard, porEstado } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Bienvenido, {user?.nombres} {user?.apellidos}
        </h2>
        <p className="text-sm text-muted-foreground">
          Resumen general del inventario tecnológico y estado de préstamos en Innovatech Solutions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Indicadores mínimos requeridos por la Sección 10 del PDF */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de equipos"
          value={isLoading ? '...' : dashboard.totalEquipos}
          subtitle="Activos registrados en inventario"
          icon={Cpu}
        />
        <StatCard
          title="Equipos disponibles"
          value={isLoading ? '...' : dashboard.equiposDisponibles}
          subtitle="Listos para préstamo"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="Equipos prestados"
          value={isLoading ? '...' : dashboard.equiposPrestados}
          subtitle={`${dashboard.prestamosActivos} préstamo(s) activos`}
          icon={Laptop}
          tone="info"
        />
        <StatCard
          title="Equipos en mantenimiento"
          value={isLoading ? '...' : dashboard.equiposMantenimiento}
          subtitle={`Fuera de servicio (+${dashboard.equiposBaja} en baja)`}
          icon={Wrench}
          tone="warning"
        />
        <StatCard
          title="Total de préstamos"
          value={isLoading ? '...' : dashboard.totalPrestamos}
          subtitle={`${dashboard.prestamosPendientes} solicitud(es) pendientes`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Área con mayor uso"
          value={isLoading ? '...' : dashboard.areaMayorUso}
          subtitle={`${dashboard.areaMayorUsoCantidad} préstamo(s) registrados`}
          icon={Building2}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Equipos por Estado</CardTitle>
            <CardDescription>Proporción actual del parque tecnológico institucional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {porEstado.map((item) => {
              const pct =
                dashboard.totalEquipos > 0
                  ? Math.round((item.cantidad / dashboard.totalEquipos) * 100)
                  : 0
              const barColor =
                item.estado === 'Disponible'
                  ? 'bg-emerald-500'
                  : item.estado === 'Prestado'
                    ? 'bg-cyan-600'
                    : item.estado === 'Mantenimiento'
                      ? 'bg-amber-500'
                      : 'bg-red-500'

              return (
                <div key={item.estado} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.estadoNombre}</span>
                    <span className="text-muted-foreground">
                      {item.cantidad} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Solicitudes</CardTitle>
            <CardDescription>Seguimiento rápido del flujo de aprobación y devolución.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Solicitudes Pendientes</p>
                  <p className="text-xs text-muted-foreground">
                    Esperando aprobación del Responsable de Tecnología
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold">{dashboard.prestamosPendientes}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/70">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Préstamos Activos</p>
                  <p className="text-xs text-muted-foreground">
                    Equipos actualmente asignados a colaboradores
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold">{dashboard.prestamosActivos}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
