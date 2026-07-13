import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  material: string
  care: string | null
  price: number
  discount: number
  gender: string
  sizes: string[]
  colors: string[]
  stock: number
  images: string[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    user: { name: string }
  }[]
}

type ProductDetailProps = {
  refreshCartCount?: () => Promise<void>
}

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

let toastId = 0

export default function ProductDetailPage({ refreshCartCount }: ProductDetailProps) {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [addingToCart, setAddingToCart] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, variant: ToastVariant = 'success') => {
    const newId = ++toastId
    setToasts(prev => [...prev, { id: newId, message, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newId))
    }, 3500)
  }

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoading(true)
      // Reset selections when navigating to a different product
      setSelectedSize('')
      setSelectedColor('')
      setQuantity(1)
      setSelectedImage(0)
      setValidationError('')

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
        )
        const data = await res.json()
        setProduct(data.product)
        setRelated(data.relatedProducts || [])
      } catch (err) {
        console.error('Failed to fetch product', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return

    // Validate selections before calling the API
    if (!selectedSize && !selectedColor) {
      setValidationError('Please select a size and color')
      return
    }
    if (!selectedSize) {
      setValidationError('Please select a size')
      return
    }
    if (!selectedColor) {
      setValidationError('Please select a color')
      return
    }

    setValidationError('')
    setAddingToCart(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          color: selectedColor,
          quantity
        })
      })

      if (res.status === 401) {
        showToast('Please log in to add items to your cart', 'info')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        showToast(data.message || 'Could not add to cart', 'error')
        return
      }

      showToast(`${product.name} added to cart!`, 'success')
      await refreshCartCount?.()
    } catch (err) {
      console.error('Add to cart error', err)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setAddingToCart(false)
    }
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div>
            <div className="aspect-3/4 bg-[#F5F5F5] mb-4" />
            <div className="flex gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-16 h-20 bg-[#F5F5F5]" />
              ))}
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <div className="h-6 bg-[#F5F5F5] rounded w-3/4" />
            <div className="h-4 bg-[#F5F5F5] rounded w-1/4" />
            <div className="h-8 bg-[#F5F5F5] rounded w-1/3" />
            <div className="h-4 bg-[#F5F5F5] rounded w-full mt-6" />
            <div className="h-4 bg-[#F5F5F5] rounded w-5/6" />
            <div className="h-12 bg-[#F5F5F5] rounded mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-lg font-semibold text-[#111111] mb-2">
          Product not found
        </p>
        <p className="text-sm text-[#555] mb-8">
          This product may have been removed or the link is incorrect.
        </p>
        <Link
          href="/products"
          className="bg-[#111111] text-white px-8 py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  const finalPrice = product.price - product.discount
  const discountPercent =
    product.discount > 0
      ? Math.round((product.discount / product.price) * 100)
      : 0

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0

  const roundedRating = Math.round(avgRating)

  return (
    <>
      {/* ── Toast Notifications ── */}
      <div className="fixed top-20 right-5 z-100 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-5 py-3 text-sm font-medium shadow-lg flex items-center gap-3 pointer-events-auto animate-slide-in ${
              toast.variant === 'success'
                ? 'bg-[#111111] text-white'
                : toast.variant === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#7A9E7E] text-white'
            }`}
          >
            {toast.variant === 'success' && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {toast.variant === 'error' && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#999]">
          <Link href="/" className="hover:text-[#7A9E7E] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-[#7A9E7E] transition-colors"
          >
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#111111]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ── Images ── */}
          <div>
            {/* Main image */}
            <div className="relative aspect-3/4 bg-[#F5F5F5] mb-4 overflow-hidden group">
              {product.images?.[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
              {product.stock === 0 && (
                <span className="absolute top-3 left-3 bg-[#111111] text-white text-xs px-2 py-1 tracking-wide z-10">
                  Out of Stock
                </span>
              )}
              {discountPercent > 0 && (
                <span className="absolute top-3 right-3 bg-[#7A9E7E] text-white text-xs px-2 py-1 tracking-wide z-10">
                  −{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-20 bg-[#F5F5F5] overflow-hidden border transition-colors ${
                      selectedImage === i
                        ? 'border-[#111111]'
                        : 'border-transparent hover:border-[#ccc]'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Details ── */}
          <div>
            <h1 className="text-2xl font-semibold text-[#111111] leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[#7A9E7E] text-sm tracking-tight">
                  {'★'.repeat(roundedRating)}
                  <span className="text-[#ddd]">
                    {'★'.repeat(5 - roundedRating)}
                  </span>
                </span>
                <span className="text-xs text-[#999]">
                  {avgRating.toFixed(1)} ({product.reviews.length}{' '}
                  {product.reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xl font-medium text-[#111111]">
                ₹{finalPrice.toFixed(0)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm text-[#999] line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-[#7A9E7E] font-medium">
                    Save ₹{product.discount}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <p
              className={`text-xs mt-2 font-medium ${
                product.stock > 5
                  ? 'text-[#7A9E7E]'
                  : product.stock > 0
                    ? 'text-orange-500'
                    : 'text-red-500'
              }`}
            >
              {product.stock > 5
                ? `In Stock (${product.stock} available)`
                : product.stock > 0
                  ? `Only ${product.stock} left!`
                  : 'Out of Stock'}
            </p>

            {/* Color Selection */}
            <div className="mt-7">
              <p className="text-sm font-medium text-[#111111] mb-2">
                Color
                {selectedColor && (
                  <span className="font-normal text-[#555] ml-2">
                    — {selectedColor}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color)
                      setValidationError('')
                    }}
                    className={`px-4 py-1.5 text-xs border transition-colors ${
                      selectedColor === color
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#e0e0e0] text-[#111111] hover:border-[#999]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-6">
              <p className="text-sm font-medium text-[#111111] mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size)
                      setValidationError('')
                    }}
                    className={`w-11 h-11 text-xs border transition-colors ${
                      selectedSize === size
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#e0e0e0] text-[#111111] hover:border-[#999]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-sm font-medium text-[#111111] mb-2">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 border border-[#e0e0e0] text-[#111111] flex items-center justify-center hover:border-[#111111] transition-colors disabled:opacity-30"
                >
                  −
                </button>
                <span className="text-sm text-[#111111] w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(q => Math.min(product.stock || 10, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 border border-[#e0e0e0] text-[#111111] flex items-center justify-center hover:border-[#111111] transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <p className="text-xs text-red-500 mt-4">{validationError}</p>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="w-full mt-5 bg-[#111111] text-white py-3.5 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {addingToCart ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Adding...
                </>
              ) : product.stock === 0 ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>

            {/* Product Info Accordions */}
            <div className="mt-10 divide-y divide-[#f0f0f0] text-sm text-[#555]">
              {[
                { label: 'Description', value: product.description },
                { label: 'Material', value: product.material },
                ...(product.care
                  ? [{ label: 'Care Instructions', value: product.care }]
                  : []),
                {
                  label: 'Delivery',
                  value: 'Estimated delivery in 4–7 business days'
                },
                { label: 'Returns', value: '7-day easy return policy' }
              ].map(info => (
                <div key={info.label} className="py-4">
                  <p className="font-medium text-[#111111] mb-1">
                    {info.label}
                  </p>
                  <p className="leading-relaxed">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-20 max-w-2xl">
          <h2 className="text-xl font-semibold text-[#111111] mb-6">
            Customer Reviews
            {product.reviews.length > 0 && (
              <span className="text-sm font-normal text-[#999] ml-2">
                ({product.reviews.length})
              </span>
            )}
          </h2>
          {product.reviews.length === 0 ? (
            <p className="text-sm text-[#555]">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div className="space-y-6">
              {product.reviews.map(r => (
                <div key={r.id} className="border-b border-[#f0f0f0] pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#111111]">
                      {r.user.name}
                    </span>
                    <span className="text-sm text-[#7A9E7E]">
                      {'★'.repeat(r.rating)}
                      <span className="text-[#ddd]">
                        {'★'.repeat(5 - r.rating)}
                      </span>
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-[#555] leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-[#111111] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => {
                const relatedFinalPrice = p.price - p.discount
                return (
                  <Link key={p.id} href={`/products/${p.id}`} className="group">
                    <div className="relative aspect-3/4 bg-[#F5F5F5] overflow-hidden mb-3">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-400"
                        />
                      )}
                    </div>
                    <p className="text-sm text-[#111111] mb-1 group-hover:text-[#7A9E7E] transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#111111]">
                        ₹{relatedFinalPrice.toFixed(0)}
                      </span>
                      {p.discount > 0 && (
                        <span className="text-xs text-[#999] line-through">
                          ₹{p.price}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}