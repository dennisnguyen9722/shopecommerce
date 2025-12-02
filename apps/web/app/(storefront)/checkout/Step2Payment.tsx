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
    { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
    { id: 'bank', label: 'Chuyển khoản ngân hàng' },
    { id: 'momo', label: 'Ví MoMo' }
  ]

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Phương thức thanh toán</h3>

      <div className="space-y-3">
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 ${
              selected === m.id ? 'ring-2 ring-orange-300' : ''
            }`}
          >
            <input
              type="radio"
              checked={selected === m.id}
              onChange={() => setSelected(m.id)}
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={back} className="px-6 py-3 border rounded-xl">
          Quay lại
        </button>

        <button
          onClick={next}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}
