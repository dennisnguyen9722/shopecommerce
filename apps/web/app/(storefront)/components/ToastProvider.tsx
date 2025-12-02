'use client'

import { createContext, useContext, useState } from 'react'
import Image from 'next/image'

type ToastData = {
  id: number
  message: string
  image?: string
}

const ToastContext = createContext<any>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = (message: string, image?: string) => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, message, image }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* TOAST LIST */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl
              bg-white border border-gray-200
              animate-toast-enter
            `}
          >
            {/* Image */}
            {t.image && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border">
                <Image
                  src={t.image}
                  alt="product"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            )}

            {/* Text */}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{t.message}</span>
              <span className="text-sm text-green-600 font-medium">
                Đã thêm vào giỏ hàng!
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ANIMATION */}
      <style jsx global>{`
        @keyframes toastEnter {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px) scale(0.96);
          }
        }
        .animate-toast-enter {
          animation: toastEnter 2.5s ease forwards;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
