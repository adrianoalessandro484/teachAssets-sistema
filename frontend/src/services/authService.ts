import type { AuthUser, LoginRequest, LoginResponse } from '@/types'
import { apiRequest } from './api'

export const authService = {
  login: (payload: LoginRequest) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest<AuthUser>('/auth/me'),
}
