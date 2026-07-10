import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative h-[85vh] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80"
          alt="Aether Apparel Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-wide mb-4">
            Modern Essentials.
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-md mb-8">
            Minimal, premium casual wear designed for everyday life.
          </p>
          <Link
            href="/products"
            className="bg-white text-[#111111] px-8 py-3 text-sm font-medium tracking-wide hover:bg-[#7A9E7E] hover:text-white transition-colors"
          >
            Start Browsing
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto text-center px-6 py-24">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#111111] mb-4">
          Designed to feel effortless.
        </h2>
        <p className="text-[#555] text-sm md:text-base leading-relaxed">
          Every piece we make is built around comfort, quality, and clean design
          — clothing that fits naturally into your everyday life, without the
          noise.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-100 md:h-125">
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80"
            alt="Men's Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-end p-8">
            <h3 className="text-white text-xl font-medium">For Him</h3>
          </div>
        </div>
        <div className="relative h-100 md:h-125">
          <Image
            src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80"
            alt="Women's Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-end p-8">
            <h3 className="text-white text-xl font-medium">For Her</h3>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16 text-center px-6">
        <p className="text-xs tracking-widest text-[#7A9E7E] mb-2 uppercase">
          Limited Time
        </p>
        <h3 className="text-2xl md:text-3xl font-semibold text-[#111111] mb-4">
          Flat 20% Off Sitewide
        </h3>
        <p className="text-sm text-[#555] mb-6">
          No code needed. Discount applied automatically at checkout.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#111111] text-white px-8 py-3 text-sm font-medium hover:bg-[#7A9E7E] transition-colors"
        >
          Shop Now
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-center text-2xl font-semibold text-[#111111] mb-12">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              name: 'Ananya R.',
              text: 'The quality feels premium and the fit is exactly what I look for in casual wear.'
            },
            {
              name: 'Kabir S.',
              text: 'Clean designs, comfortable fabric — my go-to brand for everyday outfits now.'
            },
            {
              name: 'Meera T.',
              text: 'Simple, minimal, and exactly as described. Delivery was quick too.'
            }
          ].map(t => (
            <div key={t.name} className="text-center px-4">
              <p className="text-sm text-[#555] italic mb-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="text-sm font-medium text-[#111111]">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#111111] py-16 px-6 text-center">
        <h3 className="text-white text-xl md:text-2xl font-semibold mb-3">
          Join the Aether Community
        </h3>
        <p className="text-white/70 text-sm mb-6">
          Get updates on new arrivals, sales, and exclusive drops.
        </p>
        <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-auto flex-1 px-4 py-3 text-sm bg-white text-[#111111] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#7A9E7E] text-white px-6 py-3 text-sm font-medium hover:bg-white hover:text-[#111111] transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}
