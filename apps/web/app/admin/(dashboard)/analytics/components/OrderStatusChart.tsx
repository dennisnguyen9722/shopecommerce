'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

interface OrderStatusChartProps {
  data: Array<{
    status: string
    label: string
    count: number
  }>
}

const COLORS = {
  pending: '#f59e0b', // amber
  processing: '#3b82f6', // blue
  shipped: '#8b5cf6', // purple
  completed: '#10b981', // green
  cancelled: '#ef4444' // red
}

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Chưa có dữ liệu
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || '#6b7280'
  }))

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    if (percent < 0.05) return null // Hide label if < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span className="text-sm">
                {value}{' '}
                <span className="text-gray-500">({entry.payload.value})</span>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
