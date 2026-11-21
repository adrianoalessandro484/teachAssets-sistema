import type {
  EstadoPrestamo,
  Prestamo,
  RegistrarDevolucionPayload,
  SolicitarPrestamoPayload,
} from '@/types'
import { apiRequest, buildQueryString } from './api'

export interface PrestamoFilters {
  search?: string
  estado?: EstadoPrestamo | ''
  area?: string
}

export const prestamoService = {
  getAll: (filters: PrestamoFilters = {}) =>
    apiRequest<Prestamo[]>(`/prestamos${buildQueryString(filters as Record<string, string | undefined>)}`),

  solicitar: (payload: SolicitarPrestamoPayload) =>
    apiRequest<Prestamo>('/prestamos/solicitar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  aprobar: (id: string) =>
    apiRequest<Prestamo>(`/prestamos/${id}/aprobar`, {
      method: 'PATCH',
    }),

  rechazar: (id: string, motivo: string) =>
    apiRequest<Prestamo>(`/prestamos/${id}/rechazar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    }),

  registrarDevolucion: (id: string, payload: RegistrarDevolucionPayload) =>
    apiRequest<Prestamo>(`/prestamos/${id}/devolver`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}
