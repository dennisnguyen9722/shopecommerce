'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import Step1Address from '@/app/(storefront)/checkout/Step1Shipping'
import Step2Payment from '@/app/(storefront)/checkout/Step2Payment'
import Step3Confirm from '@/app/(storefront)/checkout/Step3Review'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [addressInfo, setAddressInfo] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')

  useEffect(() => {
    if (cart.length === 0) router.replace('/cart')
  }, [cart])

  return (
    <div className="container mx-auto px-4 max-w-4xl py-10">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      {/* STEP TRACKING */}
      <div className="flex items-center justify-between mb-10">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 mx-1 rounded-full ${
              s <= step ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <Step1Address
          next={(data) => {
            setAddressInfo(data)
            setStep(2)
          }}
        />
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Step2Payment
          selected={paymentMethod}
          setSelected={setPaymentMethod}
          next={() => setStep(3)}
          back={() => setStep(1)}
        />
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <Step3Confirm
          address={addressInfo}
          payment={paymentMethod}
          back={() => setStep(2)}
        />
      )}
    </div>
  )
}
