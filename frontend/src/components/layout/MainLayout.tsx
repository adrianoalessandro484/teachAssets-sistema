import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cpu,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickTooltip, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RolBadge } from '@/components/shared/StatusBadge'
import { TechAssetLogo } from '@/components/shared/TechAssetLogo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { ROL_LABELS, type RolUsuario } from '@/types'

const SIDEBAR_STORAGE_KEY = 'techasset_sidebar_collapsed'

interface NavItem {
  to: string
  label: string
  subtitle: string
  icon: typeof LayoutDashboard
  roles?: RolUsuario[]
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    subtitle: 'Indicadores clave y resumen operativo',
    icon: LayoutDashboard,
  },
  {
    to: '/equipos',
    label: 'Inventario de Equipos',
    subtitle: 'Catálogo, códigos patrimoniales y disponibilidad',
    icon: Cpu,
  },
  {
    to: '/prestamos',
    label: 'Préstamos',
    subtitle: 'Solicitudes, aprobaciones y devoluciones',
    icon: ClipboardList,
  },
  {
    to: '/reportes',
    label: 'Reportes y Movimientos',
    subtitle: 'Uso por área, ranking y trazabilidad',
    icon: BarChart3,
    roles: ['Administrador', 'ResponsableTecnologia'],
  },
  {
    to: '/usuarios',
    label: 'Usuarios',
    subtitle: 'Control de cuentas, áreas y roles',
    icon: Users,
    roles: ['Administrador'],
  },
]

const ROLE_GUIDES: Record<RolUsuario, string[]> = {
  Administrador: [
    'Registrar, actualizar y deshabilitar cuentas de usuarios.',
    'Gestionar equipos, estados y eliminar activos sin historial.',
    'Aprobar o rechazar préstamos y registrar devoluciones.',
    'Acceder al dashboard completo, reportes por área y movimientos.',
  ],
  ResponsableTecnologia: [
    'Registrar y actualizar equipos tecnológicos en inventario.',
    'Aprobar o rechazar solicitudes de préstamo pendientes.',
    'Registrar devoluciones con observaciones obligatorias.',
    'Consultar reportes de uso por área e historial de movimientos.',
  ],
  Colaborador: [
    'Consultar el inventario de equipos disponibles en línea.',
    'Solicitar préstamos con fechas desde hoy en adelante.',
    'Hacer seguimiento a sus solicitudes y su historial personal.',
  ],
}

export function MainLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
  )

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || hasRole(...item.roles),
  )

  const currentPage =
    visibleNavItems.find((item) => location.pathname.startsWith(item.to)) ?? visibleNavItems[0]

  const initials = user
    ? `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase()
    : 'TA'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = !isMobile && sidebarCollapsed

    return (
      <div className="flex h-full flex-col bg-[#0b191e] text-slate-100">
        <div
          className={cn(
            'flex h-18 items-center border-b border-white/10',
            collapsed ? 'justify-center px-3' : 'justify-between px-6',
          )}
        >
          <Link to="/" className="transition-opacity hover:opacity-90">
            <TechAssetLogo size="sm" lightText showSubtitle={!collapsed} collapsed={collapsed} />
          </Link>
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className={cn('flex-1 overflow-y-auto py-6', collapsed ? 'px-2.5' : 'px-4')}>
          {collapsed ? (
            <div className="mb-3 flex h-4 items-center justify-center">
              <span className="h-px w-6 bg-white/15" />
            </div>
          ) : (
            <p className="mb-3 flex h-4 items-center px-3 text-[11px] font-bold uppercase tracking-widest text-teal-200/50">
              Menú Principal
            </p>
          )}
          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group flex w-full items-center rounded-xl text-sm font-semibold transition-all',
                      collapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3',
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-950/40'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isActive ? 'text-white' : 'text-teal-300/70 group-hover:text-teal-300',
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!collapsed && isActive && <ChevronRight className="h-4 w-4 text-white/80" />}
                    </>
                  )}
                </NavLink>
              )

              return collapsed ? (
                <QuickTooltip key={item.to} label={item.label} side="right">
                  <div className="w-full">{link}</div>
                </QuickTooltip>
              ) : (
                link
              )
            })}
          </nav>
        </div>

        <div className={cn('border-t border-white/10 py-4', collapsed ? 'px-2 text-center' : 'px-5')}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-1 text-[10px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>v1.0</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                TechAsset v1.0
              </span>
              <span>Gestión TI</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'hidden shrink-0 transition-all duration-200 ease-in-out md:sticky md:top-0 md:flex md:h-screen md:flex-col',
          sidebarCollapsed ? 'w-20' : 'w-72',
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-76 max-w-[85vw] shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content + Top Navbar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-border/80 bg-card/90 px-4 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <QuickTooltip
              label={sidebarCollapsed ? 'Agrandar barra lateral' : 'Encoger barra lateral'}
              side="bottom"
            >
              <Button
                variant="outline"
                size="icon"
                className="hidden md:inline-flex"
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Agrandar barra lateral' : 'Encoger barra lateral'}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
            </QuickTooltip>
            <div className="min-w-0">
              {user && (
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
                  >
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{ROL_LABELS[user.rol]}</span>
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  <span className="truncate font-bold text-foreground">
                    {currentPage?.label ?? 'Panel'}
                  </span>
                </nav>
              )}
              <p className="hidden truncate text-xs text-muted-foreground sm:block mt-0.5">
                {currentPage?.subtitle}
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              {/* Popover de Ayuda / Reglas por Rol */}
              <Popover>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Guía rápida de permisos y reglas"
                      >
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent>Guía rápida de tu rol</TooltipContent>
                </Tooltip>
                <PopoverContent align="end" className="w-84 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Guía rápida de tu rol</p>
                      <p className="text-xs text-muted-foreground">
                        Permisos y reglas activas en TechAsset
                      </p>
                    </div>
                    <RolBadge rol={user.rol} />
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {ROLE_GUIDES[user.rol].map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-xl bg-muted/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">Recordatorio:</span> Solo se
                    prestan equipos en estado <span className="font-semibold">Disponible</span> y
                    con fechas desde hoy en adelante.
                  </div>
                </PopoverContent>
              </Popover>

              {/* Dropdown Menu de Datos del Usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background px-2.5 py-1.5 text-left shadow-xs transition-all hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="hidden min-w-0 sm:block">
                      <p className="truncate text-sm font-semibold leading-none text-foreground">
                        {user.nombres} {user.apellidos}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {ROL_LABELS[user.rol]}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-76">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-secondary-foreground">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-bold text-foreground">
                          {user.nombres} {user.apellidos}
                        </p>
                        <RolBadge rol={user.rol} />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 rounded-xl bg-muted/60 p-2.5 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{user.correo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{user.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>Cuenta {user.estado ? 'Activa' : 'Deshabilitada'}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onSelect={() => navigate('/prestamos')}>
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Mis préstamos y solicitudes
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => navigate('/')}>
                    <ExternalLink className="h-4 w-4 text-primary" />
                    Ver sitio público
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="text-destructive focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
