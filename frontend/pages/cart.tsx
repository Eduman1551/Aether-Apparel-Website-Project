import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type CartProduct = {
  id: string
  name: string
  price: number
  discount: number
  images: string[]
}

type CartItem = {
  id: string
  productId: string
  size: string
  color: string
  quantity: number
  product: CartProduct
}

type CartPageProps = {
  user?: { id: string; name: string; email: string } | null
  refreshCartCount?: () => Promise<void>
}

export default function CartPage({ user, refreshCartCount }: CartPageProps) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    if (user === null) {
      router.replace('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (!user) return

    const fetchCart = async () => {
      setLoading(true)
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
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    setUpdatingId(itemId)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ quantity: newQty })
        }
      )
      if (res.ok) {
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQty } : item
          )
        )
      }
    } catch (err) {
      console.error('Failed to update quantity', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdatingId(itemId)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )
      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== itemId))
        await refreshCartCount?.()
      }
    } catch (err) {
      console.error('Failed to remove item', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.product.price - item.product.discount
    return sum + itemPrice * item.quantity
  }, 0)
  const shipping = subtotal > 0 && subtotal <= 999 ? 99 : 0
  const total = subtotal + shipping

  if (user === null) return null 

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] tracking-wide">
          Shopping Cart
        </h1>
        <nav className="mt-2 flex items-center gap-2 text-xs text-[#999]">
          <Link href="/" className="hover:text-[#7A9E7E] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#111111]">Cart</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  className="flex gap-5 pb-6 border-b border-[#f0f0f0] animate-pulse"
                >
                  <div className="w-24 h-32 bg-[#F5F5F5] shrink-0 rounded-sm" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 bg-[#F5F5F5] rounded w-2/3" />
                    <div className="h-3 bg-[#F5F5F5] rounded w-1/3" />
                    <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-[#F5F5F5] rounded-sm animate-pulse" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d0d0d0"
              strokeWidth="1.2"
              className="mb-6"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <h2 className="text-xl font-semibold text-[#111111] mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-[#555] mb-8 max-w-xs">
              Looks like you haven&apos;t added anything yet. Explore our
              collection and find something you love.
            </p>
            <Link
              href="/products"
              className="bg-[#111111] text-white px-8 py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="hidden md:grid grid-cols-12 text-xs text-[#999] uppercase tracking-widest pb-3 border-b border-[#e5e5e5] mb-1">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Size / Color</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Price</span>
              </div>

              <div className="divide-y divide-[#f0f0f0]">
                {cartItems.map(item => {
                  const itemPrice = item.product.price - item.product.discount
                  const isUpdating = updatingId === item.id

                  return (
                    <div
                      key={item.id}
                      className={`py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-opacity ${
                        isUpdating ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      <div className="md:col-span-6 flex gap-4">
                        <Link
                          href={`/products/${item.productId}`}
                          className="relative w-20 h-28 bg-[#F5F5F5] shrink-0 overflow-hidden group"
                        >
                          {item.product.images?.[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
                            />
                          )}
                        </Link>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-sm font-medium text-[#111111] hover:text-[#7A9E7E] transition-colors leading-snug"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-xs text-[#999] mt-1 md:hidden">
                              {item.size} · {item.color}
                            </p>
                          </div>
                          {item.product.discount > 0 && (
                            <p className="text-xs text-[#999] line-through">
                              ₹{item.product.price}
                            </p>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating}
                            className="text-xs text-[#999] hover:text-red-500 transition-colors text-left mt-1 w-fit"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="hidden md:flex md:col-span-2 flex-col items-center gap-1">
                        <span className="text-xs text-[#555] border border-[#e0e0e0] px-2 py-0.5">
                          {item.size}
                        </span>
                        <span className="text-xs text-[#555]">
                          {item.color}
                        </span>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-start md:justify-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={isUpdating || item.quantity <= 1}
                          className="w-7 h-7 border border-[#e0e0e0] text-[#111111] text-sm flex items-center justify-center hover:border-[#111111] transition-colors disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="text-sm text-[#111111] w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={isUpdating}
                          className="w-7 h-7 border border-[#e0e0e0] text-[#111111] text-sm flex items-center justify-center hover:border-[#111111] transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                        <span className="text-sm font-medium text-[#111111]">
                          ₹{(itemPrice * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm text-[#555] hover:text-[#7A9E7E] transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      d="M19 12H5M12 5l-7 7 7 7"
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-[#F5F5F5] p-6">
                <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#555]">
                    <span>
                      Subtotal (
                      {cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="text-[#111111] font-medium">
                      ₹{subtotal.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#555]">
                    <span>Shipping</span>
                    <span className="text-[#111111] font-medium">
                      {shipping === 0 ? (
                        <span className="text-[#7A9E7E]">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-[#7A9E7E]">
                      Add ₹{(999 - subtotal + 1).toFixed(0)} more for free
                      shipping
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <p className="text-xs text-[#111111] font-medium mb-2 uppercase tracking-widest">
                    Promo Code
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoError('')
                      }}
                      placeholder="e.g. WELCOME20"
                      className="flex-1 border border-[#e0e0e0] px-3 py-2 text-sm bg-white text-[#111111] focus:outline-none focus:border-[#7A9E7E] uppercase placeholder:normal-case placeholder:text-[#aaa]"
                    />
                    <button
                      className="px-3 py-2 bg-[#111111] text-white text-xs hover:bg-[#7A9E7E] transition-colors"
                      onClick={() => {
                        if (!promoCode.trim())
                          setPromoError('Enter a promo code')
                        else
                          setPromoError(
                            'Apply promo codes at checkout'
                          )
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-[#7A9E7E] mt-1">{promoError}</p>
                  )}
                </div>

                <div className="border-t border-[#e0e0e0] mt-6 pt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#111111]">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-[#111111]">
                    ₹{total.toFixed(0)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 block w-full bg-[#111111] text-white py-3 text-sm font-medium text-center hover:bg-[#7A9E7E] transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-xs text-[#999] text-center mt-4">
                  Secure checkout · UPI & Cash on Delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
