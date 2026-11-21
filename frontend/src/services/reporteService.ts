import type {
  DashboardData,
  EquipoMasUtilizado,
  EquiposPorEstado,
  MovimientoEquipo,
  PrestamosPorArea,
  TipoMovimiento,
} from '@/types'
import { apiRequest, buildQueryString } from './api'

export interface MovimientoFilters {
  search?: string
  tipoMovimiento?: TipoMovimiento | ''
  equipoId?: string
}

export const reporteService = {
  getDashboard: () => apiRequest<DashboardData>('/reportes/dashboard'),
  getEquiposPorEstado: () => apiRequest<EquiposPorEstado[]>('/reportes/equipos-por-estado'),
  getEquiposMasUtilizados: (top = 10) =>
    apiRequest<EquipoMasUtilizado[]>(`/reportes/equipos-mas-utilizados?top=${top}`),
  getPrestamosPorArea: () => apiRequest<PrestamosPorArea[]>('/reportes/prestamos-por-area'),
  getMovimientos: (filters: MovimientoFilters = {}) =>
    apiRequest<MovimientoEquipo[]>(`/reportes/movimientos${buildQueryString(filters as Record<string, string | undefined>)}`),
}
