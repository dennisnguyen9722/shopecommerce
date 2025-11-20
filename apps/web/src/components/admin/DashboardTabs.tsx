'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'
import {
  useRevenue,
  useOrdersStats,
  useCustomersStats
} from '@/src/hooks/useDashboardStats'

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

function LineChartCard({
  title,
  data,
  color = 'hsl(var(--primary))',
  label
}: {
  title: string
  data: { _id: string; value: number }[]
  label: string
  color?: string
}) {
  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        borderColor: color,
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardTabs() {
  const { data: revenue } = useRevenue()
  const { data: orders } = useOrdersStats()
  const { data: customers } = useCustomersStats()

  const revenueSeries =
    revenue?.series?.map((d: any) => ({
      _id: d._id,
      value: d.totalRevenue
    })) ?? []

  const ordersSeries =
    orders?.series?.map((d: any) => ({
      _id: d._id,
      value: d.totalOrders
    })) ?? []

  const customersSeries =
    customers?.series?.map((d: any) => ({
      _id: d._id,
      value: d.newCustomers
    })) ?? []

  return (
    <Tabs defaultValue="revenue" className="mt-6">
      <TabsList className="grid grid-cols-3 w-full sm:w-auto">
        <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
        <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
        <TabsTrigger value="customers">Khách hàng</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue">
        <LineChartCard
          title="Doanh thu 60 ngày"
          data={revenueSeries}
          label="VNĐ"
          key={1}
        />
      </TabsContent>

      <TabsContent value="orders">
        <LineChartCard
          title="Đơn hàng theo ngày"
          data={ordersSeries}
          label="Số đơn"
          color="#22c55e"
          key={2}
        />
      </TabsContent>

      <TabsContent value="customers">
        <LineChartCard
          title="Khách hàng mới theo ngày"
          data={customersSeries}
          label="Số khách"
          color="#f97316"
          key={3}
        />
      </TabsContent>
    </Tabs>
  )
}
