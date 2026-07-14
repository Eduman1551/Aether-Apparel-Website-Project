import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

/* ---------- Types ---------- */
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

type Address = {
  id: string
  phone: string
  street: string
  city: string
  state: string
  pinCode: string
  isDefault: boolean
}

type ProfilePageProps = {
  user?: AppUser | null
}

/* ---------- Constants ---------- */
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

/* ---------- Component ---------- */
export default function ProfilePage({ user }: ProfilePageProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    'account' | 'orders' | 'addresses'
  >('account')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Phone state
  const [phone, setPhone] = useState(user?.phone || '')
  const [addingPhone, setAddingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [phoneSubmitting, setPhoneSubmitting] = useState(false)

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [showAddAddress, setShowAddAddress] = useState(false)

  // Address form (used for both add and edit)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: false
  })
  const [addressError, setAddressError] = useState('')
  const [addressSubmitting, setAddressSubmitting] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.replace('/login')
    }
  }, [user, router])

  // Fetch orders
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
          setAddresses(data.addresses || [])
        }
      } catch (err) {
        console.error('Failed to fetch addresses', err)
      } finally {
        setAddressesLoading(false)
      }
    }
    fetchAddresses()
  }, [user])

  /* ---------- Handlers ---------- */
  const handleAddPhone = async (e: React.SyntheticEvent) => {
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
    } catch {
      setPhoneError('Something went wrong. Please try again.')
    } finally {
      setPhoneSubmitting(false)
    }
  }

  // Start editing an address – populate form
  const startEditAddress = (addr: Address) => {
    setShowAddAddress(false) // close add form if open
    setEditingAddressId(addr.id)
    setAddressForm({
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      isDefault: addr.isDefault
    })
    setAddressError('')
  }

  const cancelEditAddress = () => {
    setEditingAddressId(null)
    setAddressForm({
      phone: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      isDefault: false
    })
    setAddressError('')
  }

  // Submit address (add or update)
  const handleAddressSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setAddressError('')
    const { phone, street, city, state, pinCode } = addressForm
    if (!phone || !street || !city || !state || !pinCode) {
      setAddressError('All fields are required.')
      return
    }

    setAddressSubmitting(true)
    try {
      const url = editingAddressId
        ? `${process.env.NEXT_PUBLIC_API_URL}/addresses/${editingAddressId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/addresses`
      const method = editingAddressId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      })
      const data = await res.json()

      if (!res.ok) {
        setAddressError(data.message || 'Failed to save address')
        return
      }

      // Update local state
      if (editingAddressId) {
        setAddresses(prev =>
          prev.map(a => (a.id === editingAddressId ? data.address : a))
        )
        setEditingAddressId(null)
      } else {
        setAddresses(prev => [...prev, data.address])
        setShowAddAddress(false)
      }

      // Reset form
      setAddressForm({
        phone: '',
        street: '',
        city: '',
        state: '',
        pinCode: '',
        isDefault: false
      })
    } catch {
      setAddressError('Something went wrong. Please try again.')
    } finally {
      setAddressSubmitting(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/${id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.message || 'Failed to delete address')
      }
    } catch {
      alert('Something went wrong while deleting.')
    }
  }

  if (user === null) return null

  /* ---------- Render ---------- */
  return (
    <main className="bg-white min-h-screen">
      {/* Header */}
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
        {/* Tabs */}
        <div className="flex border-b border-[#e5e5e5] mb-10">
          {(
            [
              { key: 'account', label: 'Account Details' },
              {
                key: 'orders',
                label: `My Orders${orders.length > 0 ? ` (${orders.length})` : ''}`
              },
              {
                key: 'addresses',
                label: `Addresses${addresses.length > 0 ? ` (${addresses.length})` : ''}`
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

        {/* ========== ACCOUNT TAB ========== */}
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

        {/* ========== ORDERS TAB ========== */}
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

        {/* ========== ADDRESSES TAB ========== */}
        {activeTab === 'addresses' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#111111]">
                Saved Addresses
              </h2>
              <button
                onClick={() => {
                  setShowAddAddress(!showAddAddress)
                  if (editingAddressId) cancelEditAddress()
                }}
                className="bg-[#111111] text-white px-4 py-2 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
              >
                {showAddAddress ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {/* Add / Edit Address Form */}
            {(showAddAddress || editingAddressId) && (
              <form
                onSubmit={handleAddressSubmit}
                className="border border-[#e5e5e5] p-6 mb-8 space-y-4"
              >
                <h3 className="text-sm font-semibold text-[#111111] mb-3">
                  {editingAddressId ? 'Edit Address' : 'New Address'}
                </h3>

                {addressError && (
                  <p className="text-xs text-red-600">{addressError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={e =>
                        setAddressForm({
                          ...addressForm,
                          phone: e.target.value
                        })
                      }
                      className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Street *
                    </label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={e =>
                        setAddressForm({
                          ...addressForm,
                          street: e.target.value
                        })
                      }
                      className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={e =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={e =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value
                        })
                      }
                      className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Pin Code *
                    </label>
                    <input
                      type="text"
                      value={addressForm.pinCode}
                      onChange={e =>
                        setAddressForm({
                          ...addressForm,
                          pinCode: e.target.value
                        })
                      }
                      className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                      placeholder="Pin code"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-sm text-[#555] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={e =>
                          setAddressForm({
                            ...addressForm,
                            isDefault: e.target.checked
                          })
                        }
                        className="w-4 h-4 border-[#e0e0e0] rounded"
                      />
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="bg-[#111111] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
                  >
                    {addressSubmitting
                      ? 'Saving...'
                      : editingAddressId
                        ? 'Update Address'
                        : 'Save Address'}
                  </button>
                  {(editingAddressId || showAddAddress) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editingAddressId) cancelEditAddress()
                        else setShowAddAddress(false)
                      }}
                      className="border border-[#e0e0e0] px-6 py-2.5 text-sm text-[#111111]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Address List */}
            {addressesLoading ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div
                    key={n}
                    className="border border-[#f0f0f0] p-6 animate-pulse"
                  >
                    <div className="h-4 bg-[#F5F5F5] rounded w-48 mb-2" />
                    <div className="h-3 bg-[#F5F5F5] rounded w-64 mb-2" />
                    <div className="h-3 bg-[#F5F5F5] rounded w-32" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 && !showAddAddress ? (
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-[#111111] mb-2">
                  No addresses saved
                </h2>
                <p className="text-sm text-[#555] mb-8 max-w-xs">
                  Add an address to make checkout faster.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className="border border-[#e5e5e5] p-5 hover:shadow-sm transition-shadow flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-[#111111]">
                        {addr.street}, {addr.city}
                      </p>
                      <p className="text-xs text-[#555]">
                        {addr.state} — {addr.pinCode}
                      </p>
                      <p className="text-xs text-[#999]">Phone: {addr.phone}</p>
                      {addr.isDefault && (
                        <span className="inline-block text-[10px] font-medium text-[#7A9E7E] bg-[#f0f9f0] px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => startEditAddress(addr)}
                        className="text-xs text-[#7A9E7E] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
