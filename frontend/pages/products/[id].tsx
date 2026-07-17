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
    userId: string
    rating: number
    comment: string | null
    user: { name: string }
  }[]
}

type AppUser = { id: string; name: string; role: string } | null

export default function ProductDetailPage({ user }: { user?: AppUser }) {
  const router = useRouter()
  const { id, from } = router.query
  const backHref = from
    ? `/products?category=${encodeURIComponent(from as string)}`
    : '/products'

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
      )
      const data = await res.json()
      setProduct(data.product)
      setRelated(data.relatedProducts || [])

      if (data.product?.id) {
        const raw = localStorage.getItem('recentlyViewed')
        const viewed: string[] = raw ? JSON.parse(raw) : []
        const updated = [
          data.product.id,
          ...viewed.filter(pid => pid !== data.product.id)
        ].slice(0, 10)
        localStorage.setItem('recentlyViewed', JSON.stringify(updated))
      }
    } catch (err) {
      console.error('Failed to fetch product', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProduct()
    // eslint-disable-next-line 
  }, [id])

  const handleReviewSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setReviewError('')

    if (reviewRating === 0) {
      setReviewError('Please select a star rating.')
      return
    }

    setReviewSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          rating: reviewRating,
          comment: reviewComment || undefined
        })
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setReviewError(data.message || 'Failed to submit review')
        return
      }

      setReviewSubmitted(true)
      setReviewRating(0)
      setReviewComment('')
      fetchProduct()
    } catch {
      setReviewError('Something went wrong. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )
      if (res.ok) {
        fetchProduct()
      }
    } catch (err) {
      console.error('Failed to delete review', err)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - bounds.left) / bounds.width) * 100
    const y = ((e.clientY - bounds.top) / bounds.height) * 100
    setZoomPosition({ x, y })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-[#555]">
        Loading...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-[#555]">
        Product not found.
      </div>
    )
  }

  const finalPrice = product.price - product.discount
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-[#111111] transition-colors mb-6"
      >
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10">
        <div className="md:sticky md:top-24 self-start">
          <div
            className="relative aspect-4/5 bg-[#F5F5F5] mb-3 overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            {product.images?.[selectedImage] && (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                style={{
                  transition: isZooming ? 'none' : 'transform 0.2s ease-out',
                  ...(isZooming
                    ? {
                        transform: 'scale(2)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }
                    : {})
                }}
              />
            )}
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-25 bg-[#F5F5F5] overflow-hidden shrink-0 transition-all ${
                  selectedImage === i
                    ? 'ring-2 ring-[#111111] ring-offset-2'
                    : 'ring-1 ring-[#e0e0e0] hover:ring-[#111111] opacity-80 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${i}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
            {product.gender}
          </p>
          <h1 className="text-xl font-semibold text-[#111111] leading-snug">
            {product.name}
          </h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-[#7A9E7E]">
                {'★'.repeat(Math.round(avgRating))}
              </span>
              <span className="text-xs text-[#999]">
                ({product.reviews.length} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            <span className="text-lg font-medium text-[#111111]">
              ₹{finalPrice.toFixed(0)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-[#999] line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          <p className="text-sm text-[#555] leading-relaxed mt-4">
            {product.description}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium text-[#111111] mb-2">Color</p>
            <div className="flex gap-2">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 text-xs border ${
                    selectedColor === color
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e0e0e0] text-[#111111]'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-[#111111] mb-2">Size</p>
            <div className="flex gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 text-xs border ${
                    selectedSize === size
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e0e0e0] text-[#111111]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-5">
            <div>
              <p className="text-xs font-medium text-[#111111] mb-2">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 border border-[#e0e0e0] text-[#111111]"
                >
                  −
                </button>
                <span className="text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 border border-[#e0e0e0] text-[#111111]"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-xs text-[#7A9E7E] mt-6">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          <button
            disabled={product.stock === 0}
            className="w-full mt-5 bg-[#111111] text-white py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
          >
            Add to Cart
          </button>

          <div className="mt-6 divide-y divide-[#e5e5e5] border-t border-[#e5e5e5]">
            <div className="py-3">
              <p className="text-xs font-medium text-[#111111] mb-1">
                Material
              </p>
              <p className="text-xs text-[#555]">{product.material}</p>
            </div>
            {product.care && (
              <div className="py-3">
                <p className="text-xs font-medium text-[#111111] mb-1">
                  Care Instructions
                </p>
                <p className="text-xs text-[#555]">{product.care}</p>
              </div>
            )}
            <div className="py-3">
              <p className="text-xs font-medium text-[#111111] mb-1">
                Delivery
              </p>
              <p className="text-xs text-[#555]">
                Estimated delivery: 4–7 business days
              </p>
            </div>
            <div className="py-3">
              <p className="text-xs font-medium text-[#111111] mb-1">Returns</p>
              <p className="text-xs text-[#555]">7-day easy return policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="text-lg font-semibold text-[#111111] mb-5">
          Customer Reviews{' '}
          {product.reviews.length > 0 && `(${product.reviews.length})`}
        </h2>

        <div className="border border-[#e5e5e5] p-5 mb-8">
          <h3 className="text-sm font-semibold text-[#111111] mb-3">
            Write a Review
          </h3>

          {reviewSubmitted ? (
            <p className="text-sm text-[#7A9E7E]">
              Thank you! Your review has been submitted.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <p className="text-xs text-[#555] mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-xl leading-none ${
                        star <= reviewRating
                          ? 'text-[#7A9E7E]'
                          : 'text-[#e0e0e0]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#555] mb-2">
                  Your Review (optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
                />
              </div>

              {reviewError && (
                <p className="text-sm text-red-600">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-[#111111] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-sm text-[#555]">No reviews yet.</p>
        ) : (
          <div className="space-y-5">
            {product.reviews.map(r => (
              <div key={r.id} className="border-b border-[#e5e5e5] pb-5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A9E7E] text-sm">
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className="text-sm font-medium text-[#111111]">
                      {r.user.name}
                    </span>
                  </div>
                  {user && (user.id === r.userId || user.role === 'ADMIN') && (
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-[#555]">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-semibold text-[#111111] mb-5">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="relative aspect-3/4 bg-[#F5F5F5] overflow-hidden">
                  {p.images?.[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <p className="text-sm text-[#111111] mt-2">{p.name}</p>
                <p className="text-sm font-medium text-[#111111]">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
