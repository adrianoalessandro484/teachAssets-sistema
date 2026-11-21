import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/useAuth'
import { ToastProvider } from '@/hooks/useToast'
import { AppRouter } from '@/routes/AppRouter'

export function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </TooltipProvider>
  )
}

export default App
