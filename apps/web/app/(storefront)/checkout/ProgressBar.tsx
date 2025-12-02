export default function ProgressBar({ step }: { step: number }) {
  const steps = ['Thông tin', 'Thanh toán', 'Xác nhận']

  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((label, i) => {
        const active = step >= i + 1
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className={`
                w-8 h-8 flex items-center justify-center rounded-full
                text-sm font-bold
                ${
                  active
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {i + 1}
            </div>
            <span
              className={`mt-2 text-sm ${
                active ? 'text-orange-600' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
