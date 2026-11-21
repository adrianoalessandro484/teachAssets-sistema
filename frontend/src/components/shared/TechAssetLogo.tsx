import { cn } from '@/lib/utils'

interface TechAssetLogoProps {
  size?: 'sm' | 'md' | 'lg'
  lightText?: boolean
  showSubtitle?: boolean
  collapsed?: boolean
  className?: string
}

export function TechAssetLogo({
  size = 'md',
  lightText = false,
  showSubtitle = true,
  collapsed = false,
  className,
}: TechAssetLogoProps) {
  const iconBox =
    size === 'lg' ? 'h-14 w-14 rounded-2xl' : size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-xl'
  const titleSize =
    size === 'lg' ? 'text-3xl sm:text-4xl' : size === 'sm' ? 'text-base' : 'text-xl'
  const subSize = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className={cn('inline-flex items-center gap-3.5', collapsed && 'gap-0', className)}>
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-700 p-2 shadow-lg shadow-teal-950/30 ring-1 ring-white/20',
          iconBox,
        )}
      >
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
          <path
            d="M24 6L40 15V33L24 42L8 33V15L24 6Z"
            stroke="white"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M8 15L24 24L40 15M24 24V42"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="6" r="2.8" fill="#CCFBF1" />
          <circle cx="40" cy="15" r="2.4" fill="#CCFBF1" />
          <circle cx="8" cy="15" r="2.4" fill="#CCFBF1" />
        </svg>
      </div>

      {!collapsed && (
        <div className="leading-none">
          <div
            className={cn(
              'font-extrabold tracking-tight',
              titleSize,
              lightText ? 'text-white' : 'text-foreground',
            )}
          >
            Tech<span className={lightText ? 'text-teal-300' : 'text-primary'}>Asset</span>
          </div>
          {showSubtitle && (
            <p
              className={cn(
                'mt-1 font-medium tracking-wide',
                subSize,
                lightText ? 'text-teal-100/75' : 'text-muted-foreground',
              )}
            >
              Innovatech Solutions S.A.C.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
