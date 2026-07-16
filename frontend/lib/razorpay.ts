declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

interface CheckoutParams {
  addressId: string
  name?: string
  email?: string
  contact?: string
  onSuccess: (orderId: string) => void
  onFailure: (message: string) => void
}

export async function startRazorpayCheckout({
  addressId,
  name,
  email,
  contact,
  onSuccess,
  onFailure
}: CheckoutParams) {
  try {
    const orderRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/order`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId })
      }
    )

    if (orderRes.status === 401) {
      onFailure('Please log in to continue.')
      return
    }

    if (!orderRes.ok) {
      const data = await orderRes.json().catch(() => ({}))
      onFailure(data.message || 'Could not start payment. Please try again.')
      return
    }

    const { orderId, amount, currency, keyId } = await orderRes.json()

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      name: 'Aether Apparel',
      description: 'Order payment',
      order_id: orderId,
      prefill: { name, email, contact },
      theme: { color: '#111111' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async (response: any) => {
        const verifyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/verify`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          }
        )

        const verifyData = await verifyRes.json().catch(() => ({}))

        if (verifyRes.ok && verifyData.verified) {
          onSuccess(verifyData.orderId)
        } else {
          onFailure('Payment could not be verified.')
        }
      },

      modal: {
        ondismiss: () => onFailure('Payment cancelled.')
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rzp.on('payment.failed', (response: any) => {
      onFailure(response.error?.description || 'Payment failed.')
    })

    rzp.open()
  } catch {
    onFailure('Something went wrong starting the payment.')
  }
}
