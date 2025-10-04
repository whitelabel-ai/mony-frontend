'use client'

import { PaymentReturnHandler } from '@/components/billing/payment-return-handler'

export default function PaymentReturnPage() {
  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <PaymentReturnHandler />
    </div>
  )
}