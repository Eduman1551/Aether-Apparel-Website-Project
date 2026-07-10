import Link from 'next/link'
import { useState } from 'react'

type NavbarProps = {
  isLoggedIn: boolean
  cartCount?: number
  onLogout?: () => void
}

export default function Navbar({
  isLoggedIn,
  cartCount = 0,
  onLogout
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e0e0e0] shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-wide text-[#111111]">
            AETHER
          </span>
          <span className="text-sm text-[#7A9E7E] tracking-widest uppercase">
            Apparel
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#111111]">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="hover:text-[#7A9E7E] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#111111] text-white hover:bg-[#7A9E7E] transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/products"
                className="hover:text-[#7A9E7E] transition-colors"
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="hover:text-[#7A9E7E] transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/cart"
                className="relative hover:text-[#7A9E7E] transition-colors"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#7A9E7E] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className="hover:text-[#7A9E7E] transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={onLogout}
                className="hover:text-[#7A9E7E] transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#111111]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeWidth={1.5}
                strokeLinecap="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeWidth={1.5}
                strokeLinecap="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6 text-sm font-medium text-[#111111] bg-white border-t border-[#F5F5F5]">
          {!isLoggedIn ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link href="/products" onClick={() => setMenuOpen(false)}>
                Products
              </Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
              <button onClick={onLogout} className="text-left">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
