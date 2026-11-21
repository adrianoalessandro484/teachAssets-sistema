import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Eye,
  EyeOff,
  HelpCircle,
  Laptop,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import loginHero from '@/assets/login-hero.jpg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { TechAssetLogo } from '@/components/shared/TechAssetLogo'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const REMEMBERED_EMAIL_KEY = 'techasset_remembered_email'

const HIGHLIGHTS = [
  {
    icon: Laptop,
    title: 'Inventario centralizado',
    desc: 'Control por código patrimonial único, categoría y ubicación.',
  },
  {
    icon: ClipboardCheck,
    title: 'Flujo de préstamos',
    desc: 'Solicitud, aprobación de TI y devolución con trazabilidad.',
  },
  {
    icon: BarChart3,
    title: 'Indicadores en tiempo real',
    desc: 'Disponibilidad, áreas de mayor uso e historial completo.',
  },
]

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''

  const [correo, setCorreo] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail))
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [showHelpNote, setShowHelpNote] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const validate = () => {
    const nextErrors: { correo?: string; password?: string } = {}
    if (!correo.trim()) {
      nextErrors.correo = 'El correo electrónico es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nextErrors.correo = 'Ingrese un correo electrónico válido.'
    }
    if (!password) {
      nextErrors.password = 'La contraseña es obligatoria.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handlePasswordKeyEvent = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const normalizedEmail = correo.trim()
      await login({ correo: normalizedEmail, password })

      if (rememberEmail) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Credenciales inválidas.'
      setAuthError(message)
      showError('Error al iniciar sesión', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      {/* Panel Izquierdo: Imagen, Logo y Nombre de la Aplicación */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b191e] p-10 text-white lg:flex xl:p-14">
        <img
          src={loginHero}
          alt="Infraestructura de activos tecnológicos TechAsset"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#081418]/92 via-[#081418]/35 to-[#081418]/95" />

        {/* Cabecera Superior: Logo Grande + Estado del Sistema */}
        <div className="relative z-10 space-y-6 animate-in fade-in-0 duration-500">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="transition-opacity hover:opacity-90">
              <TechAssetLogo size="lg" lightText showSubtitle />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-500/15 px-3.5 py-1.5 text-xs font-semibold text-teal-200 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Plataforma Activa
            </span>
          </div>

          <div className="max-w-lg space-y-2.5 pt-2">
            <h2 className="text-2xl font-bold leading-snug text-white xl:text-3xl">
              Gestión inteligente de inventario y préstamo de equipos tecnológicos
            </h2>
            <p className="text-sm leading-relaxed text-teal-100/80">
              Plataforma institucional para +500 colaboradores: administra activos, aprueba
              solicitudes y supervisa la disponibilidad tecnológica en cada área.
            </p>
          </div>

          {/* Métricas rápidas de valor */}
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <p className="text-base font-extrabold text-teal-300">7 Categorías</p>
              <p className="text-[11px] text-slate-300">Laptops, monitores, red y más</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <p className="text-base font-extrabold text-teal-300">3 Roles</p>
              <p className="text-[11px] text-slate-300">Control seguro de permisos</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <p className="text-base font-extrabold text-teal-300">100% Trazable</p>
              <p className="text-[11px] text-slate-300">Historial y devoluciones</p>
            </div>
          </div>
        </div>

        {/* Highlights inferiores con iconos + footer */}
        <div className="relative z-10 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 hover:border-teal-400/35"
                >
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/20 text-teal-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
            <span>© 2026 Innovatech Solutions S.A.C.</span>
            <span className="inline-flex items-center gap-1.5 text-teal-200/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              Acceso protegido con JWT
            </span>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario de Login */}
      <div className="flex flex-col justify-center bg-background px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md space-y-7 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="lg:hidden">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <TechAssetLogo size="md" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Portal Corporativo
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales institucionales para acceder al panel de TechAsset.
            </p>
          </div>

          {authError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="font-medium">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Correo institucional" htmlFor="login-correo" error={errors.correo} required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="login-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value)
                    setAuthError(null)
                  }}
                  placeholder="nombre@innovatech.com"
                  className="h-12 pl-11 text-base"
                  autoComplete="email"
                />
              </div>
            </FormField>

            <FormField label="Contraseña" htmlFor="login-password" error={errors.password} required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setAuthError(null)
                  }}
                  onKeyUp={handlePasswordKeyEvent}
                  onKeyDown={handlePasswordKeyEvent}
                  placeholder="Ingresa tu contraseña"
                  className="h-12 pl-11 pr-12 text-base"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLockOn && (
                <p className="text-xs font-medium text-amber-700">
                  Bloq Mayús está activado.
                </p>
              )}
            </FormField>

            <div className="flex items-center justify-between gap-2 text-sm">
              <label className="flex items-center gap-2 font-medium text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                Recordar correo
              </label>

              <button
                type="button"
                onClick={() => setShowHelpNote((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                ¿Problemas para acceder?
              </button>
            </div>

            {showHelpNote && (
              <div className="rounded-xl border border-teal-200 bg-secondary/60 p-3.5 text-xs leading-relaxed text-secondary-foreground">
                Si olvidaste tu contraseña o tu cuenta fue deshabilitada, comunícate con el{' '}
                <span className="font-bold">Administrador de TI</span> (
                <span className="font-mono">admin@innovatech.com</span>) para restablecer tu acceso.
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando credenciales...' : 'Ingresar al sistema'}
              {!isSubmitting && <ArrowRight className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
