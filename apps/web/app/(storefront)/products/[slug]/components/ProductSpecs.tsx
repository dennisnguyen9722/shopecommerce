import { ScrollText } from 'lucide-react'

interface Props {
  specs: { key: string; value: string }[]
}

export default function ProductSpecs({ specs }: Props) {
  if (!specs || specs.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      {/* <div className="p-4 bg-linear-to-r from-orange-50 to-red-50 border-b border-orange-100 flex items-center gap-2">
        <ScrollText className="w-5 h-5 text-orange-600" />
        <h3 className="font-bold text-gray-900">Thông số kỹ thuật</h3>
      </div> */}

      <div className="divide-y divide-gray-100">
        {specs.map((spec, idx) => (
          <div
            key={idx}
            className={`flex px-4 py-3 text-sm hover:bg-orange-50/50 transition-colors ${
              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
            }`}
          >
            <span className="w-1/3 text-gray-600 font-medium">{spec.key}</span>
            <span className="w-2/3 text-gray-900 font-semibold">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
