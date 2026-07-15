import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  ctaText: string
  ctaLink: string
  isActive: boolean
}

type AppUser = { id: string; name: string; role: string } | null

const emptyForm = {
  title: '',
  subtitle: '',
  ctaText: 'Shop Now',
  ctaLink: '/products',
  isActive: true
}

export default function AdminBannersPage({ user }: { user?: AppUser }) {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners`, {
        credentials: 'include'
      })
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (err) {
      console.error('Failed to fetch banners', err)
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
    fetchBanners()
  }, [user, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to create banner')
        return
      }

      setForm(emptyForm)
      setShowForm(false)
      fetchBanners()
    } catch {
      setError('Something went wrong.')
    }
  }

  const setActive = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true })
    })
    fetchBanners()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    fetchBanners()
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
        <p className="text-sm text-[#555] mb-10">
          Manage homepage promo banners
        </p>

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
            className="text-sm font-medium text-[#111111] border-b-2 border-[#111111] pb-1"
          >
            Banners
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest">
            Promo Banners ({banners.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#111111] text-white px-5 py-2.5 text-sm hover:bg-[#7A9E7E] transition-colors"
          >
            + New Banner
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-[#e5e5e5] p-6 mb-8 space-y-4"
          >
            <div>
              <label className="block text-xs text-[#555] mb-1">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Flat 20% Off Sitewide"
                className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#555] mb-1">Subtitle</label>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="e.g. No code needed, applied at checkout"
                className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#555] mb-1">
                  Button Text
                </label>
                <input
                  name="ctaText"
                  value={form.ctaText}
                  onChange={handleChange}
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#555] mb-1">
                  Button Link
                </label>
                <input
                  name="ctaLink"
                  value={form.ctaLink}
                  onChange={handleChange}
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#111111]">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Set as active banner (shows on homepage immediately)
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#111111] text-white px-6 py-2 text-sm hover:bg-[#7A9E7E] transition-colors"
              >
                Create Banner
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
          {banners.length === 0 ? (
            <p className="text-sm text-[#555]">No banners created yet.</p>
          ) : (
            banners.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between border border-[#e5e5e5] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#111111]">
                      {b.title}
                    </p>
                    {b.isActive && (
                      <span className="text-xs bg-[#7A9E7E] text-white px-2 py-0.5">
                        Live
                      </span>
                    )}
                  </div>
                  {b.subtitle && (
                    <p className="text-xs text-[#999] mt-1">{b.subtitle}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  {!b.isActive && (
                    <button
                      onClick={() => setActive(b.id)}
                      className="text-sm text-[#7A9E7E] hover:underline"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(b.id)}
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
