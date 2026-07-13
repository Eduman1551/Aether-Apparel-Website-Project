import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  price: number
  discount: number
  images: string[]
  gender: string
  colors: string[]
  sizes: string[]
  stock: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    gender: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
    sort: 'newest'
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`
        )
        const data = await res.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error('Failed to fetch products', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold text-[#111111] mb-8">Shop All</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-56 shrink-0 space-y-6">
          <div>
            <label className="text-sm font-medium text-[#111111] block mb-2">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={e => handleFilterChange('gender', e.target.value)}
              className="w-full border border-[#e0e0e0] px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#111111] block mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={e => handleFilterChange('minPrice', e.target.value)}
                className="w-full border border-[#e0e0e0] px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={e => handleFilterChange('maxPrice', e.target.value)}
                className="w-full border border-[#e0e0e0] px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inStock"
              checked={filters.inStock === 'true'}
              onChange={e =>
                handleFilterChange('inStock', e.target.checked ? 'true' : '')
              }
            />
            <label htmlFor="inStock" className="text-sm text-[#111111]">
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-end mb-6">
            <select
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
              className="border border-[#e0e0e0] px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_selling">Best Selling</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-[#555]">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-[#555]">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group"
                >
                  <div className="relative aspect-3/4 bg-[#F5F5F5] overflow-hidden">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-2 left-2 bg-[#111111] text-white text-xs px-2 py-1">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-[#111111]">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-sm font-medium text-[#111111]">
                            ₹{(product.price - product.discount).toFixed(0)}
                          </span>
                          <span className="text-xs text-[#999] line-through">
                            ₹{product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#111111]">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
