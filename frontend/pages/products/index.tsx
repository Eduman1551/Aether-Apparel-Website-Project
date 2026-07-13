import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
          `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`
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
    <div className="bg-white">
      {/* Page Title */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-10 pb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] tracking-wide">
          Shop All
        </h1>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="top-18.25 z-40 bg-white border-y border-[#e5e5e5]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 flex flex-wrap items-center gap-4 md:gap-8">
          <select
            value={filters.gender}
            onChange={e => handleFilterChange('gender', e.target.value)}
            className="text-sm border border-[#e0e0e0] px-3 py-2 bg-white text-[#111111] focus:outline-none focus:border-[#7A9E7E]"
          >
            <option value="">Gender: All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice}
              onChange={e => handleFilterChange('minPrice', e.target.value)}
              className="w-20 text-sm border border-[#e0e0e0] px-2 py-2 focus:outline-none focus:border-[#7A9E7E]"
            />
            <span className="text-[#999] text-sm">–</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice}
              onChange={e => handleFilterChange('maxPrice', e.target.value)}
              className="w-20 text-sm border border-[#e0e0e0] px-2 py-2 focus:outline-none focus:border-[#7A9E7E]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#111111] cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock === 'true'}
              onChange={e =>
                handleFilterChange('inStock', e.target.checked ? 'true' : '')
              }
            />
            In Stock Only
          </label>

          <select
            value={filters.sort}
            onChange={e => handleFilterChange('sort', e.target.value)}
            className="ml-auto text-sm border border-[#e0e0e0] px-3 py-2 bg-white text-[#111111] focus:outline-none focus:border-[#7A9E7E]"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="best_selling">Best Selling</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10">
        {loading ? (
          <p className="text-sm text-[#555]">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-[#555]">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-14">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block"
              >
                <div className="relative aspect-3/4 bg-[#F5F5F5] overflow-hidden mb-4">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 bg-[#111111] text-white text-xs px-2 py-1 tracking-wide">
                      Out of Stock
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#111111] mb-1">{product.name}</p>
                <div className="flex items-center gap-2">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
