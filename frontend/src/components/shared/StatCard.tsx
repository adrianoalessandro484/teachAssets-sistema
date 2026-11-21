import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  tone?: 'default' | 'success' | 'info' | 'warning' | 'destructive'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/70',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
  info: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/70',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70',
  destructive: 'bg-red-50 text-red-700 ring-1 ring-red-200/70',
}

export function StatCard({ title, value, subtitle, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>}
        </div>
        <div
          className={cn(
            'flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl',
            toneClasses[tone],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}
