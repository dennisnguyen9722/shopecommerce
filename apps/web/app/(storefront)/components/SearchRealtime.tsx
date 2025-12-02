'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import serverApi from '@/src/lib/serverApi'
import Link from 'next/link'

export default function SearchRealtime() {
  const [text, setText] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const timer = useRef<any>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // click outside to close
  useEffect(() => {
    const handler = (e: any) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // realtime search
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    if (!text.trim()) {
      setResults([])
      setShow(false)
      return
    }

    timer.current = setTimeout(async () => {
      try {
        setLoading(true)
        const { data } = await serverApi.get('/public/products/search', {
          params: { query: text }
        })
        setResults(data || [])
        setShow(true)
      } finally {
        setLoading(false)
      }
    }, 250)
  }, [text])

  return (
    <div
      className="relative backdrop-blur-md bg-white/60 border border-gray-200/50 rounded-2xl shadow-md hover:shadow-lg transition"
      ref={boxRef}
    >
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full px-5 py-3 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-sm"
        onFocus={() => text && setShow(true)}
      />

      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:shadow-md transition">
        <Search className="w-4 h-4 text-white" />
      </button>

      {show && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border shadow-2xl z-30 overflow-hidden animate-fadeIn">
          {loading && (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-gray-500 text-sm">
              Không tìm thấy sản phẩm
            </div>
          )}

          {!loading &&
            results.map((p: any) => (
              <Link
                key={p._id}
                href={`/products/${p.slug}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                onClick={() => {
                  setShow(false)
                  setText('')
                  setResults([])
                }}
              >
                <img
                  src={p.images?.[0]?.url ?? '/placeholder.png'}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-orange-600 font-bold text-sm">
                    {p.price?.toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
