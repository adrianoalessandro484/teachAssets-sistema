import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { EquiposPage } from '@/pages/EquiposPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { PrestamosPage } from '@/pages/PrestamosPage'
import { ReportesPage } from '@/pages/ReportesPage'
import { UsuariosPage } from '@/pages/UsuariosPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/equipos" element={<EquiposPage />} />
            <Route path="/prestamos" element={<PrestamosPage />} />

            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'ResponsableTecnologia']} />}>
              <Route path="/reportes" element={<ReportesPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
