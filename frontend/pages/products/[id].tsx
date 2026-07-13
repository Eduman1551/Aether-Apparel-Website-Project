import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  material: string;
  care: string | null;
  price: number;
  discount: number;
  gender: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  reviews: { id: string; rating: number; comment: string | null; user: { name: string } }[];
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        const data = await res.json();
        setProduct(data.product);
        setRelated(data.relatedProducts || []);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-[#555]">Loading...</div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-[#555]">Product not found.</div>;
  }

  const finalPrice = product.price - product.discount;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-3/4 bg-[#F5F5F5] mb-4">
            {product.images?.[selectedImage] && (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-16 h-20 bg-[#F5F5F5] border ${
                  selectedImage === i ? "border-[#111111]" : "border-transparent"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">{product.name}</h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-[#7A9E7E]">{"★".repeat(Math.round(avgRating))}</span>
              <span className="text-xs text-[#999]">({product.reviews.length} reviews)</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <span className="text-xl font-medium text-[#111111]">₹{finalPrice.toFixed(0)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-[#999] line-through">₹{product.price}</span>
            )}
          </div>

          {/* Colors */}
          <div className="mt-6">
            <p className="text-sm font-medium text-[#111111] mb-2">Color</p>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 text-xs border ${
                    selectedColor === color
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#e0e0e0] text-[#111111]"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-6">
            <p className="text-sm font-medium text-[#111111] mb-2">Size</p>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 text-xs border ${
                    selectedSize === size
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#e0e0e0] text-[#111111]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <p className="text-sm font-medium text-[#111111] mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 border border-[#e0e0e0] text-[#111111]"
              >
                −
              </button>
              <span className="text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 border border-[#e0e0e0] text-[#111111]"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock indicator */}
          <p className="text-xs text-[#7A9E7E] mt-4">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Add to Cart */}
          <button
            disabled={product.stock === 0}
            className="w-full mt-6 bg-[#111111] text-white py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
          >
            Add to Cart
          </button>

          {/* Description */}
          <div className="mt-10 space-y-4 text-sm text-[#555]">
            <div>
              <p className="font-medium text-[#111111] mb-1">Description</p>
              <p>{product.description}</p>
            </div>
            <div>
              <p className="font-medium text-[#111111] mb-1">Material</p>
              <p>{product.material}</p>
            </div>
            {product.care && (
              <div>
                <p className="font-medium text-[#111111] mb-1">Care Instructions</p>
                <p>{product.care}</p>
              </div>
            )}
            <div>
              <p className="font-medium text-[#111111] mb-1">Delivery</p>
              <p>Estimated delivery: 4–7 business days</p>
            </div>
            <div>
              <p className="font-medium text-[#111111] mb-1">Returns</p>
              <p>7-day easy return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-20 max-w-2xl">
        <h2 className="text-xl font-semibold text-[#111111] mb-6">
          Customer Reviews {product.reviews.length > 0 && `(${product.reviews.length})`}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-[#555]">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-[#e5e5e5] pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#7A9E7E] text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="text-sm font-medium text-[#111111]">{r.user.name}</span>
                </div>
                {r.comment && <p className="text-sm text-[#555]">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold text-[#111111] mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="relative aspect-3/4 bg-[#F5F5F5] overflow-hidden">
                  {p.images?.[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
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
  );
}