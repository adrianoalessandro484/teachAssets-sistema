import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Laptop,
  Monitor,
  Network,
  Printer,
  Projector,
  Shield,
  ShieldCheck,
  Tablet,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react'
import loginHero from '@/assets/login-hero.jpg'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TechAssetLogo } from '@/components/shared/TechAssetLogo'
import { useAuth } from '@/hooks/useAuth'

const MODULES = [
  {
    icon: Cpu,
    title: 'Inventario Centralizado',
    desc: 'Control por código patrimonial único, marca, categoría, ubicación física y estado operativo en tiempo real.',
  },
  {
    icon: ClipboardCheck,
    title: 'Control de Préstamos',
    desc: 'Evita duplicidades y conflictos: valida disponibilidad, fechas posteriores y observaciones obligatorias en devoluciones.',
  },
  {
    icon: Users,
    title: 'Gestión de Usuarios y Roles',
    desc: 'Administra colaboradores por área funcional con permisos específicos y control exclusivo de deshabilitación.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard y Trazabilidad',
    desc: 'Indicadores clave de disponibilidad, áreas con mayor demanda, equipos más usados e historial completo de movimientos.',
  },
]

const WORKFLOW_STEPS = [
  {
    step: '01',
    badge: 'Pendiente',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    title: 'Solicitud del Colaborador',
    desc: 'El colaborador consulta el catálogo de equipos disponibles y envía su solicitud indicando fechas estimadas y motivo.',
  },
  {
    step: '02',
    badge: 'Activo',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    title: 'Aprobación de Tecnología',
    desc: 'El Responsable de Tecnología valida que el equipo esté disponible y aprueba la entrega, quedando registrado como responsable.',
  },
  {
    step: '03',
    badge: 'Devuelto',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: 'Devolución y Auditoría',
    desc: 'Al retornar el activo se registra la fecha real y observaciones obligatorias, actualizando el inventario y el historial.',
  },
]

const ROLES = [
  {
    icon: Shield,
    name: 'Administrador',
    desc: 'Control integral del sistema y seguridad de cuentas.',
    items: [
      'Registrar, editar y deshabilitar usuarios',
      'Gestionar el inventario completo de equipos',
      'Supervisar préstamos activos e históricos',
      'Consultar reportes e indicadores globales',
    ],
  },
  {
    icon: Wrench,
    name: 'Responsable de Tecnología',
    desc: 'Operación diaria de activos, aprobaciones y entregas.',
    items: [
      'Registrar nuevos equipos tecnológicos',
      'Aprobar o rechazar solicitudes pendientes',
      'Registrar devoluciones con observaciones',
      'Gestionar estados (Disponible, Mantenimiento, Baja)',
    ],
  },
  {
    icon: UserCheck,
    name: 'Colaborador',
    desc: 'Acceso ágil para solicitar herramientas de trabajo.',
    items: [
      'Consultar disponibilidad de equipos en línea',
      'Solicitar préstamos con fechas estimadas',
      'Hacer seguimiento al estado de sus solicitudes',
      'Revisar su historial personal de préstamos',
    ],
  },
]

const CATEGORIES = [
  { icon: Laptop, label: 'Laptops' },
  { icon: Cpu, label: 'Computadoras de escritorio' },
  { icon: Monitor, label: 'Monitores' },
  { icon: Printer, label: 'Impresoras' },
  { icon: Tablet, label: 'Tablets' },
  { icon: Projector, label: 'Proyectores multimedia' },
  { icon: Network, label: 'Equipos de red' },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const primaryHref = isAuthenticated ? '/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar Pública */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="focus:outline-none">
            <TechAssetLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#modulos" className="transition-colors hover:text-primary">
              Funcionalidades
            </a>
            <a href="#flujo" className="transition-colors hover:text-primary">
              Flujo de Préstamo
            </a>
            <a href="#roles" className="transition-colors hover:text-primary">
              Roles
            </a>
            <a href="#categorias" className="transition-colors hover:text-primary">
              Activos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to={primaryHref}>
              <Button size="default">
                {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0b191e] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.22),_transparent_50%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div className="relative z-10 space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/15 px-4 py-1.5 text-xs font-semibold text-teal-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Innovatech Solutions S.A.C. • Plataforma TechAsset
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Control total del{' '}
              <span className="text-teal-300">inventario y préstamo</span> de equipos tecnológicos
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Reemplaza las hojas de cálculo manuales por una plataforma centralizada para más de
              500 colaboradores: consulta disponibilidad al instante, gestiona aprobaciones y obtén
              indicadores en tiempo real.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to={primaryHref}>
                <Button size="lg" className="h-13 px-7 text-base">
                  {isAuthenticated ? 'Abrir panel de control' : 'Ingresar al sistema'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#modulos">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  Explorar módulos
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-2xl font-extrabold text-teal-300">7</p>
                <p className="text-xs text-slate-300">Categorías de activos</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-300">10</p>
                <p className="text-xs text-slate-300">Reglas de negocio validadas</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-300">100%</p>
                <p className="text-xs text-slate-300">Trazabilidad de movimientos</p>
              </div>
            </div>
          </div>

          {/* Tarjeta visual del Hero con ilustración y tarjetas flotantes */}
          <div className="relative z-10">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0e2228] shadow-2xl">
              <img
                src={loginHero}
                alt="Ecosistema de activos tecnológicos TechAsset"
                className="h-[400px] w-full object-cover sm:h-[460px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081418]/90 via-transparent to-transparent" />

              {/* Tarjeta flotante superior */}
              <div className="absolute left-5 top-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0b191e]/85 px-4 py-3 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">INV-LAP-001 • Disponible</p>
                  <p className="text-[11px] text-slate-300">Almacén TI — Piso 3</p>
                </div>
              </div>

              {/* Tarjeta flotante inferior */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#0b191e]/85 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Flujo Pendiente → Activo → Devuelto</p>
                    <p className="text-xs text-slate-300">Aprobación y control por Responsable de TI</p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-200">
                  Tiempo real
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos Principales */}
      <section id="modulos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <span className="inline-flex items-center rounded-full bg-secondary px-3.5 py-1 text-xs font-bold text-secondary-foreground">
            Alcance Funcional
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Todo lo necesario para gestionar el ciclo de vida de tus equipos
          </h2>
          <p className="text-muted-foreground">
            Diseñado para eliminar pérdida de información, duplicidad de registros y procesos lentos
            de asignación y devolución.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            return (
              <Card key={mod.title} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{mod.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{mod.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Flujo de Préstamo */}
      <section id="flujo" className="border-y border-border/70 bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <span className="inline-flex items-center rounded-full bg-secondary px-3.5 py-1 text-xs font-bold text-secondary-foreground">
              Proceso Controlado
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Flujo completo de préstamos en 3 pasos
            </h2>
            <p className="text-muted-foreground">
              Cada transición respeta las reglas de negocio en frontend y backend para garantizar
              consistencia en el inventario.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border bg-background p-7 shadow-xs"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold text-primary/30">
                    {item.step}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${item.badgeClass}`}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actores / Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <span className="inline-flex items-center rounded-full bg-secondary px-3.5 py-1 text-xs font-bold text-secondary-foreground">
            Seguridad por Rol
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Vistas y permisos pensados para cada actor
          </h2>
          <p className="text-muted-foreground">
            Acceso autenticado mediante correo y contraseña con protección de rutas según el perfil
            del usuario.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {ROLES.map((role) => {
            const Icon = role.icon
            return (
              <Card key={role.name}>
                <CardContent className="space-y-5 p-7">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{role.name}</h3>
                      <p className="text-xs text-muted-foreground">{role.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {role.items.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Categorías de Equipos */}
      <section id="categorias" className="border-t border-border/70 bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Activos tecnológicos soportados
            </h2>
            <p className="text-sm text-muted-foreground">
              Clasificación integral para el equipamiento institucional de Innovatech Solutions.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.label}
                  className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-background p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b191e] px-6 py-12 text-center text-white shadow-xl sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.22),_transparent_65%)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              ¿Listo para gestionar tus equipos con TechAsset?
            </h2>
            <p className="text-sm text-slate-300 sm:text-base">
              Accede con tu cuenta de Administrador, Responsable de Tecnología o Colaborador y
              comienza a operar el inventario en segundos.
            </p>
            <div className="pt-2">
              <Link to={primaryHref}>
                <Button size="lg" className="h-13 px-8 text-base">
                  {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión ahora'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <TechAssetLogo size="sm" showSubtitle={false} />
          <p>© 2026 Innovatech Solutions S.A.C. — TechAsset: Gestión de Inventario y Préstamos.</p>
        </div>
      </footer>
    </div>
  )
}
