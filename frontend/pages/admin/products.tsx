import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  material: string
  care?: string | null
  price: number
  discount: number
  stock: number
  gender: string
  sizes: string[]
  colors: string[]
  categoryId: string
  images: string[]
  category: { name: string }
}

type AppUser = { id: string; name: string; role: string } | null

const ALL_SIZES = ['S', 'M', 'L', 'XL']
const SUGGESTED_COLORS = [
  'Black',
  'White',
  'Gray',
  'Beige',
  'Olive',
  'Sage Green',
  'Blue'
]

const emptyForm = {
  name: '',
  description: '',
  material: '',
  care: '',
  price: '',
  discount: '0',
  gender: 'UNISEX',
  sizes: [] as string[],
  colors: [] as string[],
  stock: '0',
  categoryId: '',
  images: [] as string[]
}

export default function AdminProductsPage({ user }: { user?: AppUser }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageInput, setImageInput] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [error, setError] = useState('')

  // ── AI Add state ──
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Failed to fetch categories', err)
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
    fetchProducts()
    fetchCategories()
  }, [user, router])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const toggleColor = (color: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }))
  }

  const addCustomColor = () => {
    const trimmed = customColor.trim()
    if (trimmed && !form.colors.includes(trimmed)) {
      setForm(prev => ({ ...prev, colors: [...prev.colors, trimmed] }))
    }
    setCustomColor('')
  }

  const addImage = () => {
    const trimmed = imageInput.trim()
    if (trimmed) {
      setForm(prev => ({ ...prev, images: [...prev.images, trimmed] }))
      setImageInput('')
    }
  }

  const removeImage = (url: string) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setImageInput('')
    setCustomColor('')
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const startEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      material: product.material,
      care: product.care || '',
      price: String(product.price),
      discount: String(product.discount),
      gender: product.gender,
      sizes: product.sizes,
      colors: product.colors,
      stock: String(product.stock),
      categoryId: product.categoryId,
      images: product.images
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (!form.categoryId) {
      setError('Please select a category.')
      return
    }
    if (form.sizes.length === 0) {
      setError('Select at least one size.')
      return
    }
    if (form.colors.length === 0) {
      setError('Add at least one color.')
      return
    }

    const payload = {
      name: form.name,
      description: form.description,
      material: form.material,
      care: form.care || null,
      price: Number(form.price),
      discount: Number(form.discount),
      gender: form.gender,
      sizes: form.sizes,
      colors: form.colors,
      stock: Number(form.stock),
      categoryId: form.categoryId,
      images: form.images
    }

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/products`
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to save product')
        return
      }

      resetForm()
      fetchProducts()
    } catch {
      setError('Something went wrong.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    fetchProducts()
  }

  // ── AI Add handlers ──
  const resetAiModal = () => {
    setAiPrompt('')
    setAiError('')
    setAiLoading(false)
    setShowAiModal(false)
  }

  const handleAiSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setAiError('')

    if (aiPrompt.trim().length < 5) {
      setAiError('Describe the product in a sentence or two.')
      return
    }

    setAiLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/ai-create`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: aiPrompt })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setAiError(data.message || 'Failed to create product')
        setAiLoading(false)
        return
      }

      await fetchProducts()
      resetAiModal()

      // The AI can't invent real image URLs, so drop straight into Edit
      // so the admin can add photos right away.
      if (data.product) {
        startEdit(data.product)
      }
    } catch {
      setAiError('Something went wrong.')
      setAiLoading(false)
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
        <p className="text-sm text-[#555] mb-10">
          Manage products and inventory
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
            className="text-sm font-medium text-[#111111] border-b-2 border-[#111111] pb-1"
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
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-widest">
            Products ({products.length})
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setAiError('')
                setAiPrompt('')
                setShowAiModal(true)
              }}
              className="border border-[#7A9E7E] text-[#7A9E7E] px-5 py-2.5 text-sm hover:bg-[#7A9E7E] hover:text-white transition-colors"
            >
              ✨ Add with AI
            </button>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-[#111111] text-white px-5 py-2.5 text-sm hover:bg-[#7A9E7E] transition-colors"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-3 mb-10">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center gap-4 border border-[#e5e5e5] p-4"
            >
              <div className="relative w-14 h-18 bg-[#F5F5F5] shrink-0">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#111111]">
                  {product.name}
                </p>
                <p className="text-xs text-[#999]">{product.category?.name}</p>
              </div>
              <p className="text-sm text-[#111111] w-20">₹{product.price}</p>
              <p
                className={`text-sm w-24 ${product.stock === 0 ? 'text-red-600' : 'text-[#555]'}`}
              >
                Stock: {product.stock}
              </p>
              <button
                onClick={() => startEdit(product)}
                className="text-sm text-[#7A9E7E] hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Add Modal ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-8 py-5">
              <h2 className="text-lg font-semibold text-[#111111]">
                ✨ Add Product with AI
              </h2>
              <button
                onClick={resetAiModal}
                className="text-[#999] hover:text-[#111111] text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAiSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-xs text-[#555] mb-1">
                  Describe the product
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. Black cotton oversized hoodie for men, sizes M/L/XL, ₹2499, 20 in stock, goes in the Outerwear category"
                  className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                />
                <p className="text-xs text-[#999] mt-1.5">
                  The AI will pick the closest existing category and fill in the
                  rest. You&apos;ll still need to add photos afterward.
                </p>
              </div>

              {aiError && <p className="text-sm text-red-600">{aiError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="flex-1 bg-[#111111] text-white py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
                >
                  {aiLoading ? 'Generating...' : 'Generate & Add'}
                </button>
                <button
                  type="button"
                  onClick={resetAiModal}
                  disabled={aiLoading}
                  className="flex-1 border border-[#e0e0e0] py-3 text-sm text-[#111111] hover:border-[#111111]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Form ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white w-full max-w-2xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-8 py-5 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-[#111111]">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={resetForm}
                className="text-[#999] hover:text-[#111111] text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-10">
              {/* Section: Basic Info */}
              <div>
                <p className="text-xs font-semibold text-[#7A9E7E] uppercase tracking-widest mb-4">
                  Basic Information
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Product Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Classic Oversized Tee"
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Short description shown on the product page"
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Category
                    </label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#7A9E7E]"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#555] mb-2">
                      Gender
                    </label>
                    <div className="flex gap-2">
                      {['MEN', 'WOMEN', 'UNISEX'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`flex-1 border px-3 py-2 text-sm transition-colors ${
                            form.gender === g
                              ? 'border-[#111111] bg-[#111111] text-white'
                              : 'border-[#e0e0e0] text-[#111111] hover:border-[#111111]'
                          }`}
                        >
                          {g.charAt(0) + g.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Materials */}
              <div>
                <p className="text-xs font-semibold text-[#7A9E7E] uppercase tracking-widest mb-4">
                  Materials
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Material
                    </label>
                    <input
                      name="material"
                      value={form.material}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 100% Cotton"
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Care Instructions
                    </label>
                    <input
                      name="care"
                      value={form.care}
                      onChange={handleChange}
                      placeholder="e.g. Machine wash cold"
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Pricing & Stock */}
              <div>
                <p className="text-xs font-semibold text-[#7A9E7E] uppercase tracking-widest mb-4">
                  Pricing &amp; Stock
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Price (₹)
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Discount (₹)
                    </label>
                    <input
                      name="discount"
                      type="number"
                      value={form.discount}
                      onChange={handleChange}
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#555] mb-1">
                      Stock Quantity
                    </label>
                    <input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleChange}
                      className="w-full border border-[#e0e0e0] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Variants */}
              <div>
                <p className="text-xs font-semibold text-[#7A9E7E] uppercase tracking-widest mb-4">
                  Variants
                </p>

                <div className="mb-5">
                  <label className="block text-xs text-[#555] mb-2">
                    Available Sizes
                  </label>
                  <div className="flex gap-2">
                    {ALL_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-12 text-sm border transition-colors ${
                          form.sizes.includes(size)
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#e0e0e0] text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#555] mb-2">
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SUGGESTED_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`px-3 py-1.5 text-xs border transition-colors ${
                          form.colors.includes(color)
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#e0e0e0] text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                    {form.colors
                      .filter(c => !SUGGESTED_COLORS.includes(c))
                      .map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className="px-3 py-1.5 text-xs border border-[#111111] bg-[#111111] text-white"
                        >
                          {color} ×
                        </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      placeholder="Add a custom color"
                      className="flex-1 border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                    />
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="px-4 py-2 text-sm border border-[#e0e0e0] text-[#111111] hover:border-[#111111]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Section: Images */}
              <div>
                <p className="text-xs font-semibold text-[#7A9E7E] uppercase tracking-widest mb-4">
                  Product Images
                </p>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {form.images.map(url => (
                      <div
                        key={url}
                        className="relative aspect-square bg-[#F5F5F5] group"
                      >
                        <Image
                          src={url}
                          alt="Preview"
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    placeholder="Paste image URL"
                    className="flex-1 border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 text-sm border border-[#e0e0e0] text-[#111111] hover:border-[#111111]"
                  >
                    Add Image
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] text-white py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-[#e0e0e0] py-3 text-sm text-[#111111] hover:border-[#111111]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
