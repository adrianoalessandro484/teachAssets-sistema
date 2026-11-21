import type {
  CategoriaEquipo,
  Equipo,
  EquipoPayload,
  EstadoEquipo,
  UpdateEstadoEquipoPayload,
} from '@/types'
import { apiRequest, buildQueryString } from './api'

export interface EquipoFilters {
  search?: string
  categoria?: CategoriaEquipo | ''
  estado?: EstadoEquipo | ''
}

export const equipoService = {
  getAll: (filters: EquipoFilters = {}) =>
    apiRequest<Equipo[]>(`/equipos${buildQueryString(filters as Record<string, string | undefined>)}`),

  create: (payload: EquipoPayload) =>
    apiRequest<Equipo>('/equipos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: EquipoPayload) =>
    apiRequest<Equipo>(`/equipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateEstado: (id: string, payload: UpdateEstadoEquipoPayload) =>
    apiRequest<Equipo>(`/equipos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/equipos/${id}`, {
      method: 'DELETE',
    }),
}
