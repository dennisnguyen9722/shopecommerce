'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Clock,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Check,
  Lock
} from 'lucide-react'
import { useUpdateOrderStatus } from '@/src/hooks/useUpdateOrderStatus'

const statuses = [
  { value: 'pending', label: 'Chờ xử lý', icon: Clock },
  { value: 'processing', label: 'Đang xử lý', icon: Loader2 },
  { value: 'shipped', label: 'Đang giao', icon: Truck },
  { value: 'completed', label: 'Hoàn thành', icon: CheckCircle2 },
  { value: 'cancelled', label: 'Đã hủy', icon: XCircle }
]

// ✅ FLOW TRẠNG THÁI CẬP NHẬT
const statusTransitions: Record<string, string[]> = {
  pending: ['processing', 'cancelled'], // Chờ xử lý → Đang xử lý hoặc Hủy
  processing: ['shipped', 'cancelled'], // Đang xử lý → Đang giao hoặc Hủy
  shipped: ['completed'], // Đang giao → CHỈ Hoàn thành (KHÔNG HỦY ĐƯỢC)
  completed: [], // Hoàn thành → KHÔNG ĐỔI ĐƯỢC
  cancelled: [] // Đã hủy → KHÔNG ĐỔI ĐƯỢC
}

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

interface ChangeStatusProps {
  orderId: string
  current: OrderStatus
  onChanged?: (status: OrderStatus) => void
}

export default function ChangeStatus({
  orderId,
  current,
  onChanged
}: ChangeStatusProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<OrderStatus>(current)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ⭐ SỬ DỤNG REACT QUERY MUTATION
  const updateStatusMutation = useUpdateOrderStatus()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // ✅ Kiểm tra xem có thể chuyển sang trạng thái mới không
  function canTransitionTo(targetStatus: string): boolean {
    const allowedTransitions = statusTransitions[value] || []
    return allowedTransitions.includes(targetStatus)
  }

  async function updateStatus(newStatus: OrderStatus) {
    // ✅ Validate transition
    if (!canTransitionTo(newStatus)) {
      toast.error('Không thể chuyển sang trạng thái này!')
      return
    }

    // Optimistic update - cập nhật UI ngay lập tức
    const previousValue = value
    setValue(newStatus)

    try {
      // ⭐ GỌI MUTATION THAY VÌ API TRỰC TIẾP
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus
      })

      toast.success('Đã cập nhật trạng thái!')
      onChanged?.(newStatus)
      setOpen(false)
    } catch (e: any) {
      // Rollback nếu lỗi
      setValue(previousValue)
      toast.error(e.response?.data?.error || 'Lỗi cập nhật trạng thái!')
    }
  }

  const currentStatus = statuses.find((s) => s.value === value)
  const CurrentIcon = currentStatus?.icon || Clock
  const allowedTransitions = statusTransitions[value] || []

  // ✅ Nếu đã hoàn thành hoặc đã hủy → disable button
  const isTerminalState = value === 'completed' || value === 'cancelled'
  const isLoading = updateStatusMutation.isPending

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          px-4 py-2 bg-white border rounded-lg text-sm font-medium 
          transition-colors flex items-center gap-2
          ${
            isTerminalState
              ? 'border-gray-200 text-gray-500 cursor-not-allowed'
              : 'border-gray-200 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
        onClick={() => !isTerminalState && !isLoading && setOpen(!open)}
        disabled={isLoading || isTerminalState}
        title={isTerminalState ? 'Không thể thay đổi trạng thái này' : ''}
      >
        <CurrentIcon className="w-4 h-4 text-gray-600" />
        <span>{currentStatus?.label || 'Chọn trạng thái'}</span>
        {isTerminalState ? (
          <Lock className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
          {statuses.map((s) => {
            const Icon = s.icon
            const isActive = s.value === value
            const canTransition = canTransitionTo(s.value)
            const isDisabled = isActive || !canTransition

            return (
              <button
                key={s.value}
                disabled={isLoading || isDisabled}
                className={`
                  w-full text-left px-4 py-2.5 text-sm font-medium
                  transition-colors flex items-center gap-2
                  ${
                    isActive
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : canTransition
                      ? 'hover:bg-gray-50 text-gray-700'
                      : 'text-gray-300 cursor-not-allowed'
                  }
                  ${isLoading ? 'opacity-50 cursor-wait' : ''}
                `}
                onClick={() =>
                  canTransition && updateStatus(s.value as OrderStatus)
                }
                title={
                  !canTransition && !isActive
                    ? s.value === 'cancelled' &&
                      (value === 'shipped' || value === 'completed')
                      ? 'Không thể hủy đơn đang giao hoặc đã hoàn thành'
                      : 'Không thể chuyển trực tiếp sang trạng thái này'
                    : ''
                }
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{s.label}</span>
                {isActive && <Check className="w-4 h-4 text-gray-400" />}
                {!isActive && !canTransition && (
                  <Lock className="w-3 h-3 text-gray-300" />
                )}
              </button>
            )
          })}

          {/* ✅ Hiển thị gợi ý */}
          {allowedTransitions.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 mt-1">
              💡 Có thể chuyển sang:{' '}
              {allowedTransitions
                .map((t) => statuses.find((s) => s.value === t)?.label)
                .join(', ')}
            </div>
          )}

          {allowedTransitions.length === 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 mt-1">
              🔒 Đơn hàng đã ở trạng thái cuối cùng
            </div>
          )}
        </div>
      )}
    </div>
  )
}
