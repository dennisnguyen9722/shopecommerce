'use client'

import { useState } from 'react'

export default function Step1Address({ next }: { next: (data: any) => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Thông tin giao hàng</h3>

      <div className="space-y-4">
        <input
          className="w-full p-3 border rounded-xl"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 border rounded-xl"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          className="w-full p-3 border rounded-xl"
          placeholder="Địa chỉ giao hàng"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <button
        onClick={() => next({ name, phone, address })}
        className="mt-6 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold"
      >
        Tiếp tục
      </button>
    </div>
  )
}
