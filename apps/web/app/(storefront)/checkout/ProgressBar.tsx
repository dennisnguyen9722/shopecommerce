export default function ProgressBar({ step }: { step: number }) {
  const steps = ['Thông tin', 'Thanh toán', 'Xác nhận']

  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((label, i) => {
        const active = step >= i + 1
        const isLast = i === steps.length - 1

        return (
          <div key={i} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full
                  text-sm font-bold transition-all
                  ${
                    active
                      ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-200'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {active ? '✓' : i + 1}
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${
                  active ? 'text-orange-600' : '!text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Line connector */}
            {!isLast && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-all ${
                  step > i + 1 ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
