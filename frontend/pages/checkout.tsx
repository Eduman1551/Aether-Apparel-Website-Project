import { startRazorpayCheckout } from '@/lib/razorpay'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

/* ---------- Types ---------- */
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

type Address = {
  id: string
  phone: string
  street: string
  city: string
  state: string
  pinCode: string
  isDefault: boolean
}

type AppUser = { id: string; name: string; email: string } | null

type CheckoutPageProps = {
  user?: AppUser
}

export default function CheckoutPage({ user }: CheckoutPageProps) {
  const router = useRouter()

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(true)

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  // Payment & errors
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.replace('/login')
    }
  }, [user, router])

  // Fetch cart
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

  // Fetch addresses
  useEffect(() => {
    if (!user) return
    const fetchAddresses = async () => {
      setAddressesLoading(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
          {
            credentials: 'include'
          }
        )
        if (res.ok) {
          const data = await res.json()
          const list: Address[] = data.addresses || []
          setAddresses(list)
          // Auto‑select default address if available
          const defaultAddr = list.find(a => a.isDefault)
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id)
          } else if (list.length > 0) {
            setSelectedAddressId(list[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch addresses', err)
      } finally {
        setAddressesLoading(false)
      }
    }
    fetchAddresses()
  }, [user])

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.price - item.product.discount
    return sum + price * item.quantity
  }, 0)
  const shipping = subtotal > 0 && subtotal <= 999 ? 99 : 0
  const total = subtotal + shipping

  // Place order
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (cartItems.length === 0) {
      setError('Your cart is empty.')
      return
    }

    if (!selectedAddressId) {
      setError('Please select a delivery address.')
      return
    }

    setSubmitting(true)

    // --- UPI: hand off to Razorpay, which creates + verifies the order itself ---
    if (paymentMethod === 'UPI') {
      startRazorpayCheckout({
        addressId: selectedAddressId,
        name: user?.name,
        email: user?.email,
        onSuccess: orderId => {
          setSubmitting(false)
          setSuccessOrderId(orderId)
        },
        onFailure: message => {
          setSubmitting(false)
          setError(message)
        }
      })
      return
    }

    // --- COD: existing flow, unchanged ---
    try {
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: selectedAddressId,
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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- Render ----------
  if (user === null) return null

  // Success screen
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

  // Main checkout
  return (
    <main className="bg-white min-h-screen">
      {/* Header */}
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
          {/* ---------- LEFT: Delivery & Payment ---------- */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-10">
            {/* Address selection */}
            <div>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-5">
                Delivery Address
              </h2>

              {addressesLoading ? (
                <div className="space-y-3">
                  <div className="h-16 bg-[#F5F5F5] animate-pulse rounded" />
                  <div className="h-16 bg-[#F5F5F5] animate-pulse rounded" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="border border-[#e5e5e5] p-6 text-center">
                  <p className="text-sm text-[#555] mb-3">
                    You don&apos;t have any saved addresses yet.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-block bg-[#111111] text-white px-5 py-2 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
                  >
                    Add Address in My Account
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => {
                    const isSelected = selectedAddressId === addr.id
                    return (
                      <label
                        key={addr.id}
                        className={`block border p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-[#111111] bg-[#f9f9f9]'
                            : 'border-[#e5e5e5] hover:border-[#111111]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-0.5 accent-[#111111]"
                          />
                          <div className="text-sm flex-1">
                            <p className="font-medium text-[#111111]">
                              {addr.street}, {addr.city}
                            </p>
                            <p className="text-[#555]">
                              {addr.state} – {addr.pinCode}
                            </p>
                            <p className="text-[#999] text-xs">
                              Phone: {addr.phone}
                            </p>
                            {addr.isDefault && (
                              <span className="inline-block mt-1 text-[10px] font-medium text-[#7A9E7E] bg-[#f0f9f0] px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Payment method */}
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
              disabled={
                submitting ||
                cartLoading ||
                addressesLoading ||
                cartItems.length === 0 ||
                addresses.length === 0 ||
                !selectedAddressId
              }
              className="w-full bg-[#111111] text-white py-3.5 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
            >
              {submitting
                ? 'Placing Order...'
                : `Place Order — ₹${total.toFixed(0)}`}
            </button>
          </form>

          {/* ---------- RIGHT: Order Summary ---------- */}
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
