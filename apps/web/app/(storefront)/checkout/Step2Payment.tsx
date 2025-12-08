'use client'

export default function Step2Payment({
  next,
  back,
  selected,
  setSelected
}: {
  next: () => void
  back: () => void
  selected: string
  setSelected: (v: string) => void
}) {
  const methods = [
    { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
    { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: '🏦' },
    { id: 'momo', label: 'Ví MoMo', icon: '📱' }
  ]

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 !text-gray-900">
        Phương thức thanh toán
      </h3>

      <div className="space-y-3">
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 p-4 !bg-white border-2 rounded-xl cursor-pointer transition-all hover:border-orange-300 ${
              selected === m.id
                ? 'border-orange-500 bg-orange-50/50'
                : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              checked={selected === m.id}
              onChange={() => setSelected(m.id)}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-2xl">{m.icon}</span>
            <span className="!text-gray-900 font-medium">{m.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={back}
          className="flex-1 px-6 py-3 !bg-white !text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>

        <button
          onClick={next}
          disabled={!selected}
          className="flex-1 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-lg"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}
