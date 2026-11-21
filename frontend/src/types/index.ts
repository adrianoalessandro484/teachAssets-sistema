export type RolUsuario = 'Administrador' | 'ResponsableTecnologia' | 'Colaborador'

export type EstadoEquipo = 'Disponible' | 'Prestado' | 'Mantenimiento' | 'Baja'

export type CategoriaEquipo =
  | 'Laptop'
  | 'ComputadoraEscritorio'
  | 'Monitor'
  | 'Impresora'
  | 'Tablet'
  | 'ProyectorMultimedia'
  | 'EquipoRed'

export type EstadoPrestamo = 'Pendiente' | 'Activo' | 'Devuelto' | 'Rechazado'

export type TipoMovimiento =
  | 'Registro'
  | 'PrestamoAprobado'
  | 'Devolucion'
  | 'CambioEstado'
  | 'Actualizacion'

export interface AuthUser {
  id: string
  nombres: string
  apellidos: string
  correo: string
  area: string
  rol: RolUsuario
  estado: boolean
}

export interface LoginRequest {
  correo: string
  password: string
}

export interface LoginResponse {
  token: string
  expiration: string
  usuario: AuthUser
}

export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  correo: string
  area: string
  rol: RolUsuario
  estado: boolean
  fechaCreacion: string
}

export interface CreateUsuarioPayload {
  nombres: string
  apellidos: string
  correo: string
  password: string
  area: string
  rol: RolUsuario
}

export interface UpdateUsuarioPayload {
  nombres: string
  apellidos: string
  correo: string
  password?: string
  area: string
  rol: RolUsuario
}

export interface Equipo {
  id: string
  codigoPatrimonial: string
  nombre: string
  categoria: CategoriaEquipo
  marca: string
  ubicacion: string
  estado: EstadoEquipo
  fechaRegistro: string
}

export interface EquipoPayload {
  codigoPatrimonial: string
  nombre: string
  categoria: CategoriaEquipo
  marca: string
  ubicacion: string
}

export interface UpdateEstadoEquipoPayload {
  estado: EstadoEquipo
  motivo?: string
}

export interface Prestamo {
  id: string
  fechaSolicitud: string
  fechaPrestamo: string
  fechaDevolucionEstimada: string
  fechaDevolucion: string | null
  estado: EstadoPrestamo
  observacion: string | null
  observacionDevolucion: string | null
  usuarioId: string
  usuarioNombre: string
  usuarioArea: string
  responsableId: string | null
  responsableNombre: string | null
  equipoId: string
  equipoCodigoPatrimonial: string
  equipoNombre: string
  equipoCategoria: CategoriaEquipo
}

export interface SolicitarPrestamoPayload {
  equipoId: string
  fechaPrestamo: string
  fechaDevolucionEstimada: string
  observacion?: string
}

export interface RegistrarDevolucionPayload {
  fechaDevolucion: string
  observacionDevolucion: string
  enviarAMantenimiento: boolean
}

export interface DashboardData {
  totalEquipos: number
  equiposDisponibles: number
  equiposPrestados: number
  equiposMantenimiento: number
  equiposBaja: number
  totalPrestamos: number
  prestamosPendientes: number
  prestamosActivos: number
  areaMayorUso: string
  areaMayorUsoCantidad: number
}

export interface EquiposPorEstado {
  estado: EstadoEquipo
  estadoNombre: string
  cantidad: number
}

export interface EquipoMasUtilizado {
  equipoId: string
  codigoPatrimonial: string
  nombre: string
  categoria: CategoriaEquipo
  marca: string
  totalPrestamos: number
}

export interface PrestamosPorArea {
  area: string
  totalPrestamos: number
  prestamosActivos: number
}

export interface MovimientoEquipo {
  id: string
  equipoId: string
  equipoCodigoPatrimonial: string
  equipoNombre: string
  usuarioResponsableId: string | null
  usuarioResponsableNombre: string | null
  tipoMovimiento: TipoMovimiento
  estadoAnterior: EstadoEquipo | null
  estadoNuevo: EstadoEquipo
  fechaMovimiento: string
  detalle: string
}

export const CATEGORIA_LABELS: Record<CategoriaEquipo, string> = {
  Laptop: 'Laptop',
  ComputadoraEscritorio: 'Computadora de escritorio',
  Monitor: 'Monitor',
  Impresora: 'Impresora',
  Tablet: 'Tablet',
  ProyectorMultimedia: 'Proyector multimedia',
  EquipoRed: 'Equipo de red',
}

export const ROL_LABELS: Record<RolUsuario, string> = {
  Administrador: 'Administrador',
  ResponsableTecnologia: 'Responsable de Tecnología',
  Colaborador: 'Colaborador',
}
