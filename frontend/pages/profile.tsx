import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type AppUser = {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
}

type OrderItem = {
  id: string
  productId: string
  size: string
  color: string
  quantity: number
  price: number
  product: { name: string; images: string[] }
}

type Order = {
  id: string
  status: string
  paymentMethod: string
  subtotal: number
  shipping: number
  discount: number
  total: number
  createdAt: string
  items: OrderItem[]
  address: {
    street: string
    city: string
    state: string
    pinCode: string
    phone: string
  }
}

type ProfilePageProps = {
  user?: AppUser | null
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200'
}

const PAYMENT_LABEL: Record<string, string> = {
  UPI: 'UPI',
  COD: 'Cash on Delivery'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'account' | 'orders'>('account')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const [phone, setPhone] = useState(user?.phone || '')
  const [addingPhone, setAddingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [phoneSubmitting, setPhoneSubmitting] = useState(false)

  useEffect(() => {
    if (user === null) {
      router.replace('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      setOrdersLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (err) {
        console.error('Failed to fetch orders', err)
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneError('')

    if (!phoneInput.trim()) {
      setPhoneError('Please enter a phone number.')
      return
    }

    setPhoneSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setPhoneError(data.message || 'Failed to update phone number')
        return
      }

      setPhone(data.user.phone)
      setAddingPhone(false)
      setPhoneInput('')
    } catch{
      setPhoneError('Something went wrong. Please try again.')
    } finally {
      setPhoneSubmitting(false)
    }
  }

  if (user === null) return null

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] tracking-wide">
          My Account
        </h1>
        <nav className="mt-2 flex items-center gap-2 text-xs text-[#999]">
          <Link href="/" className="hover:text-[#7A9E7E] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#111111]">Profile</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
        <div className="flex border-b border-[#e5e5e5] mb-10">
          {(
            [
              { key: 'account', label: 'Account Details' },
              {
                key: 'orders',
                label: `My Orders${orders.length > 0 ? ` (${orders.length})` : ''}`
              }
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#999] hover:text-[#555]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'account' && (
          <div className="max-w-md">
            <div className="flex items-center justify-between gap-5 mb-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
                  <span className="text-white text-xl font-semibold">
                    {user?.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#111111]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#7A9E7E] uppercase tracking-widest">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Member'}
                  </p>
                </div>
              </div>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="shrink-0 bg-[#111111] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
                >
                  Admin Mode
                </Link>
              )}
            </div>

            <div className="space-y-5">
              <div className="border-b border-[#f0f0f0] pb-5">
                <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
                  Full Name
                </p>
                <p className="text-sm text-[#111111]">{user?.name}</p>
              </div>

              <div className="border-b border-[#f0f0f0] pb-5">
                <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
                  Email Address
                </p>
                <p className="text-sm text-[#111111]">{user?.email}</p>
              </div>

              <div className="border-b border-[#f0f0f0] pb-5">
                <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
                  Phone Number
                </p>
                {phone ? (
                  <p className="text-sm text-[#111111]">{phone}</p>
                ) : addingPhone ? (
                  <form onSubmit={handleAddPhone} className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                      />
                      <button
                        type="submit"
                        disabled={phoneSubmitting}
                        className="bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
                      >
                        {phoneSubmitting ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingPhone(false)
                          setPhoneInput('')
                          setPhoneError('')
                        }}
                        className="border border-[#e0e0e0] px-4 py-2 text-sm text-[#111111]"
                      >
                        Cancel
                      </button>
                    </div>
                    {phoneError && (
                      <p className="text-xs text-red-600">{phoneError}</p>
                    )}
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingPhone(true)}
                    className="text-sm text-[#7A9E7E] hover:underline mt-1"
                  >
                    + Add Phone Number
                  </button>
                )}
              </div>

              <div className="border-b border-[#f0f0f0] pb-5">
                <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
                  Account Type
                </p>
                <p className="text-sm text-[#111111]">
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </p>
              </div>
            </div>

            <p className="mt-8 text-xs text-[#999]">
              To update your details, please contact{' '}
              <a
                href="mailto:hello@aetherapparel.com"
                className="text-[#7A9E7E] hover:underline"
              >
                hello@aetherapparel.com
              </a>
            </p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div
                    key={n}
                    className="border border-[#f0f0f0] p-6 animate-pulse"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="h-4 bg-[#F5F5F5] rounded w-40" />
                      <div className="h-5 bg-[#F5F5F5] rounded w-20" />
                    </div>
                    <div className="h-3 bg-[#F5F5F5] rounded w-56 mb-2" />
                    <div className="h-3 bg-[#F5F5F5] rounded w-32" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d0d0d0"
                  strokeWidth="1.2"
                  className="mb-6"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                <h2 className="text-lg font-semibold text-[#111111] mb-2">
                  No orders yet
                </h2>
                <p className="text-sm text-[#555] mb-8 max-w-xs">
                  When you place your first order, it will appear here.
                </p>
                <Link
                  href="/products"
                  className="bg-[#111111] text-white px-8 py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const isExpanded = expandedOrder === order.id
                  const statusStyle =
                    STATUS_STYLES[order.status] ||
                    'bg-gray-50 text-gray-600 border-gray-200'

                  return (
                    <div
                      key={order.id}
                      className="border border-[#e5e5e5] transition-shadow hover:shadow-sm"
                    >
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                        className="w-full text-left px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-[#111111]">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <span
                              className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 border rounded-full ${statusStyle}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#999]">
                            Placed on {formatDate(order.createdAt)} ·{' '}
                            {PAYMENT_LABEL[order.paymentMethod] ||
                              order.paymentMethod}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <p className="text-sm font-semibold text-[#111111]">
                            ₹{order.total.toFixed(0)}
                          </p>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#999"
                            strokeWidth="1.5"
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#f0f0f0] px-6 pb-6 pt-5">
                          <div className="space-y-4 mb-6">
                            {order.items.map(item => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4"
                              >
                                <div className="w-12 h-16 bg-[#F5F5F5] shrink-0 overflow-hidden">
                                  {item.product?.images?.[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-[#111111] truncate">
                                    {item.product?.name || 'Product'}
                                  </p>
                                  <p className="text-xs text-[#999] mt-0.5">
                                    {item.size} · {item.color} · Qty{' '}
                                    {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-[#111111] shrink-0">
                                  ₹{(item.price * item.quantity).toFixed(0)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {order.address && (
                            <div className="mb-5">
                              <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
                                Delivery Address
                              </p>
                              <p className="text-sm text-[#555]">
                                {order.address.street}, {order.address.city},{' '}
                                {order.address.state} — {order.address.pinCode}
                              </p>
                              <p className="text-xs text-[#999] mt-0.5">
                                Ph: {order.address.phone}
                              </p>
                            </div>
                          )}

                          <div className="bg-[#F5F5F5] p-4 text-sm space-y-2">
                            <div className="flex justify-between text-[#555]">
                              <span>Subtotal</span>
                              <span>₹{order.subtotal.toFixed(0)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-[#7A9E7E]">
                                <span>Promo Discount</span>
                                <span>−₹{order.discount.toFixed(0)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-[#555]">
                              <span>Shipping</span>
                              <span>
                                {order.shipping === 0
                                  ? 'Free'
                                  : `₹${order.shipping}`}
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold text-[#111111] border-t border-[#e0e0e0] pt-2 mt-1">
                              <span>Total</span>
                              <span>₹{order.total.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
