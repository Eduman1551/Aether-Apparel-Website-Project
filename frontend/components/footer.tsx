import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#F5F5F5] border-t border-[#e5e5e5] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-[#111111] tracking-wide">
            AETHER <span className="text-[#7A9E7E]">Apparel</span>
          </h3>
          <p className="text-sm text-[#555] mt-2 leading-relaxed">
            Modern, minimal essentials for everyday living.
          </p>
        </div>

        {/* Shop Links - hidden on mobile */}
        <div className="hidden md:block">
          <h4 className="text-sm font-semibold text-[#111111] mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-[#555]">
            <li>
              <Link href="/products" className="hover:text-[#7A9E7E]">
                All Products
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=new"
                className="hover:text-[#7A9E7E]"
              >
                New Arrivals
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=bestsellers"
                className="hover:text-[#7A9E7E]"
              >
                Best Sellers
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links - hidden on mobile */}
        <div className="hidden md:block">
          <h4 className="text-sm font-semibold text-[#111111] mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-[#555]">
            <li>
              <Link href="/about" className="hover:text-[#7A9E7E]">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#7A9E7E]">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact / Social - always shown, compact on mobile */}
        <div className="flex md:block items-center justify-between md:justify-start gap-4 md:gap-0">
          <ul className="flex md:block gap-4 md:gap-0 md:space-y-2 text-sm text-[#555]">
            <li>
              <a
                href="mailto:hello@aetherapparel.com"
                className="hover:text-[#7A9E7E]"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7A9E7E]"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] py-4 text-center text-xs text-[#777]">
        © {new Date().getFullYear()} Aether Apparel. All rights reserved.
      </div>
    </footer>
  )
}
