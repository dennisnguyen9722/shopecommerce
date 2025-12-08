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
        // frosted glass effect - FIXED: Dark mode cần background đậm hơn
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl',
        // border & shadow
        'border border-white/30 dark:border-gray-700/50 shadow-lg',
        // animation
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  )
}
