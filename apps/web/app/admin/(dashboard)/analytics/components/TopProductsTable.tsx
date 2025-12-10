import Image from 'next/image'

interface TopProductsTableProps {
  data: Array<{
    _id: string
    name: string
    image: string
    totalSold: number
    revenue: number
  }>
}

export default function TopProductsTable({ data }: TopProductsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có dữ liệu
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  return (
    <div className="space-y-4">
      {data.map((product, index) => (
        <div
          key={product._id}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
        >
          {/* Rank */}
          <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            #{index + 1}
          </div>

          {/* Image */}
          <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">
              {product.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Đã bán: <span className="font-semibold">{product.totalSold}</span>
            </p>
          </div>

          {/* Revenue */}
          <div className="text-right">
            <p className="font-bold text-foreground">
              {formatCurrency(product.revenue)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
