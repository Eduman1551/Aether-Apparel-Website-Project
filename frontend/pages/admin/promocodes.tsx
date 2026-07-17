import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface PromoCode {
  id: string
  code: string
  discountType: string
  discountValue: number
  isActive: boolean
  expiresAt: string | null
}

type AppUser = { id: string; name: string; role: string } | null

const emptyForm = {
  code: '',
  discountType: 'PERCENT',
  discountValue: '',
  expiresAt: '',
  isActive: true
}

export default function AdminPromoCodesPage({ user }: { user?: AppUser }) {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/promo-codes`,
        {
          credentials: 'include'
        }
      )
      const data = await res.json()
      setPromoCodes(data.promoCodes || [])
    } catch (err) {
      console.error('Failed to fetch promo codes', err)
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
    //eslint-disable-next-line
    fetchPromoCodes()
  }, [user, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/promo-codes`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            discountValue: Number(form.discountValue),
            expiresAt: form.expiresAt || null
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to create promo code')
        return
      }

      setForm(emptyForm)
      setShowForm(false)
      fetchPromoCodes()
    } catch {
      setError('Something went wrong.')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-codes/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive })
    })
    fetchPromoCodes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-codes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    fetchPromoCodes()
  }

  if (!user || loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-sm text-[#555]">
        Loading...
      </div>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#555] mb-10">Manage promo codes</p>

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
            href="/admin/promo-codes"
            className="text-sm font-medium text-[#111111] border-b-2 border-[#111111] pb-1"
          >
            Promo Codes
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest">
            Promo Codes ({promoCodes.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#111111] text-white px-5 py-2.5 text-sm hover:bg-[#7A9E7E] transition-colors"
          >
            + New Promo Code
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-[#e5e5e5] p-6 mb-8 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#555] mb-1">Code</label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  placeholder="e.g. FESTIVE25"
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm uppercase focus:outline-none focus:border-[#7A9E7E]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#555] mb-1">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#7A9E7E]"
                >
                  <option value="PERCENT">Percent (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#555] mb-1">
                  Discount Value{' '}
                  {form.discountType === 'PERCENT' ? '(%)' : '(₹)'}
                </label>
                <input
                  name="discountValue"
                  type="number"
                  value={form.discountValue}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#555] mb-1">
                  Expires On (optional)
                </label>
                <input
                  name="expiresAt"
                  type="date"
                  value={form.expiresAt}
                  onChange={handleChange}
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#111111] text-white px-6 py-2 text-sm hover:bg-[#7A9E7E] transition-colors"
              >
                Create Promo Code
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-[#e0e0e0] px-6 py-2 text-sm text-[#111111]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {promoCodes.length === 0 ? (
            <p className="text-sm text-[#555]">No promo codes created yet.</p>
          ) : (
            promoCodes.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between border border-[#e5e5e5] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#111111]">
                      {p.code}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 ${
                        p.isActive
                          ? 'bg-[#7A9E7E] text-white'
                          : 'bg-[#e5e5e5] text-[#555]'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-[#999] mt-1">
                    {p.discountType === 'PERCENT'
                      ? `${p.discountValue}% off`
                      : `₹${p.discountValue} off`}
                    {p.expiresAt &&
                      ` · Expires ${new Date(p.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleActive(p.id, p.isActive)}
                    className="text-sm text-[#7A9E7E] hover:underline"
                  >
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
