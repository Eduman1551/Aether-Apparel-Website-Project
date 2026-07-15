import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
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

interface Category {
  id: string
  name: string
}

const SORT_LABELS: Record<string, string> = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  best_selling: 'Best Selling'
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
    sort: 'newest'
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        const data = await res.json()
        const list: Category[] = data.categories || []
        setCategories(list)
        if (list.length > 0) {
          setFilters(prev => ({ ...prev, category: list[0].name }))
        }
      } catch (err) {
        console.error('Failed to fetch categories', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!filters.category) return

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
    setFilters(prev => ({
      search: '',
      category: prev.category,
      gender: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      sort: 'newest'
    }))
  }

  const activeChips: { key: string; label: string; clear: () => void }[] = []
  if (filters.search)
    activeChips.push({
      key: 'search',
      label: `"${filters.search}"`,
      clear: () => handleFilterChange('search', '')
    })
  if (filters.gender)
    activeChips.push({
      key: 'gender',
      label: filters.gender[0].toUpperCase() + filters.gender.slice(1),
      clear: () => handleFilterChange('gender', '')
    })
  if (filters.minPrice || filters.maxPrice)
    activeChips.push({
      key: 'price',
      label: `₹${filters.minPrice || '0'} – ₹${filters.maxPrice || '∞'}`,
      clear: () => {
        handleFilterChange('minPrice', '')
        handleFilterChange('maxPrice', '')
      }
    })
  if (filters.inStock === 'true')
    activeChips.push({
      key: 'inStock',
      label: 'In Stock',
      clear: () => handleFilterChange('inStock', '')
    })

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-14 pb-6">
        <p className="text-[11px] text-[#7A9E7E] font-medium tracking-[0.25em] uppercase mb-2">
          Collection
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-[#111111] tracking-wide">
            {filters.category || 'Shop All'}
          </h1>
          {!loading && (
            <p className="text-sm text-[#999]">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'}
            </p>
          )}
        </div>
      </div>

      <div className="border-b border-[#e5e5e5]">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange('category', cat.name)}
                className={`whitespace-nowrap text-sm py-3 border-b-2 transition-colors ${
                  filters.category === cat.name
                    ? 'border-[#111111] text-[#111111] font-medium'
                    : 'border-transparent text-[#999] hover:text-[#111111]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#e5e5e5]">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 py-3.5">
            <div className="relative flex-1 min-w-0 sm:flex-initial sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="w-full text-sm border border-[#e0e0e0] rounded-sm pl-9 pr-3 py-2.5 bg-white text-[#111111] transition-colors focus:outline-none focus:border-[#7A9E7E] focus:ring-1 focus:ring-[#7A9E7E] placeholder:text-[#bbb]"
              />
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <select
                  value={filters.gender}
                  onChange={e => handleFilterChange('gender', e.target.value)}
                  className="appearance-none text-sm border border-[#e0e0e0] rounded-sm pl-3 pr-8 py-2.5 bg-white text-[#111111] cursor-pointer transition-colors hover:border-[#111111] focus:outline-none focus:border-[#7A9E7E] focus:ring-1 focus:ring-[#7A9E7E]"
                >
                  <option value="">Gender: All</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
                <ChevronDown />
              </div>

              <div className="flex items-center gap-1.5 border border-[#e0e0e0] rounded-sm px-2 py-1 transition-colors hover:border-[#111111] focus-within:border-[#7A9E7E] focus-within:ring-1 focus-within:ring-[#7A9E7E]">
                <span className="text-xs text-[#999] pl-1">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange('minPrice', e.target.value)}
                  className="w-14 text-sm px-1 py-1.5 focus:outline-none placeholder:text-[#bbb]"
                />
                <span className="text-[#ccc] text-sm">–</span>
                <span className="text-xs text-[#999]">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                  className="w-14 text-sm px-1 py-1.5 focus:outline-none placeholder:text-[#bbb]"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#111111] cursor-pointer select-none border border-transparent px-2 py-2 rounded-sm hover:border-[#e0e0e0] transition-colors">
                <Checkbox
                  checked={filters.inStock === 'true'}
                  onChange={checked =>
                    handleFilterChange('inStock', checked ? 'true' : '')
                  }
                />
                In Stock
              </label>
            </div>

            <button
              onClick={() => setFiltersOpen(v => !v)}
              className={`md:hidden relative flex items-center gap-1.5 text-sm border rounded-sm px-3 py-2.5 transition-colors ${
                filtersOpen
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-[#e0e0e0] text-[#333]'
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              Filters
              {activeChips.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#7A9E7E] text-white text-[9px] font-semibold flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>

            <div className="relative ml-auto shrink-0">
              <select
                value={filters.sort}
                onChange={e => handleFilterChange('sort', e.target.value)}
                className="appearance-none text-sm border border-[#e0e0e0] rounded-sm pl-3 pr-8 py-2.5 bg-white text-[#111111] cursor-pointer transition-colors hover:border-[#111111] focus:outline-none focus:border-[#7A9E7E] focus:ring-1 focus:ring-[#7A9E7E]"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </div>

          {filtersOpen && (
            <div className="md:hidden pb-4 flex flex-col gap-3">
              <div className="relative">
                <select
                  value={filters.gender}
                  onChange={e => handleFilterChange('gender', e.target.value)}
                  className="w-full appearance-none text-sm border border-[#e0e0e0] rounded-sm pl-3 pr-8 py-2.5 bg-white text-[#111111]"
                >
                  <option value="">Gender: All</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
                <ChevronDown />
              </div>

              <div className="flex items-center gap-1.5 border border-[#e0e0e0] rounded-sm px-2 py-1 w-full">
                <span className="text-xs text-[#999] pl-1">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange('minPrice', e.target.value)}
                  className="w-full text-sm px-1 py-1.5 focus:outline-none placeholder:text-[#bbb]"
                />
                <span className="text-[#ccc] text-sm">–</span>
                <span className="text-xs text-[#999]">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full text-sm px-1 py-1.5 focus:outline-none placeholder:text-[#bbb]"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#111111] cursor-pointer select-none">
                <Checkbox
                  checked={filters.inStock === 'true'}
                  onChange={checked =>
                    handleFilterChange('inStock', checked ? 'true' : '')
                  }
                />
                In Stock Only
              </label>
            </div>
          )}

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-3.5">
              {activeChips.map(chip => (
                <button
                  key={chip.key}
                  onClick={chip.clear}
                  className="group flex items-center gap-1.5 text-xs text-[#333] bg-[#F5F5F5] hover:bg-[#eee] rounded-full pl-3 pr-2 py-1.5 transition-colors"
                >
                  {chip.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-[#999] group-hover:text-[#B23B3B] transition-colors"
                  >
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs text-[#999] hover:text-[#B23B3B] transition-colors underline underline-offset-2 decoration-[#e0e0e0] ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-3/4 bg-[#F0F0F0] rounded-sm mb-4" />
                <div className="h-2 bg-[#F0F0F0] rounded-sm w-1/4 mb-3" />
                <div className="h-3.5 bg-[#F0F0F0] rounded-sm w-3/4 mb-2.5" />
                <div className="h-3.5 bg-[#F0F0F0] rounded-sm w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
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
            {activeChips.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm border border-[#111111] px-5 py-2.5 text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
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
                  className="group block"
                >
                  <div className="relative aspect-video  bg-[#F5F5F5] overflow-hidden rounded-sm mb-4">
                    {product.images?.[0] && (
                      <>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.05]"
                        />
                        {product.images?.[1] && (
                          <Image
                            src={product.images[1]}
                            alt={`${product.name} alternate`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                          />
                        )}
                      </>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.stock === 0 && (
                        <span className="bg-[#111111] text-white text-[10px] font-semibold px-2.5 py-1 tracking-wider uppercase">
                          Out of Stock
                        </span>
                      )}
                      {hasDiscount && product.stock > 0 && (
                        <span className="bg-[#7A9E7E] text-white text-[10px] font-semibold px-2.5 py-1 tracking-wider uppercase">
                          {discountPercent}% Off
                        </span>
                      )}
                    </div>

                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="absolute top-3 right-3 bg-white/95 text-[#B08D57] text-[10px] font-semibold px-2.5 py-1 tracking-wider uppercase">
                        Low Stock
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="bg-[#111111] text-center py-3 text-[11px] font-medium text-white tracking-[0.2em] uppercase">
                        View Product
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-medium text-[#999] tracking-widest uppercase">
                      {product.gender}
                    </span>
                    {product.colors?.length > 0 && (
                      <div className="flex items-center -space-x-1">
                        {product.colors.slice(0, 4).map((color, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border-2 border-white ring-1 ring-[#e0e0e0]"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-[9px] text-[#999] pl-2">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[15px] text-[#111111] font-medium mb-1 leading-snug group-hover:text-[#7A9E7E] transition-colors">
                    {product.name}
                  </p>

                  {product.sizes?.length > 0 && (
                    <p className="text-[11px] text-[#999] mb-2 tracking-wide">
                      Sizes {product.sizes.join(' · ')}
                    </p>
                  )}

                  <div className="flex items-baseline gap-1.5">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm font-semibold text-[#111111]">
                          ₹{finalPrice.toFixed(0)}
                        </span>
                        <span className="text-[12px] text-[#999] line-through">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-[#111111]">
                        ₹{product.price}
                      </span>
                    )}
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

function ChevronDown() {
  return (
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
  )
}

function Checkbox({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="peer appearance-none w-4 h-4 border border-[#c9c9c9] rounded-[3px] checked:bg-[#7A9E7E] checked:border-[#7A9E7E] transition-colors cursor-pointer"
      />
      <svg
        className="pointer-events-none absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}
