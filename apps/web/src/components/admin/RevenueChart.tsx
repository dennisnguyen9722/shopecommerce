'use client'
import { useRevenue } from '@/src/hooks/useRevenue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useEffect } from 'react'

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
)

export default function RevenueChart() {
  const { data, isLoading, refetch } = useRevenue()

  useEffect(() => {
    const timer = setInterval(() => {
      refetch()
    }, 10000) // refresh mỗi 10s

    return () => clearInterval(timer)
  }, [refetch])

  if (isLoading) return <p>Đang tải biểu đồ...</p>
  if (!data) return <p>Không có dữ liệu</p>

  const percent = data.percentChange.toFixed(1)
  const isUp = Number(percent) >= 0

  const chartData = {
    labels: data.series.map((d: any) => d._id),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: data.series.map((d: any) => d.totalRevenue),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: 'hsl(var(--muted-foreground))' } },
      y: { ticks: { color: 'hsl(var(--muted-foreground))' } }
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Doanh thu 60 ngày gần đây
        </CardTitle>
        <span
          className={`text-sm font-medium ${
            isUp ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isUp ? '↑' : '↓'} {Math.abs(Number(percent))}% so với kỳ trước
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  )
}
