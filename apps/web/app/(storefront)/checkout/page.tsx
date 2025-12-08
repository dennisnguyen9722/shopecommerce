'use client'

import { useState } from 'react'
import ProgressBar from './ProgressBar'
import Step1Address from '@/app/(storefront)/checkout/Step1Shipping'
import Step2Payment from './Step2Payment'
import Step3Confirm from '@/app/(storefront)/checkout/Step3Review'

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [addressData, setAddressData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  return (
    <div className="!bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold !text-gray-900 mb-2">Thanh toán</h1>
          <p className="!text-gray-600">
            Hoàn tất đơn hàng của bạn trong 3 bước đơn giản
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar step={currentStep} />

        {/* Main Card */}
        <div className="!bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          {currentStep === 1 && (
            <Step1Address
              next={(data) => {
                setAddressData(data)
                setCurrentStep(2)
              }}
            />
          )}

          {currentStep === 2 && (
            <Step2Payment
              selected={paymentMethod}
              setSelected={setPaymentMethod}
              back={() => setCurrentStep(1)}
              next={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && addressData && (
            <Step3Confirm
              back={() => setCurrentStep(2)}
              address={addressData}
              payment={paymentMethod}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm !text-gray-500">
            Cần trợ giúp? Liên hệ{' '}
            <a
              href="mailto:support@dennisshop.com"
              className="text-orange-600 hover:underline font-medium"
            >
              support@dennisshop.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
