import type { CreateUsuarioPayload, RolUsuario, UpdateUsuarioPayload, Usuario } from '@/types'
import { apiRequest, buildQueryString } from './api'

export interface UsuarioFilters {
  search?: string
  area?: string
  rol?: RolUsuario | ''
  estado?: boolean | ''
}

export const usuarioService = {
  getAll: (filters: UsuarioFilters = {}) =>
    apiRequest<Usuario[]>(`/usuarios${buildQueryString(filters as Record<string, string | boolean | undefined>)}`),

  create: (payload: CreateUsuarioPayload) =>
    apiRequest<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateUsuarioPayload) =>
    apiRequest<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  setEstado: (id: string, activo: boolean) =>
    apiRequest<Usuario>(`/usuarios/${id}/estado?activo=${activo}`, {
      method: 'PATCH',
    }),
}
