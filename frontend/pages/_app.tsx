  import '@/styles/globals.css'
  import type { AppProps } from 'next/app'
  import { useRouter } from 'next/router'
  import { useEffect, useState } from 'react'
  import Footer from '../components/footer'
  import Navbar from '../components/navbar'

  export type AppUser = {
    id: string
    name: string
    email: string
    phone?: string | null
    role: string
  }

  export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const [user, setUser] = useState<AppUser | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [cartCount, setCartCount] = useState(0)

    const refreshCartCount = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setCartCount(data.cartItems?.length ?? 0)
        }
      } catch {}
    }

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            credentials: 'include'
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data.user)
            await refreshCartCount()
          } else {
            setUser(null)
          }
        } catch {
          setUser(null)
        } finally {
          setAuthLoading(false)
        }
      }
      checkAuth()
    }, [])

    const handleLogout = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        })
      } catch {}
      setUser(null)
      setCartCount(0)
      router.push('/')
    }

    if (authLoading) {
      return (
        <div className="flex flex-col min-h-screen bg-white">
          <div className="h-16.25 bg-white border-b border-[#e0e0e0] shadow-sm" />
          <main className="flex-1" />
          <div className="h-40 bg-[#F5F5F5] border-t border-[#e5e5e5]" />
        </div>
      )
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          isLoggedIn={!!user}
          cartCount={cartCount}
          onLogout={handleLogout}
        />
        <Component
          {...pageProps}
          user={user}
          setUser={setUser}
          refreshCartCount={refreshCartCount}
        />
        <Footer />
      </div>
    )
  }
