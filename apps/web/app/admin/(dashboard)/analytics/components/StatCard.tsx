import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  growth?: number
  subtitle?: string
  icon: React.ReactNode
  iconBgColor?: string
  iconColor?: string
}

export default function StatCard({
  title,
  value,
  growth,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}: StatCardProps) {
  const isPositive = growth !== undefined && growth >= 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-foreground mb-2">{value}</h3>

            {growth !== undefined ? (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {Math.abs(growth).toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  vs kỳ trước
                </span>
              </div>
            ) : subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
