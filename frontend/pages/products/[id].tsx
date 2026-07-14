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

export default function ProductDetailPage({
  refreshCartCount
}: ProductDetailProps) {
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
  const [openInfo, setOpenInfo] = useState<string | null>('Description')

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
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 animate-pulse">
          <div>
            <div className="aspect-3/4 bg-[#F5F5F5] rounded-sm mb-4" />
            <div className="flex gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-16 h-20 bg-[#F5F5F5] rounded-sm" />
              ))}
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <div className="h-3 bg-[#F5F5F5] rounded-sm w-1/5" />
            <div className="h-7 bg-[#F5F5F5] rounded-sm w-3/4" />
            <div className="h-4 bg-[#F5F5F5] rounded-sm w-1/4" />
            <div className="h-8 bg-[#F5F5F5] rounded-sm w-1/3" />
            <div className="h-4 bg-[#F5F5F5] rounded-sm w-full mt-6" />
            <div className="h-4 bg-[#F5F5F5] rounded-sm w-5/6" />
            <div className="h-12 bg-[#F5F5F5] rounded-sm mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-28 text-center">
        <p className="text-lg font-semibold text-[#111111] mb-2">
          Product not found
        </p>
        <p className="text-sm text-[#555] mb-8">
          This product may have been removed or the link is incorrect.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#111111] text-white px-8 py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
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

  const infoSections = [
    { label: 'Description', value: product.description },
    { label: 'Material', value: product.material },
    ...(product.care
      ? [{ label: 'Care Instructions', value: product.care }]
      : []),
    { label: 'Delivery', value: 'Estimated delivery in 4–7 business days' },
    { label: 'Returns', value: '7-day easy return policy' }
  ]

  return (
    <>
      <div className="fixed top-20 right-5 z-100 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 pl-4 pr-5 py-3.5 text-sm font-medium rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)] pointer-events-auto animate-slide-in ${
              toast.variant === 'success'
                ? 'bg-[#111111] text-white'
                : toast.variant === 'error'
                  ? 'bg-[#B23B3B] text-white'
                  : 'bg-[#7A9E7E] text-white'
            }`}
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/15 shrink-0">
              {toast.variant === 'success' && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 6L9 17l-5-5"
                  />
                </svg>
              )}
              {toast.variant === 'error' && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              )}
              {toast.variant === 'info' && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 8v4.5M12 16h.01" />
                </svg>
              )}
            </span>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-14">

        <nav className="mb-8 flex items-center gap-2 text-xs text-[#999]">
          <Link href="/" className="hover:text-[#7A9E7E] transition-colors">
            Home
          </Link>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#ccc]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6l6 6-6 6"
            />
          </svg>
          <Link
            href="/products"
            className="hover:text-[#7A9E7E] transition-colors"
          >
            Shop
          </Link>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#ccc]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6l6 6-6 6"
            />
          </svg>
          <span className="text-[#111111] truncate max-w-50">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div className='h-150'>
            <div className="relative aspect-3/4 bg-[#F5F5F5] rounded-sm mb-4 overflow-hidden group">
              {product.images?.[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.stock === 0 && (
                  <span className="bg-[#111111] text-white text-[10px] font-semibold px-2.5 py-1 tracking-wider uppercase">
                    Out of Stock
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#7A9E7E] text-white text-[10px] font-semibold px-2.5 py-1 tracking-wider uppercase">
                    {discountPercent}% Off
                  </span>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative w-16 h-20 bg-[#F5F5F5] rounded-sm overflow-hidden border transition-all ${
                      selectedImage === i
                        ? 'border-[#111111]'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#ccc]'
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
          <div>
            {product.gender && (
              <p className="text-[11px] font-medium text-[#7A9E7E] tracking-[0.25em] uppercase mb-2">
                {product.gender}
              </p>
            )}

            <h1 className="text-2xl md:text-[1.75rem] font-semibold text-[#111111] leading-snug tracking-wide">
              {product.name}
            </h1>
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
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
            <div className="flex items-center gap-3 mt-5">
              <span className="text-2xl font-semibold text-[#111111]">
                ₹{finalPrice.toFixed(0)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm text-[#999] line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-[#7A9E7E] font-semibold bg-[#7A9E7E]/10 px-2 py-1 rounded-sm">
                    Save ₹{product.discount}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  product.stock > 5
                    ? 'bg-[#7A9E7E]'
                    : product.stock > 0
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                }`}
              />
              <p
                className={`text-xs font-medium ${
                  product.stock > 5
                    ? 'text-[#7A9E7E]'
                    : product.stock > 0
                      ? 'text-orange-500'
                      : 'text-red-500'
                }`}
              >
                {product.stock > 5
                  ? `In Stock — ${product.stock} available`
                  : product.stock > 0
                    ? `Only ${product.stock} left!`
                    : 'Out of Stock'}
              </p>
            </div>

            <div className="h-px bg-[#f0f0f0] my-6" />
            <div>
              <p className="text-sm font-medium text-[#111111] mb-3">
                Color
                {selectedColor && (
                  <span className="font-normal text-[#999] ml-1.5">
                    — {selectedColor}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color)
                      setValidationError('')
                    }}
                    className={`flex items-center gap-2 pl-2 pr-4 py-1.5 text-xs border rounded-sm transition-all ${
                      selectedColor === color
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#e0e0e0] text-[#111111] hover:border-[#999]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 shrink-0"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-[#111111] mb-3">Size</p>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size)
                      setValidationError('')
                    }}
                    className={`w-11 h-11 text-xs font-medium border rounded-sm transition-all ${
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
            <div className="mt-6">
              <p className="text-sm font-medium text-[#111111] mb-3">
                Quantity
              </p>
              <div className="inline-flex items-center border border-[#e0e0e0] rounded-sm">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 text-[#111111] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  −
                </button>
                <span className="text-sm text-[#111111] w-10 text-center border-x border-[#e0e0e0] h-10 flex items-center justify-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(q => Math.min(product.stock || 10, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 text-[#111111] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  +
                </button>
              </div>
            </div>
            {validationError && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-4">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 8v4.5M12 16h.01" />
                </svg>
                {validationError}
              </p>
            )}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="w-full mt-6 bg-[#111111] text-white py-4 text-sm font-medium tracking-wide hover:bg-[#7A9E7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              <div className="flex flex-col items-center gap-1.5 py-3 border border-[#f0f0f0] rounded-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7A9E7E"
                  strokeWidth="1.8"
                >
                  <rect x="1" y="7" width="15" height="10" rx="1" />
                  <path d="M16 10h3l3 3v4h-6" />
                  <circle cx="6" cy="18" r="1.6" />
                  <circle cx="17.5" cy="18" r="1.6" />
                </svg>
                <span className="text-[10px] text-[#777] leading-tight">
                  4–7 Day
                  <br />
                  Delivery
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 border border-[#f0f0f0] rounded-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7A9E7E"
                  strokeWidth="1.8"
                >
                  <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                  <path strokeLinecap="round" d="M8 12l2.5 2.5L16 9" />
                </svg>
                <span className="text-[10px] text-[#777] leading-tight">
                  7-Day
                  <br />
                  Returns
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 border border-[#f0f0f0] rounded-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7A9E7E"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="10" width="16" height="10" rx="1.5" />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
                <span className="text-[10px] text-[#777] leading-tight">
                  Secure
                  <br />
                  Checkout
                </span>
              </div>
            </div>
            <div className="mt-8 divide-y divide-[#f0f0f0] border-t border-[#f0f0f0]">
              {infoSections.map(info => {
                const isOpen = openInfo === info.label
                return (
                  <div key={info.label}>
                    <button
                      onClick={() => setOpenInfo(isOpen ? null : info.label)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-sm font-medium text-[#111111]">
                        {info.label}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-[#999] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`grid transition-all duration-200 ease-out ${
                        isOpen
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm text-[#555] leading-relaxed pb-4">
                          {info.value}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
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
            <div className="space-y-5">
              {product.reviews.map(r => (
                <div
                  key={r.id}
                  className="flex gap-4 border-b border-[#f0f0f0] pb-6"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F5F5F5] text-[#7A9E7E] text-xs font-semibold flex items-center justify-center shrink-0">
                    {r.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-[#111111]">
                        {r.user.name}
                      </span>
                      <span className="text-xs text-[#7A9E7E]">
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
                </div>
              ))}
            </div>
          )}
        </div>
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-[#111111] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {related.map(p => {
                const relatedFinalPrice = p.price - p.discount
                const relatedDiscountPercent =
                  p.discount > 0 ? Math.round((p.discount / p.price) * 100) : 0
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-3/4 bg-[#F5F5F5] rounded-sm overflow-hidden mb-3">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                        />
                      )}
                      {relatedDiscountPercent > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-[#7A9E7E] text-white text-[9px] font-semibold px-2 py-1 tracking-wider uppercase">
                          {relatedDiscountPercent}% Off
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#111111] mb-1 leading-snug group-hover:text-[#7A9E7E] transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#111111]">
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
