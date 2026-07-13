import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => router.pathname === href

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`relative py-1 transition-colors ${
        isActive(href) ? 'text-[#111111]' : 'text-[#555] hover:text-[#111111]'
      }`}
    >
      {label}
      <span
        className={`absolute left-0 -bottom-1 h-[1.5px] bg-[#7A9E7E] transition-all duration-300 ${
          isActive(href) ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-[#e5e5e5]">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative w-9 h-9 rounded-full bg-[#111111] flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-white text-sm font-semibold tracking-tight">
              A
            </span>
            <span className="absolute inset-0 bg-[#7A9E7E] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">
              <span className="text-white text-sm font-semibold tracking-tight">
                A
              </span>
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-wide text-[#111111]">
              AETHER
            </span>
            <span className="text-[9px] text-[#7A9E7E] tracking-[0.25em] uppercase">
              Apparel
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-9 text-sm font-medium">
          {!isLoggedIn ? (
            <>
              <div className="group">{navLink('/about', 'About')}</div>
              <div className="group">{navLink('/contact', 'Contact')}</div>
              <Link
                href="/login"
                className="text-[#555] hover:text-[#111111] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="relative px-5 py-2.5 bg-[#111111] text-white overflow-hidden group/btn"
              >
                <span className="relative z-10">Register</span>
                <span className="absolute inset-0 bg-[#7A9E7E] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
              </Link>
            </>
          ) : (
            <>
              <div className="group">{navLink('/products', 'Products')}</div>
              <div className="group">{navLink('/about', 'About')}</div>
              <div className="group">{navLink('/contact', 'Contact')}</div>

              <Link
                href="/cart"
                className="relative text-[#555] hover:text-[#111111] transition-colors"
                aria-label="Cart"
              >
                <svg
                  className="w-5.5 h-5.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#7A9E7E] text-white text-[10px] font-medium rounded-full min-w-4.25 h-4.25 px-1 flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(prev => !prev)}
                  className="flex items-center gap-1.5 text-[#555] hover:text-[#111111] transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-[#F5F5F5] border border-[#e5e5e5] flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`absolute right-0 mt-3 w-44 bg-white border border-[#e5e5e5] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-200 origin-top-right ${
                    accountOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <Link
                    href="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-3 text-sm text-[#111111] hover:bg-[#F5F5F5] transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setAccountOpen(false)
                      onLogout?.()
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-[#B23B3B] hover:bg-[#F5F5F5] transition-colors border-t border-[#e5e5e5]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile: cart + menu button */}
        <div className="flex items-center gap-4 md:hidden">
          {isLoggedIn && (
            <Link
              href="/cart"
              className="relative text-[#111111]"
              aria-label="Cart"
            >
              <svg
                className="w-5.5 h-5.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#7A9E7E] text-white text-[10px] font-medium rounded-full min-w-4.25 h-4.25 px-1 flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button
            className="text-[#111111] w-8 h-8 flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out bg-white border-t border-[#e5e5e5] ${
          menuOpen ? 'max-h-105' : 'max-h-0 border-t-0'
        }`}
      >
        <div className="flex flex-col text-sm font-medium text-[#111111]">
          {!isLoggedIn ? (
            <>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                Contact
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="mx-6 my-4 text-center bg-[#111111] text-white py-3"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                Products
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                Contact
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 border-b border-[#F5F5F5]"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onLogout?.()
                }}
                className="text-left px-6 py-3.5 text-[#B23B3B]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
