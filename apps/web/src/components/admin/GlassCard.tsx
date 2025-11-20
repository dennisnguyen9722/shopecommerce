import { cn } from '@/lib/utils'

export default function GlassCard({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        // layout
        'rounded-2xl p-6',

        // frosted glass effect
        'bg-white/40 dark:bg-white/10 backdrop-blur-xl',

        // border & shadow
        'border border-white/30 dark:border-white/10 shadow-lg',

        // animation
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5',

        className
      )}
    >
      {children}
    </div>
  )
}
