import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface SalesReport {
  totalRevenue: number
  totalOrders: number
  topProducts: { name: string; quantitySold: number }[]
}

type AppUser = { id: string; name: string; role: string } | null

export default function AdminDashboard({ user }: { user?: AppUser }) {
  const router = useRouter()
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)

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

    const fetchReport = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/sales`,
          {
            credentials: 'include'
          }
        )
        if (res.status === 403) {
          router.replace('/')
          return
        }
        const data = await res.json()
        setReport(data)
      } catch (err) {
        console.error('Failed to fetch report', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [user, router])

  if (!user || loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-sm text-[#555]">
        Loading dashboard...
      </div>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#555] mb-10">
          Overview of store performance
        </p>

        <div className="flex gap-4 mb-10 border-b border-[#e5e5e5] pb-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-[#111111] border-b-2 border-[#111111] pb-1"
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
            className="text-sm text-[#555] hover:text-[#111111]"
          >
            Orders
          </Link>
          <Link
            href="/admin/banners"
            className="text-sm text-[#555] hover:text-[#111111]"
          >
            Banners
          </Link>
          <Link
            href="/admin/promocodes"
            className="text-sm text-[#555] hover:text-[#111111]"
          >
            Promo Codes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-[#e5e5e5] p-6">
            <p className="text-xs text-[#999] uppercase tracking-widest mb-2">
              Total Revenue
            </p>
            <p className="text-3xl font-semibold text-[#111111]">
              ₹{report?.totalRevenue.toFixed(0)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] p-6">
            <p className="text-xs text-[#999] uppercase tracking-widest mb-2">
              Total Orders
            </p>
            <p className="text-3xl font-semibold text-[#111111]">
              {report?.totalOrders}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest mb-4">
            Top Selling Products
          </h2>
          {report?.topProducts.length === 0 ? (
            <p className="text-sm text-[#555]">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {report?.topProducts.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-[#e5e5e5] pb-3"
                >
                  <span className="text-sm text-[#111111]">{p.name}</span>
                  <span className="text-sm text-[#555]">
                    {p.quantitySold} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
