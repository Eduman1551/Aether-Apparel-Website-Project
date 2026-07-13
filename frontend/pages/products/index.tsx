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

  const clearFilters = () => {
    setFilters({
      gender: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      sort: 'newest'
    })
  }

  const activeFilterCount = [
    filters.gender,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock
  ].filter(Boolean).length

  return (
    <div className="bg-white min-h-screen">
      {/* Page Title */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-12 pb-6">
        <p className="text-xs text-[#7A9E7E] font-medium tracking-[0.2em] uppercase mb-2">
          Collection
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-wide">
            Shop All
          </h1>
          {!loading && (
            <p className="text-sm text-[#999]">
              {products.length} {products.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-y border-[#e5e5e5]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 flex flex-wrap items-center gap-3 md:gap-4">
          <div className="relative">
            <select
              value={filters.gender}
              onChange={e => handleFilterChange('gender', e.target.value)}
              className="appearance-none text-sm border border-[#e0e0e0] pl-3 pr-8 py-2.5 bg-white text-[#111111] rounded-sm cursor-pointer transition-colors hover:border-[#111111] focus:outline-none focus:border-[#7A9E7E] focus:ring-1 focus:ring-[#7A9E7E]"
            >
              <option value="">Gender: All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 border border-[#e0e0e0] rounded-sm px-2 py-1 transition-colors hover:border-[#111111] focus-within:border-[#7A9E7E] focus-within:ring-1 focus-within:ring-[#7A9E7E]">
            <span className="text-xs text-[#999] pl-1">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={e => handleFilterChange('minPrice', e.target.value)}
              className="w-16 text-sm px-1 py-1.5 focus:outline-none placeholder:text-[#bbb]"
            />
            <span className="text-[#ccc] text-sm">–</span>
            <span className="text-xs text-[#999]">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={e => handleFilterChange('maxPrice', e.target.value)}
              className="w-16 text-sm px-1 py-1.5 focus:outline-none placeholder:text-[#bbb]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#111111] cursor-pointer select-none border border-transparent px-2 py-2 rounded-sm hover:border-[#e0e0e0] transition-colors">
            <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
              <input
                type="checkbox"
                checked={filters.inStock === 'true'}
                onChange={e =>
                  handleFilterChange('inStock', e.target.checked ? 'true' : '')
                }
                className="peer appearance-none w-4 h-4 border border-[#c9c9c9] rounded-[3px] checked:bg-[#7A9E7E] checked:border-[#7A9E7E] transition-colors cursor-pointer"
              />
              <svg
                className="pointer-events-none absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            In Stock Only
          </label>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#999] hover:text-[#B23B3B] transition-colors tracking-wide underline underline-offset-2 decoration-[#e0e0e0]"
            >
              Clear filters
            </button>
          )}

          <div className="relative ml-auto">
            <select
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
              className="appearance-none text-sm border border-[#e0e0e0] pl-3 pr-8 py-2.5 bg-white text-[#111111] rounded-sm cursor-pointer transition-colors hover:border-[#111111] focus:outline-none focus:border-[#7A9E7E] focus:ring-1 focus:ring-[#7A9E7E]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_selling">Best Selling</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-[#eeeeee] animate-pulse">
                <div className="aspect-square sm:aspect-4/5 bg-[#F0F0F0]" />
                <div className="p-3.5">
                  <div className="h-2.5 bg-[#F0F0F0] rounded-sm w-1/4 mb-3" />
                  <div className="h-3.5 bg-[#F0F0F0] rounded-sm w-3/4 mb-2.5" />
                  <div className="h-3 bg-[#F0F0F0] rounded-sm w-1/2 mb-3" />
                  <div className="h-3.5 bg-[#F0F0F0] rounded-sm w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <svg
              className="w-10 h-10 text-[#ccc] mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            <p className="text-sm text-[#555] mb-1">No products found</p>
            <p className="text-xs text-[#999] mb-6">
              Try adjusting or clearing your filters
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm border border-[#111111] px-5 py-2.5 text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map(product => {
              const hasDiscount = product.discount > 0
              const finalPrice = product.price - product.discount
              const discountPercent = hasDiscount
                ? Math.round((product.discount / product.price) * 100)
                : 0

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block border border-[#eeeeee] hover:border-[#d8d8d8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 bg-white"
                >
                  {/* Image */}
                  <div className="relative aspect-square sm:aspect-4/5 bg-[#F5F5F5] overflow-hidden">
                    {product.images?.[0] && (
                      <>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
                        />
                        {product.images?.[1] && (
                          <Image
                            src={product.images[1]}
                            alt={`${product.name} alternate`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                          />
                        )}
                      </>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {product.stock === 0 && (
                        <span className="bg-[#111111] text-white text-[9px] font-semibold px-2 py-1 tracking-wider uppercase">
                          Out of Stock
                        </span>
                      )}
                      {hasDiscount && product.stock > 0 && (
                        <span className="bg-[#7A9E7E] text-white text-[9px] font-semibold px-2 py-1 tracking-wider uppercase">
                          {discountPercent}% Off
                        </span>
                      )}
                    </div>

                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="absolute top-2.5 right-2.5 bg-white/95 text-[#B08D57] text-[9px] font-semibold px-2 py-1 tracking-wider uppercase">
                        Low Stock
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="bg-[#111111] text-center py-2 text-[11px] font-medium text-white tracking-widest uppercase">
                        View Product
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-medium text-[#999] tracking-widest uppercase">
                        {product.gender}
                      </span>
                      {product.colors?.length > 0 && (
                        <span className="text-[9px] text-[#999]">
                          {product.colors.length}{' '}
                          {product.colors.length === 1 ? 'colour' : 'colours'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#111111] font-medium mb-1 leading-snug line-clamp-1 group-hover:text-[#7A9E7E] transition-colors">
                      {product.name}
                    </p>

                    {product.sizes?.length > 0 && (
                      <p className="text-[11px] text-[#999] mb-2.5 tracking-wide">
                        Sizes {product.sizes.join(' · ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        {hasDiscount ? (
                          <>
                            <span className="text-sm font-semibold text-[#111111]">
                              ₹{finalPrice.toFixed(0)}
                            </span>
                            <span className="text-[11px] text-[#999] line-through">
                              ₹{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-[#111111]">
                            ₹{product.price}
                          </span>
                        )}
                      </div>

                      {product.colors?.length > 0 && (
                        <div className="flex items-center -space-x-1">
                          {product.colors.slice(0, 3).map((color, i) => (
                            <span
                              key={i}
                              className="w-3 h-3 rounded-full border-2 border-white ring-1 ring-[#e0e0e0]"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 3 && (
                            <span className="text-[9px] text-[#999] pl-2">
                              +{product.colors.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
