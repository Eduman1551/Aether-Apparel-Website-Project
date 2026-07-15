import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface AdminOrder {
  id: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  user: { name: string; email: string }
  items: { id: string; quantity: number; product: { name: string } }[]
}

type AppUser = { id: string; name: string; role: string } | null

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage({ user }: { user?: AppUser }) {
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders`,
        {
          credentials: 'include'
        }
      )
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.replace('/')
      return
    }
    if (user === null) {
      router.replace('/login')
      return
    }
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders()
  }, [user, router])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchOrders()
    } finally {
      setUpdatingId(null)
    }
  }

  if (!user || loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-sm text-[#555]">
        Loading...
      </div>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#555] mb-10">Manage customer orders</p>

        <div className="flex gap-4 mb-10 border-b border-[#e5e5e5] pb-4">
          <Link
            href="/admin"
            className="text-sm text-[#555] hover:text-[#111111]"
          >
            Overview
          </Link>
          <Link
            href="/admin/products"
            className="text-sm text-[#555] hover:text-[#111111]"
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#111111] border-b-2 border-[#111111] pb-1"
          >
            Orders
          </Link>
          <Link
            href="/admin/banners"
            className="text-sm text-[#555] hover:text-[#111111]"
          >
            Banners
          </Link>
        </div>

        <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-6">
          All Orders ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <p className="text-sm text-[#555]">No orders placed yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border border-[#e5e5e5] p-5">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#999]">
                      {order.user.name} ({order.user.email})
                    </p>
                    <p className="text-xs text-[#999]">
                      {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                      {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#111111]">
                      ₹{order.total.toFixed(0)}
                    </p>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="mt-2 border border-[#e0e0e0] px-2 py-1 text-xs"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-xs text-[#555]">
                  {order.items.map(item => (
                    <span key={item.id} className="mr-3">
                      {item.product.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

