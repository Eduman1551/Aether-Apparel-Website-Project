import Link from 'next/link'

const ICON = {
  mailGray: 'https://img.icons8.com/ios-filled/50/999999/mail.png',
  mailWhite: 'https://img.icons8.com/ios-filled/50/ffffff/mail.png',
  instaGray: 'https://img.icons8.com/ios-filled/50/999999/instagram-new.png',
  instaWhite: 'https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png'
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#F5F5F5] border-t border-[#e5e5e5] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-[#111111] tracking-wide">
            AETHER <span className="text-[#7A9E7E]">Apparel</span>
          </h3>
          <p className="text-sm text-[#555] mt-3 leading-relaxed max-w-55">
            Modern, minimal essentials for everyday living.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-6">
            <a
              href="mailto:hello@aetherapparel.com"
              aria-label="Email us"
              className="group relative flex items-center justify-center w-9 h-9 rounded-full border border-[#d8d8d8] bg-white transition-all duration-300 hover:border-[#7A9E7E] hover:bg-[#7A9E7E] hover:-translate-y-0.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ICON.mailGray}
                alt=""
                width={16}
                height={16}
                className="absolute transition-opacity duration-200 group-hover:opacity-0"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ICON.mailWhite}
                alt=""
                width={16}
                height={16}
                className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="group relative flex items-center justify-center w-9 h-9 rounded-full border border-[#d8d8d8] bg-white transition-all duration-300 hover:border-[#7A9E7E] hover:bg-[#7A9E7E] hover:-translate-y-0.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ICON.instaGray}
                alt=""
                width={16}
                height={16}
                className="absolute transition-opacity duration-200 group-hover:opacity-0"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ICON.instaWhite}
                alt=""
                width={16}
                height={16}
                className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>

        {/* Shop Links - hidden on mobile */}
        <div className="hidden md:block">
          <h4 className="text-xs font-semibold text-[#111111] mb-5 tracking-[0.15em] uppercase">
            Shop
          </h4>
          <ul className="space-y-3 text-sm text-[#555]">
            <li>
              <Link
                href="/products"
                className="inline-block transition-all duration-200 hover:text-[#7A9E7E] hover:translate-x-0.5"
              >
                All Products
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=new"
                className="inline-block transition-all duration-200 hover:text-[#7A9E7E] hover:translate-x-0.5"
              >
                New Arrivals
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=bestsellers"
                className="inline-block transition-all duration-200 hover:text-[#7A9E7E] hover:translate-x-0.5"
              >
                Best Sellers
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links - hidden on mobile */}
        <div className="hidden md:block">
          <h4 className="text-xs font-semibold text-[#111111] mb-5 tracking-[0.15em] uppercase">
            Company
          </h4>
          <ul className="space-y-3 text-sm text-[#555]">
            <li>
              <Link
                href="/about"
                className="inline-block transition-all duration-200 hover:text-[#7A9E7E] hover:translate-x-0.5"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="inline-block transition-all duration-200 hover:text-[#7A9E7E] hover:translate-x-0.5"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact - always shown */}
        <div className="hidden md:blockw">
          <h4 className="text-xs font-semibold text-[#111111] mb-5 tracking-[0.15em] uppercase">
            Get in Touch
          </h4>
          <ul className="space-y-3 text-sm text-[#555]">
            <li>
              <a
                href="mailto:hello@aetherapparel.com"
                className="group flex items-center gap-2.5 transition-colors duration-200 hover:text-[#7A9E7E]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ICON.mailGray}
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                />
                hello@aetherapparel.com
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 transition-colors duration-200 hover:text-[#7A9E7E]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ICON.instaGray}
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                />
                @aetherapparel
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#777]">
          <p>
            © {new Date().getFullYear()} Aether Apparel. All rights reserved.
          </p>
          <p className="text-[#999] tracking-wide">Designed with care.</p>
        </div>
      </div>
    </footer>
  )
}
