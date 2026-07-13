import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type CartProduct = {
  id: string
  name: string
  price: number
  discount: number
  images: string[]
}

type CartItem = {
  id: string
  size: string
  color: string
  quantity: number
  product: CartProduct
}

type AppUser = { id: string; name: string; email: string } | null

type CheckoutPageProps = {
  user?: AppUser
}

export default function CheckoutPage({ user }: CheckoutPageProps) {
  const router = useRouter()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(true)

  const [form, setForm] = useState({
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (user === null) {
      router.replace('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (!user) return

    const fetchCart = async () => {
      setCartLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setCartItems(data.cartItems || [])
        }
      } catch (err) {
        console.error('Failed to fetch cart', err)
      } finally {
        setCartLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.price - item.product.discount
    return sum + price * item.quantity
  }, 0)
  const shipping = subtotal > 0 && subtotal <= 999 ? 99 : 0
  const total = subtotal + shipping

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (cartItems.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)

    try {
      const addressRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      )

      const addressData = await addressRes.json()

      if (!addressRes.ok) {
        setError(addressData.message || 'Failed to save address')
        setSubmitting(false)
        return
      }

      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: addressData.address.id,
            paymentMethod
          })
        }
      )

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        setError(orderData.message || 'Failed to place order')
        setSubmitting(false)
        return
      }

      setSuccessOrderId(orderData.order.id)
    } catch  {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (user === null) return null

  if (successOrderId) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7A9E7E]/10 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7A9E7E"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] mb-2">
            Order Placed
          </h1>
          <p className="text-sm text-[#555] mb-1">
            Your order{' '}
            <span className="text-[#111111] font-medium">
              #{successOrderId.slice(0, 8).toUpperCase()}
            </span>{' '}
            has been confirmed.
          </p>
          <p className="text-sm text-[#555] mb-8">
            You&apos;ll receive updates as it&apos;s processed and shipped.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/profile"
              className="bg-[#111111] text-white px-8 py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
            >
              View Order in My Account
            </Link>
            <Link href="/products" className="text-sm text-[#7A9E7E]">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] tracking-wide">
          Checkout
        </h1>
        <nav className="mt-2 flex items-center gap-2 text-xs text-[#999]">
          <Link href="/" className="hover:text-[#7A9E7E] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-[#7A9E7E] transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="text-[#111111]">Checkout</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-5">
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#999] uppercase tracking-widest mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#999] uppercase tracking-widest mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#999] uppercase tracking-widest mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] uppercase tracking-widest mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] uppercase tracking-widest mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={form.pinCode}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-5">
                Payment Method
              </h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex-1 border px-4 py-3 text-sm transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e0e0e0] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex-1 border px-4 py-3 text-sm transition-colors ${
                    paymentMethod === 'COD'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e0e0e0] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  Cash on Delivery
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || cartLoading || cartItems.length === 0}
              className="w-full bg-[#111111] text-white py-3.5 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
            >
              {submitting
                ? 'Placing Order...'
                : `Place Order — ₹${total.toFixed(0)}`}
            </button>
          </form>

          <div className="lg:col-span-1">
            <div className="bg-[#F5F5F5] p-6">
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-5">
                Order Summary
              </h2>

              {cartLoading ? (
                <p className="text-sm text-[#555]">Loading cart...</p>
              ) : cartItems.length === 0 ? (
                <p className="text-sm text-[#555]">
                  Your cart is empty.{' '}
                  <Link href="/products" className="text-[#7A9E7E]">
                    Shop now
                  </Link>
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-5 max-h-72 overflow-y-auto pr-1">
                    {cartItems.map(item => {
                      const price = item.product.price - item.product.discount
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-14 h-18 bg-white shrink-0 overflow-hidden">
                            {item.product.images?.[0] && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#111111] truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-[#999]">
                              {item.color} / {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-xs text-[#111111] shrink-0">
                            ₹{(price * item.quantity).toFixed(0)}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-[#e0e0e0] pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-[#555]">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-[#555]">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-[#111111] border-t border-[#e0e0e0] pt-2 mt-1">
                      <span>Total</span>
                      <span>₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
